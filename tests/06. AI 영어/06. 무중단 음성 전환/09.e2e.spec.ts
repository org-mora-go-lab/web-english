import { expect, test } from "@playwright/test";

import { runServerVoiceCheck } from "./__util__";

test("서버 sideband 전환은 진행 중 답변과 전사를 한 번만 저장한다", async () => {
  const result = await runServerVoiceCheck("observer");
  expect(result.stdout).toContain("Voice observer protocol passed");
});
