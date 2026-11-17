import { expect, test } from "@playwright/test";

import { runTextStreamCheck } from "./__util__";

test("스트림 취소는 외부 생성을 중단하고 대화를 저장하지 않는다", async () => {
  expect((await runTextStreamCheck("cancel")).stdout).toContain("Text stream protocol passed");
});
