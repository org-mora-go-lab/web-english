import "server-only";

import { createHmac } from "node:crypto";

import { sql } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/src/5-shared/db";
import { readServerEvents } from "@/src/5-shared/http";

import { AI_MODELS } from "./constant";
import type { AiChatInput, AiChatReply, AiModelList } from "./type";
import { partialReply } from "./util";

const MAX_BODY_BYTES = 64 * 1024;
const UPSTREAM_TIMEOUT_MS = 45_000;

const chatSchema = z.strictObject({
  conversationId: z.uuid().optional(),
  revision: z.number().int().min(0).max(100).optional(),
  turnId: z.uuid().optional(),
  model: z.string().min(1).max(80),
  mode: z.enum(["parent", "practice"]),
  messages: z.array(z.strictObject({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(2_000),
  })).min(1).max(20),
}).refine(({ messages }) => (
  messages.reduce((total, message) => total + message.content.length, 0) <= 12_000
  && messages.every((message, index) => message.role === (index % 2 === 0 ? "user" : "assistant"))
  && messages.at(-1)?.role === "user"
)).refine(value => [value.conversationId, value.revision, value.turnId].every(item => item === undefined)
  || [value.conversationId, value.revision, value.turnId].every(item => item !== undefined));

const responseSchema = z.object({
  status: z.string(),
  output: z.array(z.object({
    type: z.string(),
    content: z.array(z.object({
      type: z.string(),
      text: z.string().optional(),
      refusal: z.string().optional(),
    })).optional(),
  })),
});

export class AiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly retryAfter?: number,
  ) {
    super(message);
    this.name = "AiError";
  }
}

export function aiErrorResponse(error: unknown) {
  const safe = error instanceof AiError
    ? error
    : new AiError("AI 서비스에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.", 503, "SERVICE_UNAVAILABLE");
  return Response.json({ error: safe.message, code: safe.code }, {
    status: safe.status,
    headers: {
      "Cache-Control": "no-store",
      ...(safe.retryAfter ? { "Retry-After": String(safe.retryAfter) } : {}),
    },
  });
}

export function getAiModelList(): AiModelList {
  const configuredModels = process.env.OPENAI_ALLOWED_MODELS?.trim();
  const allowed = configuredModels ? new Set(configuredModels.split(",").map((model) => model.trim())) : null;
  const models = AI_MODELS.filter((model) => !allowed || allowed.has(model.id)).map((model) => ({ ...model }));
  return {
    models,
    defaultModel: models[0]?.id ?? "",
    configured: Boolean(process.env.OPENAI_API_KEY?.trim()) && models.length > 0,
  };
}

export function parseAiChatInput(value: unknown): AiChatInput {
  const result = chatSchema.safeParse(value);
  if (!result.success) {
    throw new AiError("메시지 형식을 확인해 주세요. 메시지는 2,000자, 대화는 12,000자까지 보낼 수 있습니다.", 400, "INVALID_REQUEST");
  }
  if (!getAiModelList().models.some((model) => model.id === result.data.model)) {
    throw new AiError("현재 사용할 수 없는 모델입니다. 다른 모델을 선택해 주세요.", 400, "MODEL_NOT_ALLOWED");
  }
  return result.data;
}

export async function readAiChatInput(request: Request): Promise<AiChatInput> {
  if (request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json") {
    throw new AiError("JSON 형식의 요청이 필요합니다.", 415, "UNSUPPORTED_MEDIA_TYPE");
  }
  const tooLarge = () => new AiError("요청이 너무 큽니다. 대화를 줄여서 다시 시도해 주세요.", 413, "REQUEST_TOO_LARGE");
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) throw tooLarge();
  if (!request.body) throw new AiError("메시지를 입력해 주세요.", 400, "INVALID_REQUEST");
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let size = 0;
  let body = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw tooLarge();
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
    return parseAiChatInput(JSON.parse(body));
  } catch (error) {
    if (error instanceof AiError) throw error;
    throw new AiError("메시지 형식을 확인해 주세요.", 400, "INVALID_REQUEST");
  } finally {
    reader.releaseLock();
  }
}

export function requireAiConfiguration() {
  if (!getAiModelList().configured) {
    throw new AiError("AI 연결을 준비하고 있습니다. 설정이 완료되면 사용할 수 있어요.", 503, "NOT_CONFIGURED");
  }
}

function globalDailyLimit() {
  const configured = Number(process.env.OPENAI_GLOBAL_DAILY_LIMIT ?? "100");
  return Number.isInteger(configured) && configured > 0 && configured <= 1_000 ? configured : 100;
}

