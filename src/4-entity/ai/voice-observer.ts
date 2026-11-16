import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { getAiConversation, saveAiTurn } from "./history";
import { AiError } from "./server";
import type { AiConversation, RealtimeEvent, VoiceObserverOptions } from "./type";
import { REALTIME_MODEL } from "./voice-agent";

// Only events from the server-authenticated OpenAI sideband reach this observer.
export async function createVoiceObserver(options: VoiceObserverOptions) {
  let previous: AiConversation | null = null;
  if (options.revision > 0) previous = await getAiConversation(options.userId, options.conversationId);
  if ((previous?.revision ?? 0) !== options.revision) throw new AiError("대화가 변경됐어요. 다시 불러와 주세요.", 409, "CONVERSATION_CONFLICT");
  const state = options.state;
  if (state && state.revision !== options.revision) throw new AiError("대화 저장 상태가 변경됐어요.", 409, "CONVERSATION_CONFLICT");
  const users = new Map<string, string>(state?.users);
  const outputs = new Map<string, { userId: string; text: string }>(state?.outputs);
  const responseUsers = new Map<string, string>(state?.responseUsers);
  const completed = new Set<string>(state?.completed);
  const ignoredUsers = new Set<string>(state?.ignoredUsers);
  const seen = new Set<string>(state?.seen);
  let latestUser = state?.latestUser ?? "";
  async function flush() {
    for (const [responseId, output] of outputs) {
      const question = users.get(output.userId);
      if (!question || completed.has(responseId)) continue;
      if (question.length > 2000) throw new AiError("말씀이 길어요. 짧게 나누어 대화해 주세요.", 400, "VOICE_TOO_LONG");
      const input = { conversationId: options.conversationId, revision: previous?.revision ?? 0, turnId: randomUUID(), model: REALTIME_MODEL, mode: options.mode, messages: [{ role: "user" as const, content: question }] };
      const saved = await saveAiTurn(options.userId, input, previous, { reply: output.text, model: REALTIME_MODEL });
      if (!saved) throw new Error("Missing saved voice conversation");
      previous = saved; completed.add(responseId); outputs.delete(responseId);
      users.delete(output.userId); ignoredUsers.add(output.userId); responseUsers.delete(responseId);
      // Persist the complete history; bound each streamed UI snapshot.
      options.onSaved?.(saved); options.emit({ kind: "saved", userItemId: output.userId, conversation: { ...saved, messages: saved.messages.slice(-200) } });
      if (completed.size > 256) completed.delete(completed.values().next().value!);
    }
  }
  const observe = async (event: RealtimeEvent) => {
    const eventId = event.event_id ?? createHash("sha256").update(JSON.stringify(event)).digest("hex");
    if (seen.has(eventId)) return;
    if (event.type === "input_audio_buffer.committed" && event.item_id) latestUser = event.item_id;
    if (["conversation.item.added", "conversation.item.created", "conversation.item.done"].includes(event.type) && event.item?.role === "user") {
      if (event.type !== "conversation.item.done" || !latestUser) latestUser = event.item.id;
      const text = event.item.content?.map(part => part.text ?? part.transcript ?? "").join(" ").trim();
      if (text && !users.has(event.item.id) && !ignoredUsers.has(event.item.id)) { users.set(event.item.id, text); options.emit({ kind: "user", text }); }
    }
    if (event.type === "conversation.item.input_audio_transcription.completed" && event.item_id && event.transcript?.trim() && !ignoredUsers.has(event.item_id)) {
      users.set(event.item_id, event.transcript.trim()); options.emit({ kind: "user", text: event.transcript.trim() });
    }
    if (event.type === "response.created" && event.response?.id && latestUser) responseUsers.set(event.response.id, latestUser);
    if (event.type === "response.done" && event.response && !completed.has(event.response.id)) {
      const response = event.response;
      if (response.status === "completed") {
        const text = response.output?.filter(item => item.type === "message" && item.role === "assistant").flatMap(item => item.content ?? []).map(part => part.transcript ?? part.text ?? "").join("\n").trim();
        const userId = responseUsers.get(response.id);
        if (text && userId) outputs.set(response.id, { userId, text: text.length > 2000 ? `${text.slice(0, 1950)}\n(긴 답변의 일부만 저장했어요.)` : text });
      } else if (response.status === "cancelled") {
        const userId = responseUsers.get(response.id);
        if (userId) { ignoredUsers.add(userId); users.delete(userId); }
        responseUsers.delete(response.id); outputs.delete(response.id); completed.add(response.id);
      } else if (["failed", "incomplete"].includes(response.status ?? "")) throw new AiError("음성 답변을 완성하지 못했어요. 질문을 짧게 바꾸어 다시 연결해 주세요.", 502, "VOICE_RESPONSE_FAILED");
    }
    if (event.type === "error") throw new AiError("OpenAI 음성 연결에 오류가 발생했어요. 다시 연결해 주세요.", 502, "VOICE_UPSTREAM_ERROR");
    if (event.type === "conversation.item.input_audio_transcription.failed") throw new AiError("말씀을 텍스트로 저장하지 못했어요. 다시 연결해 주세요.", 502, "VOICE_TRANSCRIPTION_FAILED");
    if (users.size > 100 || responseUsers.size > 100) throw new AiError("음성 처리 대기열을 확인하지 못했어요. 다시 연결해 주세요.", 502, "VOICE_QUEUE_FULL");
    await flush();
    seen.add(eventId);
    if (seen.size > 512) seen.delete(seen.values().next().value!);
    if (ignoredUsers.size > 256) ignoredUsers.delete(ignoredUsers.values().next().value!);
  };
  return Object.assign(observe, { snapshot: () => ({ revision: previous?.revision ?? 0, latestUser, seen: [...seen], users: [...users], outputs: [...outputs], responseUsers: [...responseUsers], completed: [...completed], ignoredUsers: [...ignoredUsers] }) });
}
