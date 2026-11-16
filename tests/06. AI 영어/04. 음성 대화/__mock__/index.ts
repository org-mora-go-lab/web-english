import type { Page } from "@playwright/test";

export type VoiceControls = {
  requests: { conversationId: string; revision: number; mode: string; voice: string; continuationOf?: string }[];
  observeRequests: { previousObserverId: string }[]; observerIds: string[]; microphones: number; sessionIds: string[];
  holdRenewal: boolean; holdWarm: boolean; stopped: number; closed: number; deletes: number; audioPauses: number;
  denied: boolean; track: { enabled: boolean }; enabledWrites: boolean[];
  emit: (event: unknown) => void; emitCall: (index: number, event: unknown) => void;
  rtc: (index: number, event: unknown) => void; disconnect: () => void; warm: () => void;
  senders: { track: unknown }[]; warmActions: { action: string; revision: number }[];
};

export async function mockVoice(page: Page) {
  await page.addInitScript({ content: `
    const voice = window.__voice = { requests: [], observeRequests: [], observerIds: [], microphones: 0, sessionIds: [], holdRenewal: false, holdWarm: false, stopped: 0, closed: 0, deletes: 0, denied: false, enabledWrites: [], audioPauses: 0, emit: null, track: null, pcs: [], calls: [], senders: [], warmActions: [] };
    const timeout = window.setTimeout.bind(window);
    window.setTimeout = (callback, delay, ...args) => { if (delay > 3200000 && delay < 3400000) voice.warm = () => callback(...args); return timeout(callback, delay, ...args); };
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => {
      if (voice.denied) throw new DOMException('Denied', 'NotAllowedError');
      voice.microphones++;
      let enabled = true;
      const track = { get enabled() { return enabled; }, set enabled(value) { enabled = value; voice.enabledWrites.push(value); }, stop: () => { voice.stopped++; } }; voice.track = track;
      return { getTracks: () => [track], getAudioTracks: () => [track] };
    } } });
    window.RTCPeerConnection = class {
      iceGatheringState = 'complete'; connectionState = 'connected';
      constructor() { voice.pcs.push(this); this.sender = { track: null, replaceTrack: async track => { this.sender.track = track; } }; voice.senders.push(this.sender); voice.disconnect = () => { this.connectionState = 'disconnected'; this.onconnectionstatechange?.(); }; }
      addTrack(track) { this.sender.track = track; return this.sender; }
      addTransceiver() { return { sender: this.sender }; }
      createDataChannel() { return this.channel = { readyState: 'open', send() {} }; }
      async createOffer() { return { type: 'offer', sdp: 'v=0\\r\\nm=audio 9 UDP/TLS/RTP/SAVPF 111\\r\\n' }; }
      async setLocalDescription(value) { this.localDescription = value; }
      async setRemoteDescription() { this.ontrack?.({ streams: [new MediaStream()] }); this.onconnectionstatechange?.(); }
      close() { this.connectionState = 'closed'; voice.closed++; }
    };
    HTMLMediaElement.prototype.play = async function () {};
    HTMLMediaElement.prototype.pause = function () { voice.audioPauses++; };
    voice.emit = event => { const call = voice.calls.find(call => call.pc.sender.track && call.pc.connectionState !== 'closed') ?? voice.calls.at(-1); call?.emit(event); };
    voice.emitCall = (index, event) => voice.calls[index]?.emit(event);
    voice.rtc = (index, event) => voice.pcs[index]?.channel?.onmessage?.({ data: JSON.stringify(event) });
    const stream = (call, signal, initial) => {
      let alive = true;
      return new Response(new ReadableStream({ start(controller) {
        const old = call.emit; const oldClose = call.close;
        const emit = event => { if (alive) controller.enqueue(new TextEncoder().encode(JSON.stringify(event) + '\\n')); };
        call.emit = emit; call.close = () => { alive = false; try { controller.close(); } catch {} };
        const observerId = crypto.randomUUID(); voice.observerIds.push(observerId); call.observerId = observerId;
        if (initial) emit({ kind: 'session', sessionId: call.id, observerId, sdp: 'v=0\\r\\nm=audio 9 UDP/TLS/RTP/SAVPF 111\\r\\n', model: 'gpt-realtime-2.1', expiresAt: Date.now() + 3600000 });
        else { emit({ kind: 'observer', observerId }); emit({ kind: 'attached', observerId }); old({ kind: 'detached' }); oldClose(); }
        emit({ kind: 'ready', observerId });
        signal.addEventListener('abort', () => call.close());
      }, cancel() { alive = false; } }), { headers: { 'Content-Type': 'application/x-ndjson' } });
    };
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (url, init) => {
      const path = String(url);
      if (path === '/api/ai/realtime' && init?.method === 'POST') {
        const input = JSON.parse(init.body); voice.requests.push(input);
        const id = crypto.randomUUID(); voice.sessionIds.push(id);
        const call = { id, pc: voice.pcs.at(-1), emit: null, close: null }; voice.calls.push(call);
        return stream(call, init.signal, true);
      }
      if (path.endsWith('/observe') && init?.method === 'POST') {
        voice.observeRequests.push(JSON.parse(init.body));
        if (voice.holdRenewal) return new Promise((resolve, reject) => init.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))));
        const id = path.split('/').at(-2); const call = voice.calls.find(call => call.id === id);
        return stream(call, init.signal, false);
      }
      if (path.endsWith('/warm') && init?.method === 'POST') {
        const input = JSON.parse(init.body); voice.warmActions.push(input);
        const call = voice.calls.find(call => call.id === path.split('/').at(-2));
        if (input.action === 'context' && !voice.holdWarm) timeout(() => call.emit({ kind: 'warm-ready', revision: input.revision }), 20);
        return Response.json({ ok: true });
      }
      if (path.startsWith('/api/ai/realtime/') && init?.method === 'DELETE') { voice.deletes++; return Response.json({ ok: true }); }
      return originalFetch(url, init);
    };
  ` });
}
export async function voiceEvent(page: Page, event: unknown) {
  await page.evaluate(event => (window as unknown as { __voice: VoiceControls }).__voice.emit(event), event);
}
export async function voiceRtcEvent(page: Page, event: unknown, index = 0) {
  await page.evaluate(({ event, index }) => (window as unknown as { __voice: VoiceControls }).__voice.rtc(index, event), { event, index });
}
export const voiceState = (page: Page) => page.evaluate(() => {
  const voice = (window as unknown as { __voice: VoiceControls }).__voice;
  return { starts: voice.requests.length, requests: voice.requests, observerStarts: voice.observeRequests.length, observerRequests: voice.observeRequests, observerIds: voice.observerIds, microphones: voice.microphones, sessionIds: voice.sessionIds, stopped: voice.stopped, closed: voice.closed, deletes: voice.deletes, audioPauses: voice.audioPauses, enabled: voice.track?.enabled, enabledWrites: voice.enabledWrites, attachedSenders: voice.senders.map(sender => Boolean(sender.track)), warmActions: voice.warmActions };
});
