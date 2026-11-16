import { expect, test } from "@playwright/test";
test("고양이는 클릭할 때만 소리를 재생한다", async ({page}) => {
  await page.addInitScript(() => { HTMLMediaElement.prototype.play = async function() { document.documentElement.dataset.played = this.src; }; });
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveAttribute("data-played");
  await page.getByRole("button", {name: "고양이 야옹 소리 듣기"}).click();
  await expect(page.locator("html")).toHaveAttribute("data-played", /kitten-meow.wav/);
  const audio = await page.request.get("/media/kitten-meow.wav");
  expect(audio.ok()).toBe(true);
  expect((await audio.body()).subarray(0,4).toString()).toBe("RIFF");
});
