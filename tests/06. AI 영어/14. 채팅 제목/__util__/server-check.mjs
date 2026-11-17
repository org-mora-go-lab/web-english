import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { createClient } from '@libsql/client';
import { build } from 'esbuild';

const prefix = `.tmp/title-${randomUUID()}`;
await mkdir('.tmp', { recursive: true });
await build({ stdin: { contents: 'export { generateAiReply } from "./src/4-entity/ai/server"; export { saveAiTurn, prepareAiTurn, getAiConversation } from "./src/4-entity/ai/history";', resolveDir: process.cwd() }, outfile: `${prefix}.cjs`, bundle: true, platform: 'node', format: 'cjs', packages: 'external', plugins: [{ name: 'server-stub', setup(b) {
  b.onResolve({ filter: /^server-only$/ }, () => ({ path: 'empty', namespace: 'stub' }));
  b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: '' }));
} }] });
process.env.TURSO_DATABASE_URL = `file:./${prefix}.sqlite`; process.env.TURSO_AUTH_TOKEN = '';
process.env.OPENAI_API_KEY = 'test-only-key'; process.env.OPENAI_ALLOWED_MODELS = '';
const db = createClient({ url: process.env.TURSO_DATABASE_URL });
for (const name of (await readdir('drizzle')).filter(f => /^\d+.*\.sql$/.test(f)).sort()) await db.executeMultiple(await readFile(`drizzle/${name}`, 'utf8'));
await db.execute("INSERT INTO users(id,email,display_name,password_hash,role,status,created_at,updated_at) VALUES('owner','titles@example.test','Title','test','user','active',0,0)");
const api = await import(pathToFileURL(resolve(`${prefix}.cjs`)).href);
let calls = 0;
const input = content => ({ conversationId: randomUUID(), revision: 0, turnId: randomUUID(), model: 'gpt-6-luna', mode: 'parent', messages: [{ role: 'user', content }] });
globalThis.fetch = async (url, init) => {
  calls++; assert.equal(url, 'https://api.openai.com/v1/responses');
  const data = JSON.parse(init.body); assert.ok(data.text.format.schema.required.includes('conversationTitle'));
  return Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ reply: 'What did you do today?', replySuggestion: 'I played with my child.', conversationTitle: calls === 1 ? '하루 이야기 영어' : '다른 주제' }) }] }] });
};
try {
  const first = input("I'd like to practice talking about my day and playing with my toddler in simple English.");
  const turn = await api.prepareAiTurn('owner', first);
  const reply = process.argv[2] === 'voice' ? { reply: 'How was your day?', model: 'gpt-realtime-2.1' } : await api.generateAiReply(turn.input);
  const saved = await api.saveAiTurn('owner', first, turn.previous, reply);
  assert.equal(saved.title, '하루 이야기 영어');
  const next = { ...first, revision: 1, turnId: randomUUID(), messages: [{ role: 'user', content: 'Can we talk about a cat now?' }] };
  const second = await api.prepareAiTurn('owner', next);
  const secondReply = process.argv[2] === 'voice' ? { reply: 'Meow!', model: 'gpt-realtime-2.1' } : await api.generateAiReply(second.input);
  const continued = await api.saveAiTurn('owner', next, second.previous, secondReply);
  assert.equal(continued.title, saved.title);
  assert.equal(calls, process.argv[2] === 'voice' ? 0 : 2);
  assert.equal((await api.getAiConversation('owner', first.conversationId)).title, saved.title);
  const content = input('영어 학습 콘텐츠 “손 흔들며 인사”로 대화를 시작해 주세요.\n[MORA_PLAY:hello-wave]');
  const played = await api.saveAiTurn('owner', content, null, { reply: 'Hello!', model: 'gpt-6-luna', conversationTitle: 'AI가 만든 다른 제목' });
  assert.equal(played.title, '손 흔들며 인사');
  console.log('Chat title check passed. Real OpenAI calls: 0.');
} finally { db.close(); }
