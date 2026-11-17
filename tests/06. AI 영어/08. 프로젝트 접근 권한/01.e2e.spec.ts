import { expect, test } from "@playwright/test";

import { createProject } from "../07. 대화 그룹/__util__";
import { isolatedProjectAccounts } from "./__util__";

test("프로젝트 목록은 로그인한 계정의 프로젝트만 반환한다", async ({ page, browser, baseURL }) => {
  const setup = await isolatedProjectAccounts(page, browser, baseURL);
  try {
    const own = await createProject(setup.other, "다른 계정의 프로젝트");
    const response = await setup.other.request.get("/api/ai/projects");
    expect(response.status()).toBe(200);
    expect((await response.json()).projects).toEqual([expect.objectContaining({ id: own.id })]);
  } finally { await setup.context.close(); }
});
