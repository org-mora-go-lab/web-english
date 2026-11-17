import { expect, test } from "@playwright/test";

import { createProject } from "../07. 대화 그룹/__util__";
import { isolatedProjectAccounts } from "./__util__";

test("다른 계정의 대화를 내 프로젝트로 가져올 수 없다", async ({ page, browser, baseURL }) => {
  const setup = await isolatedProjectAccounts(page, browser, baseURL);
  try {
    const own = await createProject(setup.other);
    const response = await setup.other.request.patch(`/api/ai/conversations/${setup.conversation.id}`, { headers: { origin: baseURL! }, data: { projectId: own.id } });
    expect(response.status()).toBe(404);
    const saved = await page.request.get(`/api/ai/conversations/${setup.conversation.id}`);
    expect((await saved.json()).conversation.projectId).toBeNull();
  } finally { await setup.context.close(); }
});
