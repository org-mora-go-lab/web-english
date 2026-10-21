import { expect, test } from "@playwright/test";
test("잘못된 저장 기록 정규화", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "mora-english-library",
      JSON.stringify({
        saved: ["small-talk", "small-talk", "deleted", 123],
        history: ["coffee", "coffee"],
        completed: ["small-talk", "deleted", "small-talk"],
      }),
    ),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "저장한 레슨" }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "1",
  );
});
