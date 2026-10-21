import { expect, test } from "@playwright/test";
test("영상 로드 실패 안내", async ({ page }) => {
  await page.route("**/media/momo-welcome.mp4", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".video-message[role=alert]")).toContainText(
    "영상을 불러오지 못했어요",
  );
  await expect(
    page.getByRole("button", { name: "목소리 듣기", exact: true }),
  ).toBeDisabled();
  await page.getByText("영어 대본과 해석 보기", { exact: true }).click();
  await expect(
    page.getByText("Hi! I'm Momo, your English buddy.", { exact: true }),
  ).toBeVisible();
});
