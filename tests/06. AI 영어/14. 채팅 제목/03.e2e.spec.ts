import { expect, test } from "@playwright/test";

import { checkChatTitles } from "./__util__";

test("음성 제목은 추가 API 없이 첫 주제를 유지한다", async () => {
  expect((await checkChatTitles("voice")).stdout).toContain("Chat title check passed");
});
