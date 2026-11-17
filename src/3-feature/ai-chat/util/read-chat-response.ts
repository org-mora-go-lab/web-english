import { readServerEvents } from "@/src/5-shared/http";

import type { ChatResponse } from "../type";

const missing = () => new Error("답변을 가져오지 못했어요. 작성한 질문을 다시 보내 주세요.");

export async function readChatResponse(response: Response, signal: AbortSignal, onDelta: (text: string) => void): Promise<ChatResponse> {
  if (!response.ok || !response.headers.get("content-type")?.includes("text/event-stream")) {
    return response.json().catch(() => { throw missing(); });
  }
  if (!response.body) throw missing();
  for await (const value of readServerEvents(response.body)) {
    if (signal.aborted) throw signal.reason;
    if (!value || typeof value !== "object") continue;
    const event = value as Record<string, unknown>;
    if (event.type === "error") throw new Error(typeof event.error === "string" ? event.error : missing().message);
    if (event.type === "delta" && typeof event.text === "string") onDelta(event.text);
    if (event.type === "complete" && typeof event.reply === "string") return event as ChatResponse;
  }
  throw missing();
}
