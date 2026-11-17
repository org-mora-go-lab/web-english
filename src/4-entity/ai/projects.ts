import "server-only";

import { randomUUID } from "node:crypto";

import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "@/src/5-shared/db";

import { getAiConversation } from "./history";
import { AiError } from "./server";
import type { AiProject } from "./type";

const projects = schema.aiProjects;
const conversations = schema.aiConversations;
const projectSchema = z.strictObject({ name: z.string().trim().min(1).max(60) });
const assignmentSchema = z.strictObject({ projectId: z.uuid().nullable() });
const missing = () => new AiError("프로젝트를 찾을 수 없습니다.", 404, "PROJECT_NOT_FOUND");
const duplicate = () => new AiError("같은 이름의 프로젝트가 있어요. 다른 이름을 입력해 주세요.", 409, "PROJECT_NAME_EXISTS");
const projectView = (row: typeof projects.$inferSelect): AiProject => ({ id: row.id, name: row.name, createdAt: row.createdAt, updatedAt: row.updatedAt });

export async function readProjectInput(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json") throw new AiError("JSON 요청이 필요합니다.", 415, "INVALID_CONTENT_TYPE");
  const reader = request.body?.getReader();
  if (!reader) throw new AiError("프로젝트 내용을 확인해 주세요.", 400, "INVALID_REQUEST");
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let body = ""; let bytes = 0;
  try {
    while (true) {
      const next = await reader.read(); if (next.done) break;
      bytes += next.value.byteLength;
      if (bytes > 1024) { await reader.cancel(); throw new AiError("요청이 너무 큽니다.", 413, "REQUEST_TOO_LARGE"); }
      body += decoder.decode(next.value, { stream: true });
    }
    return JSON.parse(body + decoder.decode()) as unknown;
  } catch (error) {
    if (error instanceof AiError) throw error;
    throw new AiError("프로젝트 내용을 확인해 주세요.", 400, "INVALID_REQUEST");
  } finally { reader.releaseLock(); }
}

function projectName(input: unknown) {
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) throw new AiError("프로젝트 이름은 1~60자로 입력해 주세요.", 400, "INVALID_PROJECT_NAME");
  return parsed.data.name;
}

export async function listAiProjects(userId: string) {
  const rows = await getDb().select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
  return rows.map(projectView);
}

export async function createAiProject(userId: string, input: unknown) {
  const name = projectName(input);
  const now = Date.now();
  const row = await getDb().transaction(async tx => {
    const [{ count }] = await tx.select({ count: sql<number>`count(*)` }).from(projects).where(eq(projects.userId, userId));
    if (count >= 100) throw new AiError("프로젝트는 100개까지 만들 수 있어요.", 409, "PROJECT_LIMIT");
    const rows = await tx.insert(projects).values({ id: randomUUID(), userId, name, createdAt: now, updatedAt: now }).onConflictDoNothing().returning();
    if (!rows[0]) throw duplicate();
    return rows[0];
  });
  return projectView(row);
}

export async function renameAiProject(userId: string, id: string, input: unknown) {
  const name = projectName(input);
  const row = await getDb().transaction(async tx => {
    const owned = await tx.query.aiProjects.findFirst({ where: and(eq(projects.id, id), eq(projects.userId, userId)) });
    if (!owned) throw missing();
    const sameName = await tx.query.aiProjects.findFirst({ where: and(eq(projects.userId, userId), eq(projects.name, name)) });
    if (sameName && sameName.id !== id) throw duplicate();
    const updated = await tx.update(projects).set({ name, updatedAt: Date.now() }).where(and(eq(projects.id, id), eq(projects.userId, userId))).returning();
    if (!updated[0]) throw missing();
    return updated[0];
  });
  return projectView(row);
}

export async function deleteAiProject(userId: string, id: string) {
  await getDb().transaction(async tx => {
    const owned = await tx.query.aiProjects.findFirst({ where: and(eq(projects.id, id), eq(projects.userId, userId)) });
    if (!owned) throw missing();
    // Keep the conversation and its message revision when removing only its container.
    await tx.update(conversations).set({ projectId: null }).where(and(eq(conversations.userId, userId), eq(conversations.projectId, id)));
    await tx.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, userId)));
  });
}

export async function assignAiConversationProject(userId: string, id: string, input: unknown) {
  const parsed = assignmentSchema.safeParse(input);
  if (!parsed.success) throw new AiError("프로젝트를 확인해 주세요.", 400, "INVALID_PROJECT");
  await getDb().transaction(async tx => {
    const conversation = await tx.query.aiConversations.findFirst({ where: and(eq(conversations.id, id), eq(conversations.userId, userId)) });
    if (!conversation) throw new AiError("대화를 찾을 수 없습니다.", 404, "CONVERSATION_NOT_FOUND");
    if (parsed.data.projectId) {
      const project = await tx.query.aiProjects.findFirst({ where: and(eq(projects.id, parsed.data.projectId), eq(projects.userId, userId)) });
      if (!project) throw missing();
    }
    await tx.update(conversations).set({ projectId: parsed.data.projectId }).where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
  });
  return getAiConversation(userId, id);
}
