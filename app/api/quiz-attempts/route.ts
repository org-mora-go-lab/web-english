import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { getActor } from "@/src/4-entity/account";
import type { ContentNode } from "@/src/4-entity/post";
import { getPost, mayRead } from "@/src/4-entity/post/server";
import { getDb, schema } from "@/src/5-shared/db";
import { jsonError, sameOrigin } from "@/src/5-shared/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("요청 출처가 올바르지 않습니다.", 403);
  const actor = await getActor();
  if (!actor) return jsonError("로그인이 필요합니다.", 401);
  const parsed = z.object({ postId: z.string().uuid(), questionId: z.number().int().nonnegative().max(100), answer: z.string().max(1000) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("답안을 확인해 주세요.");
  const post = await getPost(parsed.data.postId);
  if (!post || !mayRead(post, actor)) return jsonError("콘텐츠를 찾을 수 없습니다.", 404);
  const questions: ContentNode[] = [];
  function walk(node: ContentNode) { if (node.type === "quiz") questions.push(node); node.content?.forEach(walk); }
  (JSON.parse(post.contentJson) as { content: ContentNode[] }).content.forEach(walk);
  const question = questions[parsed.data.questionId];
  if (!question) return jsonError("문제를 찾을 수 없습니다.", 404);
  const isCorrect = parsed.data.answer.trim().toLowerCase() === (question.attrs?.answer ?? "").trim().toLowerCase();
  await getDb().insert(schema.quizAttempts).values({ id: randomUUID(), userId: actor.id, postId: post.id, questionId: String(parsed.data.questionId), submittedAnswer: parsed.data.answer, isCorrect, createdAt: Date.now() });
  return Response.json({ isCorrect });
}

export async function GET() {
  const actor = await getActor();
  if (!actor) return jsonError("로그인이 필요합니다.", 401);
  const attempts = await getDb().query.quizAttempts.findMany({ where: eq(schema.quizAttempts.userId, actor.id) });
  return Response.json({ attempts });
}
