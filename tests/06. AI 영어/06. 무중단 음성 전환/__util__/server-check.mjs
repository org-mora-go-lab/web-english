import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { createClient } from '@libsql/client';
import { build } from 'esbuild';

const scenario = process.argv[2];
assert.ok(['observer', 'warm'].includes(scenario));
const prefix = `.tmp/voice-protocol-${randomUUID()}`;
await writeFile(`${prefix}.ts`, 'export * from "../src/4-entity/ai/realtime"; export * from "../src/4-entity/ai/voice-stream"; export * from "../src/4-entity/ai/voice-warm"; export * from "../src/4-entity/ai/history";');
await build({ entryPoints: [`${prefix}.ts`], outfile: `${prefix}.cjs`, bundle: true, platform: 'node', packages: 'external', format: 'cjs', plugins: [{ name: 'test-transports', setup(b) {
  b.onResolve({ filter: /^server-only$/ }, () => ({ path: 'stub', namespace: 'empty' }));
  b.onLoad({ filter: /.*/, namespace: 'empty' }, () => ({ contents: '' }));
  b.onResolve({ filter: /^ws$/ }, () => ({ path: 'ws', namespace: 'socket' }));
  b.onLoad({ filter: /.*/, namespace: 'socket' }, () => ({ contents: `import { EventEmitter } from 'node:events'; import { randomUUID } from 'node:crypto'; export default class extends EventEmitter { static OPEN=1; readyState=0; constructor(url){super();this.callId=new URL(url).searchParams.get('call_id');globalThis.__voiceSockets.push(this);queueMicrotask(()=>{this.readyState=1;this.emit('open')})}send(data){const e=JSON.parse(data);if(e.type==='session.update')queueMicrotask(()=>this.emit('message',Buffer.from(JSON.stringify({type:'session.updated',event_id:randomUUID()}))))}close(){this.readyState=3;queueMicrotask(()=>this.emit('close'))}terminate(){this.close()}}` }));
} }] });
process.env.TURSO_DATABASE_URL = `file:./${prefix}.sqlite`;
process.env.TURSO_AUTH_TOKEN = ''; process.env.OPENAI_API_KEY = 'test-only-not-a-real-key';
process.env.AUTH_SECRET = 'test-only-voice-protocol-secret';
globalThis.__voiceSockets = [];
const db = createClient({ url: process.env.TURSO_DATABASE_URL, timeout: 5000 });
for (const file of (await readdir('drizzle')).filter(file => /^\d+.*\.sql$/.test(file)).sort()) await db.executeMultiple(await readFile(`drizzle/${file}`, 'utf8'));
await db.execute("INSERT INTO users(id,email,display_name,password_hash,role,status,created_at,updated_at) VALUES('owner','owner@example.test','Owner','test-hash','user','active',0,0),('other','other@example.test','Other','test-hash','user','active',0,0)");
const api = await import(pathToFileURL(resolve(`${prefix}.cjs`)).href);
const forms = []; let hangups = 0;
globalThis.fetch = async (url, init) => {
  if (String(url).endsWith('/hangup')) { hangups++; return new Response(null, { status: 200 }); }
  assert.equal(String(url), 'https://api.openai.com/v1/realtime/calls');
  const form = JSON.parse(init.body.get('session')); forms.push(form);
  assert.equal(form.model, 'gpt-realtime-2.1'); assert.equal(form.audio.output.voice, 'marin');
  return new Response('v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n', { status: 201, headers: { location: `/v1/realtime/calls/rtc_test_${forms.length}` } });
};
const controllers = []; const pumps = [];
const input = { sdp: 'v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n', conversationId: randomUUID(), revision: 0, mode: 'practice', voice: 'marin' };
const wait = async predicate => { const deadline = Date.now() + 8000; while (!predicate()) { if (Date.now() > deadline) throw new Error('Voice protocol condition timed out'); await new Promise(resolve => setTimeout(resolve, 20)); } };
async function watch(connection, previousObserverId) {
  const controller = new AbortController(); controllers.push(controller);
  const response = await api.watchRealtimeSession('owner', connection, controller.signal, 0, previousObserverId);
  const events = [];
  pumps.push((async () => { let buffer = ''; const decoder = new TextDecoder(); for await (const chunk of response.body) { buffer += decoder.decode(chunk); let end; while ((end = buffer.indexOf('\n')) !== -1) { events.push(JSON.parse(buffer.slice(0, end))); buffer = buffer.slice(end + 1); } } })());
  return { events, controller };
}
function emit(callId, event) {
  const actual = { event_id: randomUUID(), ...event };
  for (const socket of globalThis.__voiceSockets.filter(socket => socket.callId === callId && socket.readyState === 1)) socket.emit('message', Buffer.from(JSON.stringify(actual)));
  return actual;
}
async function turn(callId, label, events, count) {
  emit(callId, { type: 'input_audio_buffer.committed', item_id: `user_${label}` });
  emit(callId, { type: 'response.created', response: { id: `response_${label}` } });
  emit(callId, { type: 'conversation.item.input_audio_transcription.completed', item_id: `user_${label}`, transcript: `I remember ${label}.` });
  emit(callId, { type: 'response.done', response: { id: `response_${label}`, status: 'completed', output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_audio', transcript: `Let's talk about ${label}.` }] }] } });
  await wait(() => events.filter(event => event.kind === 'saved').length === count);
}
try {
  const connection = await api.startRealtime('owner', input, new AbortController().signal);
  const call = await api.getOwnedVoiceSession('owner', connection.sessionId);
  const first = await watch(connection); await wait(() => first.events.some(event => event.kind === 'ready'));
  const observerId = first.events.find(event => event.kind === 'session').observerId;
  if (scenario === 'observer') {
    emit(call.callId, { type: 'input_audio_buffer.committed', item_id: 'pending_user' });
    emit(call.callId, { type: 'response.created', response: { id: 'pending_response' } });
    // Completed output is waiting for its late transcription when the owner changes.
    emit(call.callId, { type: 'response.done', response: { id: 'pending_response', status: 'completed', output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_audio', transcript: 'I remember the rainbow.' }] }] } });
    const quota = (await db.execute('SELECT key,count FROM rate_limits ORDER BY key')).rows;
    const second = await watch({ sessionId: connection.sessionId }, observerId);
    await wait(() => second.events.some(event => event.kind === 'attached'));
    const overlap = emit(call.callId, { type: 'conversation.item.added', item: { id: 'overlap_user', role: 'user', content: [{ type: 'input_text', text: 'Overlapping event' }] } });
    await wait(() => second.events.some(event => event.kind === 'ready'));
    assert.ok(first.events.some(event => event.kind === 'detached')); assert.equal(hangups, 0); assert.equal(forms.length, 1);
    emit(call.callId, overlap);
    const completed = emit(call.callId, { type: 'conversation.item.input_audio_transcription.completed', item_id: 'pending_user', transcript: 'Our word is rainbow.' });
    await wait(() => second.events.some(event => event.kind === 'saved'));
    emit(call.callId, completed);
    await new Promise(resolve => setTimeout(resolve, 100));
    const saved = await api.getAiConversation('owner', input.conversationId);
    assert.equal(saved.revision, 1); assert.equal(saved.messages.length, 2); assert.equal(saved.messages[0].content, 'Our word is rainbow.');
    assert.deepEqual((await db.execute('SELECT key,count FROM rate_limits ORDER BY key')).rows, quota);
    first.controller.abort(); assert.equal((await api.getOwnedVoiceSession('owner', connection.sessionId)).status, 'active');
    await assert.rejects(api.watchRealtimeSession('other', { sessionId: connection.sessionId }, new AbortController().signal, 0, observerId), error => error.status === 404);
    await assert.rejects(api.watchRealtimeSession('owner', { sessionId: connection.sessionId }, new AbortController().signal, 0, observerId), error => error.status === 409);
  } else {
    await turn(call.callId, 'rainbow', first.events, 1);
    await db.execute({ sql: 'UPDATE ai_voice_sessions SET created_at=? WHERE id=?', args: [Date.now() - 31_000, call.id] });
    const quota = (await db.execute('SELECT key,count FROM rate_limits ORDER BY key')).rows;
    const next = await api.startRealtime('owner', { ...input, revision: 1, continuationOf: call.id }, new AbortController().signal);
    const child = await api.getOwnedVoiceSession('owner', next.sessionId);
    assert.equal(child.status, 'standby'); assert.equal((await api.getOwnedVoiceSession('owner', call.id)).status, 'active');
    const standby = await watch(next); await wait(() => standby.events.some(event => event.kind === 'ready'));
    await api.prepareWarmCall('owner', child.id, { action: 'context', revision: 1 });
    await wait(() => standby.events.some(event => event.kind === 'warm-ready' && event.revision === 1));
    await turn(call.callId, 'elephant', first.events, 2);
    await assert.rejects(api.prepareWarmCall('owner', child.id, { action: 'activate', revision: 1 }), error => error.status === 409);
    await api.prepareWarmCall('owner', child.id, { action: 'context', revision: 2 });
    await wait(() => standby.events.some(event => event.kind === 'warm-ready' && event.revision === 2));
    assert.equal(hangups, 0);
    await api.prepareWarmCall('owner', child.id, { action: 'activate', revision: 2 });
    assert.equal((await api.getOwnedVoiceSession('owner', call.id)).status, 'retiring');
    await api.prepareWarmCall('owner', child.id, { action: 'ready', revision: 2 });
    await turn(child.callId, 'continuity', standby.events, 1);
    assert.equal((await api.getAiConversation('owner', input.conversationId)).revision, 3);
    assert.deepEqual((await db.execute('SELECT key,count FROM rate_limits ORDER BY key')).rows, quota);
    assert.equal(hangups, 0); await api.endVoiceSession('owner', call.id);
    assert.equal((await api.getOwnedVoiceSession('owner', child.id)).status, 'active');
    await assert.rejects(api.prepareWarmCall('other', child.id, { action: 'context', revision: 3 }), error => error.status === 404);
  }
  console.log(`Voice ${scenario} protocol passed. Real OpenAI calls: 0.`);
} finally {
  controllers.forEach(controller => controller.abort());
  await Promise.allSettled(pumps);
  db.close();
}
