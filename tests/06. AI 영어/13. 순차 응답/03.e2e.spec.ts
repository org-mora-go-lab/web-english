import { expect, test } from "@playwright/test";

import { runTextStreamCheck } from "./__util__";

test("서버는 순차 본문과 추천을 저장하고 재시도에 저장 결과를 반환한다", async () => {
  expect((await runTextStreamCheck("complete")).stdout).toContain("Text stream protocol passed");
});
