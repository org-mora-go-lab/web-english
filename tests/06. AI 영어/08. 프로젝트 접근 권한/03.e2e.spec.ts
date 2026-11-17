import { expect, test } from "@playwright/test";

import { isolatedProjectAccounts } from "./__util__";

test("다른 계정의 프로젝트는 삭제할 수 없다", async ({ page, browser, baseURL }) => {
  const setup = await isolatedProjectAccounts(page, browser, baseURL);
  try {
    const response = await setup.other.request.delete(`/api/ai/projects/${setup.project.id}`, { headers: { origin: baseURL! } });
    expect(response.status()).toBe(404);
    const projects = (await (await page.request.get("/api/ai/projects")).json()).projects;
    expect(projects).toEqual([expect.objectContaining({ id: setup.project.id })]);
  } finally { await setup.context.close(); }
});
