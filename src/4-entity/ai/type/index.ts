export type AiModel = {
  id: string;
  name: string;
  description: string;
};

export type AiMode = "parent" | "practice";

export type AiMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AiChatInput = {
  conversationId?: string;
  revision?: number;
  turnId?: string;
  model: string;
  messages: AiMessage[];
  mode: AiMode;
};

export type SavedAiMessage = AiMessage & { id: string; model?: string };
export type AiConversation = {
  id: string; title: string; mode: AiMode; model: string;
  messages: SavedAiMessage[]; revision: number; updatedAt: number;
};

export type AiChatReply = { reply: string; model: string };

export type AiModelList = {
  models: AiModel[];
  defaultModel: string;
  configured: boolean;
};
