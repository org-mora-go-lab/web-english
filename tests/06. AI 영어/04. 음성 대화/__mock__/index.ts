import type { Page } from "@playwright/test";

export type VoiceControls = { requests: { conversationId: string; revision: number; mode: string; voice: string }[]; stopped: number; closed: number; deletes: number; denied: boolean; track: { enabled: boolean }; emit: (event: unknown) => void };

export async function mockVoice(page: Page) {
  await page.addInitScript({ content: `
    window.__voice = { requests: [], stopped: 0, closed: 0, deletes: 0, denied: false, emit: null, track: null };
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => {
      if (window.__voice.denied) throw new DOMException('Denied', 'NotAllowedError');
      const track = { enabled: true, stop: () => { window.__voice.stopped++; } }; window.__voice.track = track;
      return { getTracks: () => [track], getAudioTracks: () => [track] };
    } } });
    window.RTCPeerConnection = class {
      iceGatheringState = 'complete'; connectionState = 'connected';
      addTrack() {} createDataChannel() { return { send() {} }; }
      async createOffer() { return { type: 'offer', sdp: 'v=0\\r\\nm=audio 9 UDP/TLS/RTP/SAVPF 111\\r\\n' }; }
      async setLocalDescription(value) { this.localDescription = value; }
      async setRemoteDescription() { this.ontrack?.({ streams: [new MediaStream()] }); }
      close() { window.__voice.closed++; }
    };
    HTMLMediaElement.prototype.play = async function () {};
    HTMLMediaElement.prototype.pause = function () {};
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (url, init) => {
      if (String(url) === '/api/ai/realtime' && init?.method === 'POST') {
        const input = JSON.parse(init.body); window.__voice.requests.push(input);
        let alive = true;
        return new Response(new ReadableStream({ start(controller) {
          const emit = event => { if (alive) controller.enqueue(new TextEncoder().encode(JSON.stringify(event) + '\\n')); };
          window.__voice.emit = emit;
          emit({ kind: 'session', sessionId: crypto.randomUUID(), sdp: 'v=0\\r\\nm=audio 9 UDP/TLS/RTP/SAVPF 111\\r\\n', model: 'gpt-realtime-2.1', expiresAt: Date.now() + 180000 });
          emit({ kind: 'ready' });
          init.signal.addEventListener('abort', () => { alive = false; try { controller.close(); } catch {} });
        } }), { headers: { 'Content-Type': 'application/x-ndjson' } });
      }
      if (String(url).startsWith('/api/ai/realtime/') && init?.method === 'DELETE') { window.__voice.deletes++; return Response.json({ ok: true }); }
      return originalFetch(url, init);
    };
  ` });
}

export async function voiceEvent(page: Page, event: unknown) {
  await page.evaluate(event => (window as unknown as { __voice: VoiceControls }).__voice.emit(event), event);
}

export const voiceState = (page: Page) => page.evaluate(() => {
  const voice = (window as unknown as { __voice: VoiceControls }).__voice;
  return { starts: voice.requests.length, requests: voice.requests, stopped: voice.stopped, closed: voice.closed, deletes: voice.deletes, enabled: voice.track?.enabled };
});
