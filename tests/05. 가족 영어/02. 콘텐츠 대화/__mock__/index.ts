import type { Page } from "@playwright/test";

export type TopicRequest = {
  conversationId: string; revision: number; turnId: string; model: string; mode: string;
  messages: {role: "user" | "assistant"; content: string}[];
};
export async function mockTopicChat(page: Page, failFirst = false) {
  const requests: TopicRequest[] = [];
  await page.route("**/api/ai/chat", async route => {
    const input = route.request().postDataJSON() as TopicRequest;
    requests.push(input);
    if (failFirst && requests.length === 1) { await route.fulfill({status: 503, json: {error: "잠시 연결이 끊겼어요. 다시 보내 주세요."}}); return; }
    const reply = "Hi! Wave your hand. 같이 인사해 볼까요?";
    await route.fulfill({json: {reply, model: input.model, conversation: {
      id: input.conversationId, title: "손 흔들며 인사", mode: input.mode, model: input.model,
      revision: input.revision + 1, updatedAt: Date.now(),
      messages: [...input.messages, {role: "assistant", content: reply}].map((item, i) => ({...item, id: `${requests.length}-${i}`, model: input.model})),
    }}});
  });
  return requests;
}
