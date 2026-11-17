import type { Page } from "@playwright/test";

export type TopicRequest = {
  conversationId: string; revision: number; turnId: string; model: string; mode: string;
  messages: {role: "user" | "assistant"; content: string}[];
};
export async function mockTopicChat(page: Page, failFirst = false) {
  const requests: TopicRequest[] = [];
  let latest: { id: string; title: string; mode: string; model: string; revision: number; updatedAt: number; messages: { id: string; role: string; content: string; model: string }[] } | null = null;
  await page.route("**/api/ai/conversations", route => route.fulfill({ json: { conversations: latest ? [latest] : [], latest } }));
  await page.route("**/api/ai/conversations/*", route => route.fulfill({ json: { conversation: latest } }));
  await page.route("**/api/ai/chat", async route => {
    const input = route.request().postDataJSON() as TopicRequest;
    requests.push(input);
    if (failFirst && requests.length === 1) { await route.fulfill({status: 503, json: {error: "잠시 연결이 끊겼어요. 다시 보내 주세요."}}); return; }
    const reply = "Hi! Wave your hand. 같이 인사해 볼까요?";
    latest = {
      id: input.conversationId, title: "손 흔들며 인사", mode: input.mode, model: input.model,
      revision: input.revision + 1, updatedAt: Date.now(),
      messages: [...input.messages, {role: "assistant", content: reply}].map((item, i) => ({...item, id: `${requests.length}-${i}`, model: input.model})),
    };
    await route.fulfill({ json: { reply, model: input.model, conversation: latest } });
  });
  return requests;
}
