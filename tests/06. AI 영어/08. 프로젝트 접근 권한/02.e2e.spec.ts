import { expect, test } from "@playwright/test";

import { isolatedProjectAccounts } from "./__util__";

test("다른 계정의 프로젝트 이름은 변경할 수 없다", async ({ page, browser, baseURL }) => {
  const setup = await isolatedProjectAccounts(page, browser, baseURL);
  try {
    const response = await setup.other.request.patch(`/api/ai/projects/${setup.project.id}`, { headers: { origin: baseURL! }, data: { name: "무단 변경" } });
    expect(response.status()).toBe(404);
    const projects = (await (await page.request.get("/api/ai/projects")).json()).projects;
    expect(projects).toEqual([expect.objectContaining({ id: setup.project.id, name: "주인 전용 프로젝트" })]);
  } finally { await setup.context.close(); }
});
