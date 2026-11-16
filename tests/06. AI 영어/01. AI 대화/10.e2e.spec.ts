import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "./__mock__";

test("빈 입력창의 Tab은 현재 모드 추천 질문을 채우고 기존 입력은 보존한다", async ({ page }) => {
  await createAccount(page);
  await mockAiModels(page);
  let sends = 0;
  page.on("request", request => { if (request.url().endsWith("/api/ai/chat")) sends += 1; });
  await page.goto("/ai");
  const input = page.getByRole("textbox", { name: "AI에게 보낼 메시지" });
  await expect(input).toBeEnabled();
  const suggestion = await input.getAttribute("placeholder");
  await input.focus();
  await input.press("Tab");
  await expect(input).toHaveValue(suggestion!);
  await expect(input).toBeFocused();
  await input.fill("내가 작성한 질문");
  await input.press("Tab");
  await expect(input).toHaveValue("내가 작성한 질문");
  await expect(input).not.toBeFocused();
  await page.getByRole("button", { name: "영어 회화 연습", exact: true }).click();
  const practice = await input.getAttribute("placeholder");
  expect(practice).not.toBe(suggestion);
  await input.focus();
  await input.press("Shift+Tab");
  await expect(input).toHaveValue("");
  await expect(input).not.toBeFocused();
  await input.focus();
  await input.press("Tab");
  await expect(input).toHaveValue(practice!);
  expect(sends).toBe(0);
});
