import { expect, test } from "@playwright/test";

test("전체 영상 오디오와 자막 제공", async ({ page }) => {
  test.setTimeout(90000);
  const manifest = await (await page.request.get("/media/lessons/manifest.json")).json();
  expect(Object.keys(manifest)).toHaveLength(15);
  const unique = new Set<string>();
  for (const data of Object.values(manifest) as {src: string; poster: string; captions: string; seconds: number; segments: {kind: string; text: string}[]}[]) {
    const response = await page.request.get(data.src);
    expect(response.ok()).toBe(true);
    const bytes = await response.body();
    expect(bytes.toString("ascii", 4, 8)).toBe("ftyp");
    expect(bytes.includes(Buffer.from("soun"))).toBe(true);
    expect(bytes.includes(Buffer.from("vide"))).toBe(true);
    unique.add(bytes.toString("base64", 0, 3000));
    expect(data.seconds).toBeGreaterThan(40);
    expect(data.segments.filter(s => s.kind === "phrase")).toHaveLength(5);
    expect(data.segments.filter(s => s.kind === "vocabulary")).toHaveLength(3);
    expect(data.segments.filter(s => s.kind === "dialogue")).toHaveLength(4);
    expect((await page.request.get(data.poster)).ok()).toBe(true);
    expect(await (await page.request.get(`${data.captions}.en.vtt`)).text()).toContain(data.segments[0].text);
    expect(await (await page.request.get(`${data.captions}.ko.vtt`)).text()).toContain("WEBVTT");
  }
  expect(unique.size).toBe(15);
});
