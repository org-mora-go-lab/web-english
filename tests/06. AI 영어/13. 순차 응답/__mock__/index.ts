import type { Page } from "@playwright/test";

export async function mockChatStream(page: Page) {
  await page.addInitScript(() => {
    const original = window.fetch.bind(window);
    const streams: ReadableStreamDefaultController<Uint8Array>[] = [];
    const encoder = new TextEncoder();
    const state = window as typeof window & { chatStream?: { send: (index: number, event: unknown, close: boolean) => void; requests: number; cancelled: number } };
    state.chatStream = { requests: 0, cancelled: 0, send(index, event, close) {
      try { streams[index].enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`)); if (close) streams[index].close(); } catch { /* Late data after cancellation is ignored. */ }
    } };
    window.fetch = (input, init) => {
      if (String(input) !== "/api/ai/chat") return original(input, init);
      state.chatStream!.requests++;
      const body = new ReadableStream<Uint8Array>({ start(controller) { streams.push(controller); }, cancel() { state.chatStream!.cancelled++; } });
      return Promise.resolve(new Response(body, { headers: { "Content-Type": "text/event-stream" } }));
    };
  });
}

export async function chatStreamState(page: Page) {
  return page.evaluate(() => {
    const state = (window as typeof window & { chatStream: { requests: number; cancelled: number } }).chatStream;
    return { requests: state.requests, cancelled: state.cancelled };
  });
}

export async function sendChatEvent(page: Page, index: number, event: unknown, close = false) {
  await page.evaluate(({ index, event, close }) => {
    (window as typeof window & { chatStream: { send: (index: number, event: unknown, close: boolean) => void } }).chatStream.send(index, event, close);
  }, { index, event, close });
}
