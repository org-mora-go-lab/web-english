import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("web-english 로그인 세션 쿠키는 다른 앱과 분리된다", async ({ page, context }) => {
  await createAccount(page);
  const cookies = await context.cookies();
  const session = cookies.find(cookie => cookie.name === "web-english.session-token");
  expect(session).toBeDefined();
  expect(session?.domain).toBe("localhost");
  expect(session?.httpOnly).toBe(true);
  expect(session?.sameSite).toBe("Lax");
  expect(cookies.some(cookie => cookie.name.includes("web-notepad"))).toBe(false);
});
