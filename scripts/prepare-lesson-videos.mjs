import fs from 'node:fs';
import path from 'node:path';

import ts from 'typescript';
const source = fs.readFileSync('src/4-entity/lesson/constant/index.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exportsObject = {};
new Function('exports', compiled)(exportsObject);
const directory = process.argv[2];
fs.mkdirSync(directory, { recursive: true });
const plans = exportsObject.lessons.map((lesson, index) => ({
  id: lesson.id,
  headline: lesson.headline.join(' '),
  number: index + 1,
  color: lesson.color,
  segments: [
    { kind: 'intro', text: `Hi! I'm Momo. Let's practice ${lesson.headline.join(' ')}.`, korean: lesson.goal },
    ...lesson.vocabulary.map(item => ({ kind: 'vocabulary', text: item.word, korean: item.meaning })),
    ...lesson.phrases.map(item => ({ kind: 'phrase', text: item.english, korean: item.korean })),
    ...lesson.dialogue.map(item => ({ kind: 'dialogue', text: item.english, korean: `${item.speaker}: ${item.korean}` })),
    { kind: 'review', text: `Remember this expression. ${lesson.quiz.options[lesson.quiz.answer]}`, korean: lesson.quiz.explanation },
    { kind: 'outro', text: 'Great job! Pause, repeat, and make it your own. See you in the next lesson!', korean: lesson.tip },
  ],
}));
fs.writeFileSync(path.join(directory, 'plans.json'), JSON.stringify(plans, null, 2));
console.log(`Prepared ${plans.length} original lesson videos.`);
