import { checkRateLimit, register, signupSchema } from "@/src/4-entity/account";
import { jsonError, sameOrigin } from "@/src/5-shared/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("요청 출처가 올바르지 않습니다.", 403);
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) return jsonError("입력값을 확인해 주세요.");
  if (!(await checkRateLimit(request, "signup", parsed.data.email, 5, 60 * 60_000))) return jsonError("잠시 후 다시 시도해 주세요.", 429);
  try {
    await register(parsed.data);
    return Response.json({ message: "가입 요청을 처리했습니다." });
  } catch (error) {
    console.error("Signup failed", error);
    return jsonError("가입 요청을 처리하지 못했습니다.", 503);
  }
}
