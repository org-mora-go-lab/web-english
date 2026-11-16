import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("모델 목록은 로그인한 사용자만 조회하고 로그아웃하면 차단한다", async ({ page }) => {
  const guest = await page.request.get("/api/ai/models");
  expect(guest.status()).toBe(401);
  expect(await guest.json()).toEqual({ error: expect.any(String), code: "AUTH_REQUIRED" });
  expect(guest.headers()["cache-control"]).toBe("no-store");
  await createAccount(page);
  const member = await page.request.get("/api/ai/models");
  expect(member.status()).toBe(200);
  expect((await member.json()).models).toHaveLength(3);
  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(page).toHaveURL(/\/login/);
  expect((await page.request.get("/api/ai/models")).status()).toBe(401);
});
