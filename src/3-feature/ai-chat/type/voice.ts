import type { ChatMode, SavedConversation } from "./chat-state";

export type AiVoiceOptions = {
  conversationId: string; revision: number; mode: ChatMode; voice: "marin" | "cedar";
  onTranscript: (text: string) => void;
  onConversation: (conversation: SavedConversation) => void;
  onError: (message: string) => void;
  onNotice: (message: string) => void;
};
