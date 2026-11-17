import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("외부 출처에서 보낸 프로젝트 생성 요청은 거절한다", async ({ page }) => {
  await createAccount(page);
  const response = await page.request.post("/api/ai/projects", { headers: { origin: "https://elsewhere.example" }, data: { name: "외부 프로젝트" } });
  expect(response.status()).toBe(403);
  expect((await (await page.request.get("/api/ai/projects")).json()).projects).toEqual([]);
});
