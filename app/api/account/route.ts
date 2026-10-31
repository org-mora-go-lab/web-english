import { del } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { auth, changeEmail, changePassword, getActor, normalizeEmail, passwordChangeSchema, publicUser, verifyPassword } from "@/src/4-entity/account";
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
    if (actor.kakaoId) return jsonError("카카오 프로필에서 이름을 변경해 주세요.", 403);
    const parsed = z.string().trim().min(2).max(40).safeParse(body.displayName);
    if (!parsed.success) return jsonError("닉네임은 2~40자로 입력해 주세요.");
    await getDb().update(schema.users).set({ displayName: parsed.data, updatedAt: Date.now() }).where(eq(schema.users.id, actor.id));
    return Response.json({ ok: true });
  }
  if (body?.type === "email") {
    if (actor.kakaoId) return jsonError("카카오 계정의 로그인 이메일은 여기서 변경할 수 없습니다.", 403);
    let email: string;
    try { email = normalizeEmail(body.email); } catch { return jsonError("이메일 형식을 확인해 주세요."); }
    if (typeof body.currentPassword !== "string") return jsonError("현재 비밀번호를 입력해 주세요.");
    const result = await changeEmail(actor.id, body.currentPassword, email);
    if (result === "invalid_password") return jsonError("현재 비밀번호가 올바르지 않습니다.", 403);
    if (result === "unavailable") return jsonError("이메일을 변경할 수 없습니다.", 409);
    return Response.json({ message: "이메일을 변경했습니다. 다시 로그인해 주세요." });
  }
  if (body?.type === "password") {
    if (actor.kakaoId) return jsonError("카카오 계정에는 별도 비밀번호가 없습니다.", 403);
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
  if (body?.confirmation !== "DELETE") return jsonError("탈퇴 확인이 필요합니다.");
  if (actor.kakaoId) {
    const session = await auth();
    if (!session?.user.signedInAt || Date.now() - session.user.signedInAt > 10 * 60_000) return jsonError("카카오 계정으로 다시 로그인한 뒤 탈퇴해 주세요.", 403);
  } else if (typeof body.password !== "string" || !(await verifyPassword(actor.passwordHash, body.password))) return jsonError("비밀번호가 올바르지 않습니다.", 403);
  const assets = await getDb().query.mediaAssets.findMany({ where: eq(schema.mediaAssets.ownerId, actor.id) });
  for (const asset of assets) await del(asset.storageKey);
  await getDb().delete(schema.users).where(eq(schema.users.id, actor.id));
  // All user-owned rows have cascading foreign keys. The caller then signs out.
  return Response.json({ ok: true });
}
