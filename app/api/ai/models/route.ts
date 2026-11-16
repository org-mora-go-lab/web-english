import { getActor } from "@/src/4-entity/account";
import { AiError, aiErrorResponse, getAiModelList } from "@/src/4-entity/ai/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!(await getActor())) throw new AiError("로그인 후 AI를 이용해 주세요.", 401, "AUTH_REQUIRED");
    return Response.json(getAiModelList(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
