import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("개월수 API는 16~24개월 정수만 저장하고 잘못된 값은 이전 값을 보존한다", async ({ page }) => {
  await createAccount(page);
  const status = (age: number) => page.evaluate(async ageMonths => (await fetch("/api/family", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ageMonths }) })).status, age);
  expect(await status(24)).toBe(200);
  for (const age of [15, 25, 36, 17.5]) expect(await status(age)).toBe(400);
  expect((await (await page.request.get("/api/family")).json()).ageMonths).toBe(24);
});
