import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("영상 재생 속도", async ({ page }) => {
  await createAccount(page);
  await page.goto("/watch/coffee");
  await page.getByRole("combobox", { name: "영상 재생 속도" }).selectOption("0.75");
  await expect.poll(() => page.getByTestId("lesson-video").evaluate((v: HTMLVideoElement) => v.playbackRate)).toBe(0.75);
});
