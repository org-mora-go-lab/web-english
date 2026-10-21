import { expect, test } from "@playwright/test";
test("영상 오디오와 자막 파일 제공", async ({ request }) => {
  const response = await request.get("/media/momo-welcome.mp4");
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("video/mp4");
  const body = await response.body();
  expect(body.toString("ascii", 4, 8)).toBe("ftyp");
  expect(body.includes(Buffer.from("soun"))).toBe(true);
  expect(body.includes(Buffer.from("vide"))).toBe(true);
  expect((await request.get("/media/momo-welcome-poster.webp")).ok()).toBe(
    true,
  );
  expect(
    await (await request.get("/media/momo-welcome.en.vtt")).text(),
  ).toContain("Hi! I'm Momo");
  expect(
    await (await request.get("/media/momo-welcome.ko.vtt")).text(),
  ).toContain("나는 너의 영어 친구 Momo야");
});
