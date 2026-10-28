import { del } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { changePassword, getActor, normalizeEmail, passwordChangeSchema, publicUser, requestEmailChange, verifyPassword } from "@/src/4-entity/account";
import { getDb, schema } from "@/src/5-shared/db";
import { jsonError, sameOrigin } from "@/src/5-shared/http";

export async function GET() {
  const actor = await getActor();
  return actor ? Response.json({ user: publicUser(actor) }) : jsonError("로그인이 필요합니다.", 401);
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return jsonError("요청 출처가 올바르지 않습니다.", 403);
  const actor = await getActor();
  if (!actor) return jsonError("로그인이 필요합니다.", 401);
  const body = await request.json().catch(() => null);
  if (body?.type === "profile") {
    const parsed = z.string().trim().min(2).max(40).safeParse(body.displayName);
    if (!parsed.success) return jsonError("닉네임은 2~40자로 입력해 주세요.");
    await getDb().update(schema.users).set({ displayName: parsed.data, updatedAt: Date.now() }).where(eq(schema.users.id, actor.id));
    return Response.json({ ok: true });
  }
  if (body?.type === "email") {
    let email: string;
    try { email = normalizeEmail(body.email); } catch { return jsonError("이메일 형식을 확인해 주세요."); }
    if (email === actor.email) return Response.json({ ok: true });
    await requestEmailChange(actor.id, email);
    return Response.json({ message: "사용 가능한 주소라면 인증 이메일을 발송했습니다." });
  }
  if (body?.type === "password") {
    const parsed = passwordChangeSchema.safeParse(body);
    if (!parsed.success) return jsonError("새 비밀번호 형식을 확인해 주세요.");
    return (await changePassword(actor.id, parsed.data.currentPassword, parsed.data.newPassword)) ? Response.json({ ok: true }) : jsonError("현재 비밀번호가 올바르지 않습니다.", 403);
  }
  return jsonError("지원하지 않는 변경입니다.");
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return jsonError("요청 출처가 올바르지 않습니다.", 403);
  const actor = await getActor();
  if (!actor) return jsonError("로그인이 필요합니다.", 401);
  const body = await request.json().catch(() => null);
  if (body?.confirmation !== "DELETE" || typeof body.password !== "string") return jsonError("탈퇴 확인과 비밀번호가 필요합니다.");
  if (!(await verifyPassword(actor.passwordHash, body.password))) return jsonError("비밀번호가 올바르지 않습니다.", 403);
  const assets = await getDb().query.mediaAssets.findMany({ where: eq(schema.mediaAssets.ownerId, actor.id) });
  for (const asset of assets) await del(asset.storageKey);
  await getDb().delete(schema.users).where(eq(schema.users.id, actor.id));
  // All user-owned rows have cascading foreign keys. The caller then signs out.
  return Response.json({ ok: true });
}
