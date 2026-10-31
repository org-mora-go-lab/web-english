import "server-only";

import { createHmac, randomBytes, randomUUID } from "node:crypto";

import argon2 from "argon2";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "@/src/5-shared/db";

const emailSchema = z.email().max(254).transform((value) => value.trim().toLowerCase());
const passwordSchema = z.string().min(12).max(128).regex(/[a-z]/i).regex(/\d/).regex(/[^a-z\d]/i);

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  passwordConfirmation: z.string(),
  displayName: z.string().trim().min(2).max(40),
}).refine((value) => value.password === value.passwordConfirmation, { path: ["passwordConfirmation"], message: "비밀번호가 일치하지 않습니다." });

export const passwordChangeSchema = z.object({
  currentPassword: z.string(),
  newPassword: passwordSchema,
});

export function normalizeEmail(value: string) {
  return emailSchema.parse(value);
}

export function publicUser(user: typeof schema.users.$inferSelect) {
  return { id: user.id, email: user.kakaoId ? null : user.email, displayName: user.displayName, profileImageUrl: user.profileImageUrl, provider: user.kakaoId ? "kakao" : "credentials", role: user.role, status: user.status };
}

function kakaoImage(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!(["https:", "http:"].includes(url.protocol) && (url.hostname === "kakaocdn.net" || url.hostname.endsWith(".kakaocdn.net")))) return null;
    url.protocol = "https:";
    return url.toString();
  } catch { return null; }
}

export async function upsertKakaoUser(kakaoId: string, name: string | null | undefined, image: string | null | undefined) {
  if (!/^\d{1,24}$/.test(kakaoId)) throw new Error("Invalid Kakao account ID");
  const db = getDb();
  const now = Date.now();
  const displayName = name?.trim().slice(0, 40) || "카카오 사용자";
  const profileImageUrl = kakaoImage(image);
  const existing = await db.query.users.findFirst({ where: eq(schema.users.kakaoId, kakaoId) });
  if (existing) {
    if (existing.status !== "active") throw new Error("Account is disabled");
    await db.update(schema.users).set({ displayName, profileImageUrl, updatedAt: now }).where(eq(schema.users.id, existing.id));
    return { ...existing, displayName, profileImageUrl };
  }
  const syntheticEmail = `kakao-${kakaoId}@oauth.web-english.invalid`;
  await db.insert(schema.users).values({
    id: randomUUID(), email: syntheticEmail, displayName,
    passwordHash: await hashPassword(randomBytes(32).toString("hex")),
    kakaoId, profileImageUrl, role: "user", status: "active", createdAt: now, updatedAt: now,
  }).onConflictDoNothing();
  const user = await db.query.users.findFirst({ where: eq(schema.users.kakaoId, kakaoId) });
  if (!user || user.status !== "active") throw new Error("Kakao account could not be created");
  return user;
}

export async function findUserByEmail(email: string) {
  return getDb().query.users.findFirst({ where: eq(schema.users.email, email) });
}

export async function findUserById(id: string) {
  return getDb().query.users.findFirst({ where: eq(schema.users.id, id) });
}

export async function hashPassword(password: string) {
  return argon2.hash(password, { type: argon2.argon2id, memoryCost: 19_456, timeCost: 2, parallelism: 1 });
}

export async function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}

export async function checkRateLimit(request: Request, action: string, identifier: string, limit: number, windowMs: number) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required");
  const ip = request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = createHmac("sha256", secret).update(`${action}:${ip}:${identifier}`).digest("hex");
  const now = Date.now();
  await getDb().run(sql`INSERT INTO rate_limits (key, count, expires_at) VALUES (${key}, 1, ${now + windowMs})
    ON CONFLICT(key) DO UPDATE SET
      count = CASE WHEN expires_at <= ${now} THEN 1 ELSE count + 1 END,
      expires_at = CASE WHEN expires_at <= ${now} THEN ${now + windowMs} ELSE expires_at END`);
  const row = await getDb().query.rateLimits.findFirst({ where: eq(schema.rateLimits.key, key) });
  return (row?.count ?? 0) <= limit;
}

export async function register(input: z.infer<typeof signupSchema>) {
  const db = getDb();
  const existing = await findUserByEmail(input.email);
  if (existing?.status === "active" || existing?.status === "disabled") return;
  const now = Date.now();
  if (!existing) {
    await db.insert(schema.users).values({
      id: randomUUID(), email: input.email, displayName: input.displayName,
      passwordHash: await hashPassword(input.password), role: "user", status: "active",
      createdAt: now, updatedAt: now,
    }).onConflictDoNothing();
  } else {
    await db.update(schema.users).set({ displayName: input.displayName, passwordHash: await hashPassword(input.password), status: "active", updatedAt: now }).where(eq(schema.users.id, existing.id));
  }
}

export async function changeEmail(userId: string, currentPassword: string, email: string) {
  const user = await findUserById(userId);
  if (!user || !(await verifyPassword(user.passwordHash, currentPassword))) return "invalid_password" as const;
  if (email === user.email) return "ok" as const;
  if (await findUserByEmail(email)) return "unavailable" as const;
  const changed = await getDb().update(schema.users).set({ email, emailVerifiedAt: null, updatedAt: Date.now(), sessionVersion: user.sessionVersion + 1 }).where(eq(schema.users.id, userId)).returning({ id: schema.users.id });
  return changed.length ? "ok" as const : "unavailable" as const;
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await findUserById(userId);
  if (!user || !(await verifyPassword(user.passwordHash, currentPassword))) return false;
  await getDb().update(schema.users).set({ passwordHash: await hashPassword(newPassword), updatedAt: Date.now(), sessionVersion: user.sessionVersion + 1 }).where(eq(schema.users.id, userId));
  return true;
}
