import { checkRateLimit, verifyEmail } from "@/src/4-entity/account";
import { jsonError, sameOrigin } from "@/src/5-shared/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("요청 출처가 올바르지 않습니다.", 403);
  const token = (await request.json().catch(() => null))?.token;
  if (typeof token !== "string" || token.length < 20) return jsonError("인증 링크가 올바르지 않습니다.");
  if (!(await checkRateLimit(request, "verify", token, 5, 60 * 60_000))) return jsonError("잠시 후 다시 시도해 주세요.", 429);
  return (await verifyEmail(token)) ? Response.json({ ok: true }) : jsonError("인증 링크가 만료되었거나 이미 사용되었습니다.");
}