export async function reserveAiRequest(accountId: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new AiError("AI 서비스 설정을 확인하고 있습니다.", 503, "SERVICE_UNAVAILABLE");
  const now = Date.now();
  const windows = [
    { id: `account-minute:${accountId}`, limit: 5, duration: 60_000 },
    { id: `account-day:${accountId}`, limit: 30, duration: 86_400_000 },
    { id: "site-day", limit: globalDailyLimit(), duration: 86_400_000 },
  ].map((window) => ({ ...window, key: `ai:${createHmac("sha256", secret).update(window.id).digest("hex")}` }));
  const values = sql.join(windows.map((window) => sql`(${window.key}, ${window.limit}, ${window.duration})`), sql`, `);
  // One SQLite statement checks every window and reserves all three or none.
  // Materializing eligibility prevents earlier updated rows from changing the guard mid-insert.
  const reserved = await getDb().all<{ key: string }>(sql`
    WITH windows (key, request_limit, duration) AS (VALUES ${values}),
    eligible AS MATERIALIZED (
      SELECT * FROM windows WHERE NOT EXISTS (
        SELECT 1 FROM windows AS limits
        JOIN rate_limits AS current ON current.key = limits.key
        WHERE current.expires_at > ${now} AND current.count >= limits.request_limit
      )
    )
    INSERT INTO rate_limits (key, count, expires_at)
    SELECT key, 1, ${now} + duration FROM eligible WHERE 1
    ON CONFLICT(key) DO UPDATE SET
      count = CASE WHEN expires_at <= ${now} THEN 1 ELSE count + 1 END,
      expires_at = CASE WHEN expires_at <= ${now} THEN excluded.expires_at ELSE expires_at END
    RETURNING key
  `);
  if (reserved.length === windows.length) return;
  const current = await getDb().all<{ key: string; count: number; expiresAt: number }>(sql`
    SELECT key, count, expires_at AS expiresAt FROM rate_limits
    WHERE key IN (${sql.join(windows.map((window) => sql`${window.key}`), sql`, `)})
  `);
  const limited = windows.find((window) => current.some((row) => row.key === window.key && row.expiresAt > now && row.count >= window.limit)) ?? windows[0];
  const expiresAt = current.find((row) => row.key === limited.key)?.expiresAt ?? now + limited.duration;
  throw new AiError(
    limited.id === "site-day"
      ? "오늘의 사이트 AI 이용량을 모두 사용했습니다. 잠시 쉬었다가 다시 이용해 주세요."
      : "AI 이용 횟수에 도달했습니다. 잠시 쉬었다가 다시 이용해 주세요.",
    429,
    "RATE_LIMITED",
    Math.max(1, Math.ceil((expiresAt - now) / 1_000)),
  );
}

const sharedInstructions = "You help adult caregivers learn and practice English for everyday play with young children. The person using this chat is an adult. Keep activities age-appropriate, simple, warm, and supervised. Never ask for a child's name, address, photo, or other identifying details. Do not claim to know family profiles or account data. Stay focused on English learning. Do not claim to generate audio or video. Give plain text replies without HTML. Keep each reply under 1800 characters.";
const modeInstructions = {
  parent: "Reply mainly in Korean with a few short, natural English phrases and their meanings. Suggest a practical, brief play activity when useful. Use simple vocabulary for toddlers and explain to the caregiver. Keep the reply concise.",
  practice: "Practice a short, friendly English conversation with the adult caregiver. Use simple English, offer one brief Korean explanation or gentle correction if helpful, and ask just one short follow-up question. Keep the reply concise.",
};

const suggestionInstructions = "Return JSON with reply first, then replySuggestion. In reply, finish with at most one simple question. In replySuggestion, write one short, natural example of the adult user's answer to that exact question, in first person where suitable. It must be a reply the user can send immediately, not another assistant question or an instruction. Match the conversation language (simple English for practice, Korean for parent guidance unless practicing an English answer). Do not invent identifying details about the child. If reply has no question, suggest a relevant short request to continue the topic. Keep the suggestion under 160 characters.";
const replyFormat = {
  type: "json_schema", name: "english_conversation", strict: true,
  schema: { type: "object", properties: { reply: { type: "string" }, replySuggestion: { type: "string" } }, required: ["reply", "replySuggestion"], additionalProperties: false },
};
const replySchema = z.strictObject({ reply: z.string().trim().min(1), replySuggestion: z.string().trim().min(1).max(200) });

