import type { Browser, Page } from "@playwright/test";

import { createAccount } from "../../../__util__";
import { seedConversation } from "../../03. 대화 저장/__util__";
import { createProject } from "../../07. 대화 그룹/__util__";

export async function isolatedProjectAccounts(page: Page, browser: Browser, baseURL?: string) {
  const owner = await createAccount(page);
  const project = await createProject(page, "주인 전용 프로젝트");
  const conversation = await seedConversation(owner.email, "주인 전용 대화");
  const context = await browser.newContext({ baseURL });
  const other = await context.newPage();
  try {
    const account = await createAccount(other);
    return { project, conversation, other, account, context };
  } catch (error) { await context.close(); throw error; }
}
