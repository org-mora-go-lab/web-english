import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("부모가 아이 개월수와 놀이 반응을 저장한다", async ({ page }) => {
  await createAccount(page);
  await page.goto("/");
  await page.getByRole("combobox", { name: "아이 개월수" }).selectOption("21");
  await expect(page.getByText("21–23개월", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /오늘의 놀이 보기/ }).click();
  await page.getByRole("button", { name: /관심 보였어요/ }).click();
  await page.getByRole("textbox", { name: "한 줄 메모" }).fill("상자를 가리켰어요");
  await page.getByRole("button", { name: "놀이 기록 저장" }).click();
  await expect(page.getByText("상자를 가리켰어요")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "놀이 기록" }).click();
  await expect(page.getByText("상자를 가리켰어요")).toBeVisible();
  await page.getByRole("button", { name: "상자에 넣고 꺼내기 기록 삭제" }).click();
  await expect(page.getByText("상자를 가리켰어요")).toHaveCount(0);
});
