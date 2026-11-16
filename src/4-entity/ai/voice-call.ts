import "server-only";

export async function hangupRealtimeCall(callId: string) {
  if (!/^rtc_[a-zA-Z0-9_-]+$/.test(callId)) return;
  const response = await fetch(`https://api.openai.com/v1/realtime/calls/${callId}/hangup`, {
    method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY?.trim()}` }, signal: AbortSignal.timeout(8_000),
  });
  await response.body?.cancel();
  if (!response.ok && response.status !== 404) throw new Error("Realtime hangup failed");
}
