import { expect, test } from "@playwright/test";

import { seedConversation } from "../03. 대화 저장/__util__";
import { isolatedProjectAccounts } from "./__util__";

test("내 대화를 다른 계정의 프로젝트에 붙일 수 없다", async ({ page, browser, baseURL }) => {
  const setup = await isolatedProjectAccounts(page, browser, baseURL);
  try {
    const own = await seedConversation(setup.account.email, "내 대화");
    const response = await setup.other.request.patch(`/api/ai/conversations/${own.id}`, { headers: { origin: baseURL! }, data: { projectId: setup.project.id } });
    expect(response.status()).toBe(404);
    const saved = await setup.other.request.get(`/api/ai/conversations/${own.id}`);
    expect((await saved.json()).conversation.projectId).toBeNull();
  } finally { await setup.context.close(); }
});
