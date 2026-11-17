import { expect, test } from "@playwright/test";

import { checkChatTitles } from "./__util__";

test("텍스트 요약 제목은 실제 DB에 저장하고 이어지는 대화에서도 유지한다", async () => {
  expect((await checkChatTitles("text")).stdout).toContain("Chat title check passed");
});
