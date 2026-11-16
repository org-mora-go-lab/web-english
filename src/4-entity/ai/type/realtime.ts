import type { AiConversation } from "./index";

export type RealtimeEvent = {
  type: string; item_id?: string; transcript?: string;
  item?: { id: string; role?: string; content?: { type: string; text?: string; transcript?: string }[] };
  response?: { id: string; status?: string; output?: { type: string; role?: string; content?: { type: string; text?: string; transcript?: string }[] }[] };
};
export type VoiceObserverOptions = {
  userId: string; conversationId: string; revision: number; mode: "parent" | "practice";
  emit: (event: Record<string, unknown>) => void;
  onSaved?: (conversation: AiConversation) => void;
};
