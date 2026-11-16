import { getActor } from "@/src/4-entity/account";
import { listAiConversations } from "@/src/4-entity/ai/history";
import { AiError, aiErrorResponse } from "@/src/4-entity/ai/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const actor = await getActor();
    if (!actor) throw new AiError("로그인이 필요합니다.", 401, "AUTH_REQUIRED");
    return Response.json(await listAiConversations(actor.id), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return aiErrorResponse(error); }
}
