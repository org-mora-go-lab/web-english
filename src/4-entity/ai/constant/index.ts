import type { AiModel } from "../type";

export const AI_MODELS: readonly AiModel[] = [
  { id: "gpt-6-luna", name: "GPT-6 Luna", description: "짧은 영어 표현과 가벼운 대화에 적합한 기본 모델" },
  { id: "gpt-6-sol", name: "GPT-6 Sol", description: "놀이 아이디어와 자세한 표현 설명을 위한 모델" },
  { id: "gpt-6-astra", name: "GPT-6 Astra", description: "복잡한 질문과 깊이 있는 설명을 위한 모델" },
];
