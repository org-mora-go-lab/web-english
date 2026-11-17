import { expect, type Page } from "@playwright/test";

export async function createProject(page: Page, name = "동물 영어") {
  const response = await page.request.post("/api/ai/projects", { headers: { origin: new URL(page.url()).origin }, data: { name } });
  expect(response.status()).toBe(201);
  return (await response.json()).project as { id: string; name: string };
}

export async function moveConversation(page: Page, id: string, projectId: string | null) {
  const response = await page.request.patch(`/api/ai/conversations/${id}`, { headers: { origin: new URL(page.url()).origin }, data: { projectId } });
  expect(response.ok()).toBe(true);
}
