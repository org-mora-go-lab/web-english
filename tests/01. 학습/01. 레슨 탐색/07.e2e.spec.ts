import { expect, test } from "@playwright/test";
test("레슨 정렬", async ({ page }) => {
  await page.goto("/library");
  await page
    .getByRole("combobox", { name: "레슨 정렬" })
    .selectOption("짧은순");
  await expect(page.getByRole("combobox", { name: "레슨 정렬" })).toHaveValue(
    "짧은순",
  );
  await expect
    .poll(async () => {
      const minutes = (await page.locator(".duration").allTextContents()).map(
        (value) => { const [minutes, seconds] = value.split(":").map(Number); return minutes * 60 + seconds; },
      );
      return (
        minutes.length === 15 &&
        minutes.every(
          (value, index) => index === 0 || value >= minutes[index - 1],
        )
      );
    })
    .toBe(true);
  await page
    .getByRole("combobox", { name: "레슨 정렬" })
    .selectOption("제목순");
  await expect
    .poll(async () => {
      const titles = await page.locator(".lesson-title").allTextContents();
      return (
        JSON.stringify(titles) ===
        JSON.stringify([...titles].sort((a, b) => a.localeCompare(b, "ko")))
      );
    })
    .toBe(true);
});
