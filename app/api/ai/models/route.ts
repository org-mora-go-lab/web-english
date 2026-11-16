import { getAiModelList } from "@/src/4-entity/ai/server";

export const runtime = "nodejs";

export function GET() {
  return Response.json(getAiModelList(), { headers: { "Cache-Control": "no-store" } });
}
