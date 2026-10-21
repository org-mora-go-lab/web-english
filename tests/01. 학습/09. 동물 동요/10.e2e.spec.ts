import { expect, test } from "@playwright/test";

test("10종 캐릭터와 개별 동요 음원", async ({ page }) => {
  test.setTimeout(90000);
  const plans = await (await page.request.get("/media/singalong/plans.json")).json();
  expect(new Set(plans.map((p: {animal: string}) => p.animal)).size).toBe(10);
  expect(new Set(plans.map((p: {notes: number[][]}) => JSON.stringify(p.notes))).size).toBe(10);
  for (const plan of plans) {
    expect((await page.request.get(`/media/singalong/characters/${plan.animal}.png`)).ok()).toBe(true);
    const response = await page.request.get(`/media/singalong/${plan.id}.mp4`);
    expect(response.ok()).toBe(true);
    const bytes = await response.body();
    expect(bytes.includes(Buffer.from("soun"))).toBe(true);
    expect(bytes.includes(Buffer.from("vide"))).toBe(true);
    const metadata = await (await page.request.get(`/media/singalong/${plan.id}.json`)).json();
    expect(metadata.segments.filter((s: {kind: string}) => s.kind === "song")).toHaveLength(4);
    expect(metadata.segments.filter((s: {kind: string}) => s.kind === "repeat")).toHaveLength(4);
  }
});
