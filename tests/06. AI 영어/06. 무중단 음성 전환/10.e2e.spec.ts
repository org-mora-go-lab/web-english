import { expect, test } from "@playwright/test";

import { runServerVoiceCheck } from "./__util__";

test("서버가 최신 문맥을 검증한 대기 call로 대화를 이어 저장한다", async () => {
  const result = await runServerVoiceCheck("warm");
  expect(result.stdout).toContain("Voice warm protocol passed");
});
