import { expect, test } from "@playwright/test";

test("저장소 차단 시 자막 설정 세션 유지", async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException("Blocked", "SecurityError"); }; });
  await page.goto("/watch/small-talk");
  await page.getByRole("combobox", { name: "영상 자막", exact: true }).selectOption("off");
  await expect(page.getByRole("status")).toContainText("자막 설정은 이번 세션에서만 유지");
  await page.getByRole("complementary", { name: "다음 학습 영상" }).getByRole("link").first().click();
  await expect(page.getByRole("combobox", { name: "영상 자막", exact: true })).toHaveValue("off");
});
