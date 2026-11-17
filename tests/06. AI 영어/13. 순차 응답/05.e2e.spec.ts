import { expect, test } from "@playwright/test";

import { runTextStreamCheck } from "./__util__";

test("불완전 스트림 뒤 재시도는 완성된 대화만 저장한다", async () => {
  expect((await runTextStreamCheck("incomplete")).stdout).toContain("Text stream protocol passed");
});
