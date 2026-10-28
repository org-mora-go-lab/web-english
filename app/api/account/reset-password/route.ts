import { checkRateLimit, resetPassword, resetSchema } from "@/src/4-entity/account";
import { jsonError, sameOrigin } from "@/src/5-shared/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("요청 출처가 올바르지 않습니다.", 403);
  const parsed = resetSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("입력값을 확인해 주세요.");
  if (!(await checkRateLimit(request, "reset", parsed.data.token, 10, 60 * 60_000))) return jsonError("잠시 후 다시 시도해 주세요.", 429);
  return (await resetPassword(parsed.data.token, parsed.data.password)) ? Response.json({ ok: true }) : jsonError("재설정 링크가 만료되었거나 이미 사용되었습니다.");
}
