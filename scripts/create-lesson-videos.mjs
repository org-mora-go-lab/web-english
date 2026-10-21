import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [audioDirectory, ffmpeg] = process.argv.slice(2);
const plans = JSON.parse(fs.readFileSync(path.join(audioDirectory, 'plans.json'), 'utf8'));
const manifest = {};
for (const plan of plans) {
  const folder = path.join(audioDirectory, plan.id);
  const metadata = `public/media/lessons/${plan.id}.json`;
  if (!fs.existsSync(metadata)) {
    const result = spawnSync(process.execPath, ['scripts/create-welcome-video.mjs', folder, ffmpeg, path.join(folder, 'plan.json')], { stdio: 'inherit' });
    if (result.status !== 0) throw new Error(`Could not render ${plan.id}`);
  }
  const data = JSON.parse(fs.readFileSync(metadata, 'utf8'));
  const seconds = Math.ceil(data.duration);
  manifest[plan.id] = {
    src: `/media/lessons/${plan.id}.mp4`,
    poster: `/media/lessons/${plan.id}-poster.webp`,
    captions: `/media/lessons/${plan.id}`,
    seconds: data.duration,
    label: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
    segments: data.segments,
  };
}
fs.writeFileSync('public/media/lessons/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Finished ${plans.length} distinct narrated videos.`);
