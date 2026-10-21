import { expect, test } from "@playwright/test";
test("저장소 사용 불가 안내", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "어색한 침묵은 이제 그만, 스몰토크 시작하기 저장",
      exact: true,
    })
    .click();
  await expect(page.getByRole("status")).toContainText("이번 세션에서만 유지");
  await page.getByRole("button", { name: "저장한 레슨" }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByRole("button", { name: "알림 닫기" }).click();
  await expect(page.getByRole("status")).toHaveCount(0);
});
