export type ChatMode = "parent" | "practice";

export type ChatModel = { id: string; name: string; description: string };

export type ChatConfiguration = {
  models: ChatModel[];
  defaultModel: string;
  configured: boolean;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
};

export type SavedConversation = {
  id: string; title: string; mode: ChatMode; model: string;
  messages: ChatMessage[]; revision: number; updatedAt: number;
};
export type ConversationSummary = Omit<SavedConversation, "messages">;
