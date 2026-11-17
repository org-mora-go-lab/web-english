import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { createClient } from '@libsql/client';
import { build } from 'esbuild';

const scenario = process.argv[2];
const prefix = `.tmp/text-stream-${randomUUID()}`;
await mkdir('.tmp', { recursive: true });
await build({ stdin: { contents: 'export { POST } from "./app/api/ai/chat/route"; export { getAiConversation } from "./src/4-entity/ai/history"; export { readServerEvents } from "./src/5-shared/http";', resolveDir: process.cwd() }, outfile: `${prefix}.cjs`, bundle: true, platform: 'node', format: 'cjs', packages: 'external', plugins: [{ name: 'test-account', setup(builder) {
  builder.onResolve({ filter: /^server-only$/ }, () => ({ path: 'empty', namespace: 'stub' }));
  builder.onResolve({ filter: /^@\/src\/4-entity\/account$/ }, () => ({ path: 'account', namespace: 'stub' }));
  builder.onLoad({ filter: /.*/, namespace: 'stub' }, args => ({ contents: args.path === 'account' ? 'export async function getActor() { return { id: "owner" }; }' : '' }));
} }] });
process.env.TURSO_DATABASE_URL = `file:./${prefix}.sqlite`;
process.env.TURSO_AUTH_TOKEN = ''; process.env.OPENAI_API_KEY = 'test-only-not-real'; process.env.OPENAI_ALLOWED_MODELS = '';
process.env.AUTH_SECRET = 'test-only-text-stream-secret';
const db = createClient({ url: process.env.TURSO_DATABASE_URL, timeout: 5000 });
for (const file of (await readdir('drizzle')).filter(file => /^\d+.*\.sql$/.test(file)).sort()) await db.executeMultiple(await readFile(`drizzle/${file}`, 'utf8'));
await db.execute("INSERT INTO users(id,email,display_name,password_hash,role,status,created_at,updated_at) VALUES('owner','owner@example.test','Owner','test','user','active',0,0)");
const api = await import(pathToFileURL(resolve(`${prefix}.cjs`)).href);
const encoder = new TextEncoder();
const calls = [];
globalThis.fetch = async (url, init) => {
  assert.equal(String(url), 'https://api.openai.com/v1/responses');
  const request = JSON.parse(init.body);
  assert.equal(request.stream, true); assert.equal(request.store, false);
  assert.equal(request.text.format.type, 'json_schema');
  assert.deepEqual(request.text.format.schema.required, ['reply', 'replySuggestion']);
  let controller;
  const body = new ReadableStream({ start(value) { controller = value; } });
  const call = { controller, signal: init.signal };
  init.signal.addEventListener('abort', () => { try { controller.error(new DOMException('Aborted', 'AbortError')); } catch {} }, { once: true });
  calls.push(call);
  return new Response(body, { headers: { 'Content-Type': 'text/event-stream' } });
};
const input = { conversationId: randomUUID(), turnId: randomUUID(), revision: 0, model: 'gpt-6-luna', mode: 'practice', messages: [{ role: 'user', content: 'Let us talk about a cat.' }] };
const request = () => new Request('http://localhost/api/ai/chat', { method: 'POST', headers: { origin: 'http://localhost', 'Content-Type': 'application/json', accept: 'text/event-stream' }, body: JSON.stringify(input) });
const wait = async predicate => { const deadline = Date.now() + 5000; while (!predicate()) { if (Date.now() > deadline) throw new Error('Text stream timed out'); await new Promise(resolve => setTimeout(resolve, 5)); } };
function emit(call, event) {
  const bytes = encoder.encode(`event: ${event.type}\r\ndata: ${JSON.stringify(event)}\r\n\r\n`);
  // Split Korean, emoji, CRLF and JSON escapes across byte boundaries.
  for (let i = 0; i < bytes.length; i += 3) call.controller.enqueue(bytes.slice(i, i + 3));
}
const reply = '고양이가 "Meow!" 하고 말해요.\nA cute cat 😸! Which toy does it like?';
const replySuggestion = 'It likes the red ball.';
function emitText(call) {
  const json = JSON.stringify({ reply, replySuggestion });
  for (let i = 0; i < json.length; i += 5) emit(call, { type: 'response.output_text.delta', delta: json.slice(i, i + 5) });
}
function finish(call) {
  emit(call, { type: 'response.completed', response: { status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ reply, replySuggestion }) }] }] } });
  call.controller.close();
}
async function collect(response) {
  assert.equal(response.status, 200); assert.match(response.headers.get('content-type'), /text\/event-stream/);
  const events = [];
  const done = (async () => { for await (const event of api.readServerEvents(response.body)) events.push(event); })();
  return { events, done };
}
try {
  const response = await api.POST(request());
  await wait(() => calls.length === 1);
  if (scenario === 'cancel') {
    const reader = response.body.getReader();
    emit(calls[0], { type: 'response.output_text.delta', delta: '{"reply":"취소할 본문' });
    const first = await reader.read(); assert.equal(first.done, false);
    await reader.cancel(); await wait(() => calls[0].signal.aborted);
    assert.equal((await db.execute('SELECT id FROM ai_conversations')).rows.length, 0);
  } else {
    const first = await collect(response);
    emitText(calls[0]); await wait(() => first.events.some(event => event.type === 'delta'));
    assert.equal(first.events.some(event => event.type === 'complete'), false);
    assert.equal((await db.execute('SELECT id FROM ai_conversations')).rows.length, 0);
    if (scenario === 'incomplete') {
      calls[0].controller.close(); await first.done;
      assert.equal(first.events.at(-1).type, 'error');
      assert.equal(first.events.at(-1).code, 'INCOMPLETE_RESPONSE');
      assert.equal((await db.execute('SELECT id FROM ai_conversations')).rows.length, 0);
      const retry = await collect(await api.POST(request())); await wait(() => calls.length === 2);
      emitText(calls[1]); finish(calls[1]); await retry.done;
      assert.equal(retry.events.at(-1).type, 'complete');
    } else {
      finish(calls[0]); await first.done;
      assert.equal(first.events.filter(event => event.type === 'delta').map(event => event.text).join(''), reply);
      assert.equal(first.events.at(-1).replySuggestion, replySuggestion);
      const quota = (await db.execute('SELECT key,count FROM rate_limits ORDER BY key')).rows;
      const replay = await api.POST(request()); const data = await replay.json();
      assert.equal(data.reply, reply); assert.equal(data.replySuggestion, replySuggestion);
      assert.equal(calls.length, 1);
      assert.deepEqual((await db.execute('SELECT key,count FROM rate_limits ORDER BY key')).rows, quota);
    }
    const saved = await api.getAiConversation('owner', input.conversationId);
    assert.equal(saved.messages.length, 2); assert.equal(saved.revision, 1);
    assert.equal(saved.messages[1].content, reply); assert.equal(saved.messages[1].replySuggestion, replySuggestion);
  }
  console.log('Text stream protocol passed. Real OpenAI calls: 0.');
} finally { db.close(); }
