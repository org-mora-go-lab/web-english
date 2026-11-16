import type { Page } from "@playwright/test";

export const aiModels = {
  models: [
    { id: "gpt-6-luna", name: "GPT-6 Luna", description: "빠른 영어 놀이" },
    { id: "gpt-6-sol", name: "GPT-6 Sol", description: "균형 잡힌 영어 대화" },
    { id: "gpt-6-astra", name: "GPT-6 Astra", description: "깊이 있는 영어 도움" },
  ],
  defaultModel: "gpt-6-luna",
  configured: true,
};

export type AiRequest = {
  model: string;
  mode: "parent" | "practice";
  messages: { role: "user" | "assistant"; content: string }[];
};

export async function mockAiModels(page: Page) {
  await page.route("**/api/ai/models", (route) => route.fulfill({ json: aiModels }));
}