function completedReply(value: unknown, model: string): AiChatReply {
  const result = responseSchema.safeParse(value);
  if (!result.success || result.data.status !== "completed") {
    throw new AiError("AI 답변이 완성되지 않았습니다. 질문을 짧게 바꾸어 다시 시도해 주세요.", 502, "INCOMPLETE_RESPONSE");
  }
  const content = result.data.output.filter(item => item.type === "message").flatMap(item => item.content ?? []);
  const refusal = content.filter(item => item.type === "refusal").map(item => item.refusal ?? "").join("\n").trim();
  if (refusal) return { reply: refusal.slice(0, 2_000), model };
  const text = content.filter(item => item.type === "output_text").map(item => item.text ?? "").join("").trim();
  let parsed: z.infer<typeof replySchema>;
  try { parsed = replySchema.parse(JSON.parse(text)); }
  catch { throw new AiError("AI 답변을 가져오지 못했습니다. 다시 시도해 주세요.", 502, "INVALID_RESPONSE"); }
  const overflowNotice = "\n\n답변이 길어 일부를 생략했어요. 질문을 나누어 다시 물어봐 주세요.";
  const reply = parsed.reply.length > 2_000
    ? `${parsed.reply.slice(0, 2_000 - overflowNotice.length).replace(/[\uD800-\uDBFF]$/, "").trimEnd()}${overflowNotice}`
    : parsed.reply;
  return { reply, replySuggestion: parsed.replySuggestion, model };
}

export async function generateAiReply(input: AiChatInput, signal?: AbortSignal, onDelta?: (text: string) => void): Promise<AiChatReply> {
  // Validate again so direct server consumers cannot bypass the model allowlist.
  const validated = parseAiChatInput(input);
  requireAiConfiguration();
  const timeout = AbortSignal.timeout(UPSTREAM_TIMEOUT_MS);
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY!.trim()}`,
        "Content-Type": "application/json",
      },
      signal: signal ? AbortSignal.any([timeout, signal]) : timeout,
      body: JSON.stringify({
        model: validated.model,
        instructions: `${sharedInstructions} ${modeInstructions[validated.mode]} ${suggestionInstructions}`,
        input: validated.messages,
        reasoning: { effort: "low" },
        max_output_tokens: 1_200,
        store: false,
        text: { format: replyFormat },
        ...(onDelta ? { stream: true } : {}),
      }),
    });
    if (!response.ok) {
      await response.body?.cancel();
      if (response.status === 429) throw new AiError("AI 서비스가 혼잡하거나 이용 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.", 429, "UPSTREAM_RATE_LIMITED", 60);
      if ([401, 403, 404].includes(response.status)) throw new AiError("선택한 모델에 연결할 수 없습니다. 다른 모델을 선택하거나 관리자에게 알려 주세요.", 503, "MODEL_UNAVAILABLE");
      throw new AiError("AI 응답을 받지 못했습니다. 잠시 후 다시 시도해 주세요.", 502, "UPSTREAM_UNAVAILABLE");
    }
    if (!onDelta) return completedReply(await response.json(), validated.model);
    if (!response.body) throw new AiError("AI 연결이 끊겼습니다. 다시 시도해 주세요.", 502, "INCOMPLETE_RESPONSE");
    let json = "";
    let shown = "";
    for await (const value of readServerEvents(response.body)) {
      if (!value || typeof value !== "object") continue;
      const event = value as { type?: string; delta?: string; response?: unknown };
      if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
        json += event.delta;
        if (json.length > 32_000) throw new AiError("AI 답변이 너무 깁니다. 질문을 나누어 주세요.", 502, "INVALID_RESPONSE");
        const next = partialReply(json);
        if (next.length > shown.length) { onDelta(next.slice(shown.length)); shown = next; }
      } else if (event.type === "response.completed") return completedReply(event.response, validated.model);
      else if (["error", "response.failed", "response.incomplete"].includes(event.type ?? "")) {
        throw new AiError("AI 답변이 완성되지 않았습니다. 다시 시도해 주세요.", 502, "INCOMPLETE_RESPONSE");
      }
    }
    throw new AiError("AI 연결이 끊겼습니다. 작성한 질문을 다시 보내 주세요.", 502, "INCOMPLETE_RESPONSE");
  } catch (error) {
    if (error instanceof AiError) throw error;
    if (timeout.aborted) throw new AiError("AI 응답 시간이 길어지고 있습니다. 잠시 후 다시 시도해 주세요.", 504, "UPSTREAM_TIMEOUT");
    if (signal?.aborted) throw new AiError("요청이 취소되었습니다.", 499, "REQUEST_CANCELLED");
    throw new AiError("AI 서비스에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.", 502, "UPSTREAM_UNAVAILABLE");
  }
}
