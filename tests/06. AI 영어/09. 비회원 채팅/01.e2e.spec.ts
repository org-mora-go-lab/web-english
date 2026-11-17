import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";

test("비회원 홈은 AI 요청 없이 채팅을 잠그고 로그인한 뒤 활성화한다", async ({ page }) => {
  const aiRequests: string[] = [];
  page.on("request", request => { if (new URL(request.url()).pathname.startsWith("/api/ai/")) aiRequests.push(request.url()); });
  await page.goto("/");
  await expect(page.getByRole("textbox", { name: "AI에게 보낼 메시지" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "보내기", exact: true })).toBeDisabled();
  await expect(page.getByRole("combobox", { name: "목소리", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "새 채팅", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "커리큘럼", exact: true }).click();
  await page.getByRole("button", { name: /손 흔들며 인사/ }).click();
  await expect(page.getByRole("textbox", { name: "AI에게 보낼 메시지" })).toBeDisabled();
  expect(aiRequests).toEqual([]);
  await mockAiModels(page); await createAccount(page);
  await expect(page.getByRole("textbox", { name: "AI에게 보낼 메시지" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "새 채팅", exact: true })).toBeEnabled();
});
