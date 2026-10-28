import { randomUUID } from "node:crypto";

import { put } from "@vercel/blob";
import { desc, eq } from "drizzle-orm";

import { getActor } from "@/src/4-entity/account";
import { getDb, schema } from "@/src/5-shared/db";
import { jsonError, sameOrigin } from "@/src/5-shared/http";

export async function GET() {
  const actor = await getActor();
  if (!actor) return jsonError("로그인이 필요합니다.", 401);
  const assets = await getDb().query.mediaAssets.findMany({ where: eq(schema.mediaAssets.ownerId, actor.id), orderBy: desc(schema.mediaAssets.createdAt), limit: 100 });
  return Response.json({ assets });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("요청 출처가 올바르지 않습니다.", 403);
  const actor = await getActor();
  if (!actor) return jsonError("로그인이 필요합니다.", 401);
  const file = (await request.formData().catch(() => null))?.get("file");
  if (!(file instanceof File) || file.size > 5 * 1024 * 1024 || file.size === 0 || !["image/png", "image/jpeg", "image/webp"].includes(file.type)) return jsonError("PNG, JPEG, WebP 이미지(5MB 이하)만 업로드할 수 있습니다.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const png = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const webp = String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (!(file.type === "image/png" && png || file.type === "image/jpeg" && jpeg || file.type === "image/webp" && webp)) return jsonError("이미지 파일 형식이 올바르지 않습니다.");
  if (!process.env.BLOB_READ_WRITE_TOKEN) return jsonError("이미지 저장소가 설정되지 않았습니다.", 503);
  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const id = randomUUID();
  const blob = await put(`mora/${actor.id}/${id}.${ext}`, Buffer.from(bytes), { access: "private", contentType: file.type, addRandomSuffix: false });
  const asset = { id, ownerId: actor.id, storageKey: blob.pathname, url: `/api/media/${id}/file`, mimeType: file.type, size: file.size, createdAt: Date.now() };
  await getDb().insert(schema.mediaAssets).values(asset);
  return Response.json({ asset }, { status: 201 });
}
