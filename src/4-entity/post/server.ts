import "server-only";

import { randomUUID } from "node:crypto";

import { and, desc, eq, like, or } from "drizzle-orm";

import { getDb, schema } from "@/src/5-shared/db";

import { parsePostInput } from "./content";

type Actor = typeof schema.users.$inferSelect | null;
type Post = typeof schema.posts.$inferSelect;

export function mayRead(post: Post, actor: Actor) {
  return (post.status === "published" && post.visibility === "public") || actor?.id === post.authorId || actor?.role === "admin";
}

export function mayEdit(post: Post, actor: Actor) {
  return Boolean(actor && (actor.id === post.authorId || actor.role === "admin"));
}

export async function getPost(id: string) {
  return getDb().query.posts.findFirst({ where: eq(schema.posts.id, id) });
}

export async function getPostBySlug(slug: string) {
  return getDb().query.posts.findFirst({ where: eq(schema.posts.slug, slug) });
}

export async function listPosts(scope: "public" | "mine" | "all", actor: Actor, query = "") {
  const base = scope === "mine" && actor ? eq(schema.posts.authorId, actor.id)
    : scope === "all" && actor?.role === "admin" ? undefined
    : and(eq(schema.posts.status, "published"), eq(schema.posts.visibility, "public"));
  const search = query.trim() ? or(like(schema.posts.title, `%${query.trim()}%`), like(schema.posts.contentText, `%${query.trim()}%`)) : undefined;
  const rows = await getDb().select().from(schema.posts).where(and(base, search)).orderBy(desc(schema.posts.updatedAt)).limit(100);
  return rows.map((row) => ({ id: row.id, authorId: row.authorId, slug: row.slug, title: row.title, summary: row.summary, coverImageUrl: row.coverImageUrl, categoryId: row.categoryId, level: row.level, source: row.source, status: row.status, visibility: row.visibility, publishedAt: row.publishedAt, version: row.version, createdAt: row.createdAt, updatedAt: row.updatedAt }));
}

async function ensureCategory(name: string) {
  if (!name) return null;
  const slug = name.toLowerCase().replace(/\s+/g, "-").slice(0, 80);
  const db = getDb();
  await db.insert(schema.categories).values({ id: randomUUID(), name, slug }).onConflictDoNothing();
  return (await db.query.categories.findFirst({ where: eq(schema.categories.slug, slug) }))?.id ?? null;
}

async function setTags(postId: string, names: string[]) {
  const db = getDb();
  await db.delete(schema.postTags).where(eq(schema.postTags.postId, postId));
  for (const name of [...new Set(names)]) {
    const slug = name.toLowerCase().replace(/\s+/g, "-").slice(0, 80);
    await db.insert(schema.tags).values({ id: randomUUID(), name, slug }).onConflictDoNothing();
    const tag = await db.query.tags.findFirst({ where: eq(schema.tags.slug, slug) });
    if (tag) await db.insert(schema.postTags).values({ postId, tagId: tag.id }).onConflictDoNothing();
  }
}

async function validateMediaReferences(contentJson: string, coverImageUrl: string | null | undefined, ownerId: string, actor: NonNullable<Actor>) {
  const references = new Set<string>();
  const pattern = /\/api\/media\/([0-9a-f-]{36})\/file/g;
  for (const match of contentJson.matchAll(pattern)) references.add(match[1]);
  for (const match of (coverImageUrl ?? "").matchAll(pattern)) references.add(match[1]);
  for (const id of references) {
    const asset = await getDb().query.mediaAssets.findFirst({ where: eq(schema.mediaAssets.id, id) });
    if (!asset || (asset.ownerId !== ownerId && asset.ownerId !== actor.id)) throw new Error("이미지 접근 권한이 없습니다.");
  }
}

export async function getPostDetails(post: Post) {
  const db = getDb();
  const author = await db.query.users.findFirst({ where: eq(schema.users.id, post.authorId) });
  const category = post.categoryId ? await db.query.categories.findFirst({ where: eq(schema.categories.id, post.categoryId) }) : null;
  const links = await db.select({ name: schema.tags.name }).from(schema.postTags).innerJoin(schema.tags, eq(schema.postTags.tagId, schema.tags.id)).where(eq(schema.postTags.postId, post.id));
  return { ...post, authorName: author?.displayName ?? "탈퇴한 회원", category: category?.name ?? "", tags: links.map((link) => link.name), contentJson: JSON.parse(post.contentJson) };
}

export async function createPost(actor: NonNullable<Actor>, raw: unknown, source: "member" | "paul" | "import" = "member") {
  const input = parsePostInput(raw);
  await validateMediaReferences(input.contentJson, input.coverImageUrl, actor.id, actor);
  const db = getDb();
  const now = Date.now();
  const id = randomUUID();
  const slugBase = input.title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "post";
  const slug = `${slugBase}-${id.slice(0, 8)}`;
  const categoryId = await ensureCategory(input.category);
  await db.insert(schema.posts).values({ id, authorId: actor.id, slug, title: input.title, summary: input.summary, contentJson: input.contentJson, contentText: input.contentText, coverImageUrl: input.coverImageUrl, categoryId, level: input.level, visibility: input.visibility, source, status: "draft", createdAt: now, updatedAt: now });
  await db.insert(schema.postRevisions).values({ id: randomUUID(), postId: id, contentJson: input.contentJson, version: 1, createdAt: now });
  await setTags(id, input.tags);
  return (await getPost(id))!;
}

export async function updatePost(post: Post, raw: unknown, actor: NonNullable<Actor>) {
  const input = parsePostInput(raw);
  await validateMediaReferences(input.contentJson, input.coverImageUrl, post.authorId, actor);
  if (input.version !== post.version) return null;
  const db = getDb();
  const now = Date.now();
  const categoryId = await ensureCategory(input.category);
  const changed = await db.update(schema.posts).set({ title: input.title, summary: input.summary, contentJson: input.contentJson, contentText: input.contentText, coverImageUrl: input.coverImageUrl, categoryId, level: input.level, visibility: input.visibility, version: post.version + 1, updatedAt: now }).where(and(eq(schema.posts.id, post.id), eq(schema.posts.version, post.version))).returning();
  if (!changed.length) return null;
  await db.insert(schema.postRevisions).values({ id: randomUUID(), postId: post.id, contentJson: input.contentJson, version: post.version + 1, createdAt: now });
  await setTags(post.id, input.tags);
  return changed[0];
}

export async function publishPost(post: Post, publish: boolean) {
  const now = Date.now();
  const changed = await getDb().update(schema.posts).set({ status: publish ? "published" : "draft", publishedAt: publish ? now : null, updatedAt: now }).where(eq(schema.posts.id, post.id)).returning();
  return changed[0];
}
