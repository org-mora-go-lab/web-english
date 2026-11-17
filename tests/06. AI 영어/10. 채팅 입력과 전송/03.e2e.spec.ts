import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";

test("모바일 입력창 하단에서 모델·목소리·음성·전송 아이콘을 조작한다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockAiModels(page); await createAccount(page);
  const footer = page.locator(".ai-chat-composer");
  const model = footer.getByRole("combobox", { name: "AI 모델", exact: true });
  await model.selectOption("gpt-6-sol");
  await expect(model).toHaveValue("gpt-6-sol");
  const voice = footer.getByRole("combobox", { name: "목소리", exact: true });
  await voice.selectOption("cat");
  await expect(voice).toHaveValue("cat");
  const microphone = footer.getByRole("button", { name: "고급 음성 시작", exact: true });
  const send = footer.getByRole("button", { name: "보내기", exact: true });
  await expect(send).toBeInViewport();
  await expect(send).toHaveText("");
  await expect(send.locator("svg")).toHaveCount(1);
  const sendBox = (await send.boundingBox())!;
  const micBox = (await microphone.boundingBox())!;
  const voiceBox = (await voice.boundingBox())!;
  expect(voiceBox.x + voiceBox.width).toBeLessThanOrEqual(micBox.x);
  expect(micBox.x + micBox.width).toBeLessThanOrEqual(sendBox.x);
  expect(micBox.x - voiceBox.x - voiceBox.width).toBeGreaterThanOrEqual(9);
  expect(sendBox.x - micBox.x - micBox.width).toBeGreaterThanOrEqual(9);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
