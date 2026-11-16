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
  model: string;
  messages: AiMessage[];
  mode: AiMode;
};

export type AiChatReply = { reply: string; model: string };

export type AiModelList = {
  models: AiModel[];
  defaultModel: string;
  configured: boolean;
};
