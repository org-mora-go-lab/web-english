import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { seedConversation } from "../03. 대화 저장/__util__";

test("긴 대화 제목은 헤더 좌우 조작과 겹치지 않고 줄여 표시한다", async ({ page }) => {
  await mockAiModels(page); const account = await createAccount(page);
  const longTitle = "아이와 함께 동물 친구들의 소리를 들으며 즐겁게 영어로 대화하는 아주 긴 놀이 제목 ".repeat(3);
  await seedConversation(account.email, longTitle); await page.reload();
  const title = page.locator(".play-header-title");
  await expect(title).toHaveText(longTitle);
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    const geometry = await title.evaluate(element => ({ overflow: getComputedStyle(element).textOverflow, clipped: element.scrollWidth > element.clientWidth }));
    expect(geometry).toEqual({ overflow: "ellipsis", clipped: true });
    const text = (await title.boundingBox())!;
    const content = (await page.getByRole("button", { name: "콘텐츠", exact: true }).boundingBox())!;
    expect(text.x).toBeGreaterThan(48);
    expect(text.x + text.width).toBeLessThan(content.x);
  }
  await page.getByRole("button", { name: "새 채팅", exact: true }).click();
  await expect(title).toHaveText("새 채팅");
  await page.getByRole("button", { name: longTitle, exact: true }).click();
  await expect(title).toHaveText(longTitle);
  await page.goto("/ai");
  await expect(page.locator(".ai-coach-title")).toHaveText(longTitle);
});
