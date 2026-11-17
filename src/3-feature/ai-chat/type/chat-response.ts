import type { SavedConversation } from "./chat-state";

export type ChatResponse = {
  reply?: string;
  replySuggestion?: string;
  model?: string;
  conversation?: SavedConversation;
  error?: string;
};
