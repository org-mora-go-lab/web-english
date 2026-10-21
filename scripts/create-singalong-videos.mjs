/* Original 1080p/30fps animated storybook sing-alongs. No paid services. */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import sharp from "sharp";

const [productionDirectory, ffmpeg, onlyId] = process.argv.slice(2);
const root = path.resolve(productionDirectory);
const output = path.resolve("public/media/singalong");
const plans = JSON.parse(fs.readFileSync(path.join(root, "plans.json"), "utf8"));
const escape = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const vocab = {
  bear: ["HELLO", "WAVE", "CLAP"], rabbit: ["HOP", "STOP", "SIT"], duck: ["DUCK", "QUACK", "SPLASH"],
  fox: ["RED", "BLUE", "YELLOW"], elephant: ["BIG", "SMALL", "UP"], lion: ["ONE", "TWO", "THREE"],
  panda: ["NOSE", "HANDS", "KNEES"], turtle: ["SLOW", "FAST", "STOP"], puppy: ["WAG", "CLAP", "DANCE"], kitten: ["STARS", "NIGHT", "DREAMS"],
};
function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: ["ignore", "pipe", "inherit"] });
    let lastProgress = 0;
    child.stdout.on("data", chunk => { const matches = [...String(chunk).matchAll(/out_time_ms=(\d+)/g)]; for (const match of matches) { const seconds = Math.floor(Number(match[1]) / 1000000); if (seconds >= lastProgress + 10) { console.log(`Encoded ${seconds}s`); lastProgress = seconds; } } });
    child.on("error", reject);
    child.on("exit", code => code === 0 ? resolve() : reject(new Error(`FFmpeg exited ${code}`)));
  });
}
function timecode(seconds) {
  const ms = Math.round(seconds * 1000);
  return `${String(Math.floor(ms / 3600000)).padStart(2, "0")}:${String(Math.floor(ms / 60000) % 60).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`;
}
async function render(plan, index) {
  const metadata = JSON.parse(fs.readFileSync(path.join(root, "audio", plan.id, "song.json"), "utf8"));
  const destination = path.join(output, `${plan.id}.mp4`);
  const props = path.join(root, "assets", `${plan.id}-props.png`);
  const colors = ["#f4b6a8", "#b2d8e6", "#f4d47c"];
  const blocks = vocab[plan.animal].map((word, number) => {
    const x = 1220 + (number % 2) * 280, y = 250 + Math.floor(number / 2) * 235;
    return `<g transform="translate(${x} ${y}) rotate(${number % 2 ? 5 : -5})"><rect width="240" height="200" rx="32" fill="#000" opacity=".1" x="5" y="10"/><rect width="240" height="200" rx="32" fill="${colors[number]}"/><rect x="12" y="12" width="216" height="176" rx="26" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3"/><text x="120" y="120" text-anchor="middle" fill="#5c5246" font-family="Arial" font-size="${word.length > 5 ? 36 : 43}" font-weight="bold">${word}</text></g>`;
  }).join("");
  const svg = `<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg"><defs><filter id="shadow"><feGaussianBlur stdDeviation="14"/></filter></defs><rect x="55" y="45" width="690" height="155" rx="38" fill="#fffdf4" opacity=".94"/><text x="92" y="94" font-family="Arial" font-size="23" letter-spacing="5" fill="#829077">MORA LITTLE FRIENDS · ${String(plan.number).padStart(2, "0")}</text><text x="92" y="158" font-family="Georgia" font-size="52" font-weight="bold" fill="#4d5b44">${escape(plan.name)}'s ${escape(vocab[plan.animal][0].toLowerCase())} song</text>${blocks}<ellipse cx="880" cy="995" rx="300" ry="28" fill="#554c33" opacity=".16" filter="url(#shadow)"/><circle cx="150" cy="530" r="38" fill="#fff" opacity=".5"/><circle cx="1800" cy="180" r="26" fill="#fff" opacity=".5"/><circle cx="1220" cy="720" r="18" fill="#ffe89a" opacity=".7"/></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(props);
  if (!fs.existsSync(destination) || !fs.existsSync(path.join(output, `${plan.id}.json`))) {
    const background = path.join(root, "assets", plan.animal === "kitten" ? "garden-night.png" : "garden-day.png");
    const animals = [plan.animal, plans[(index + 1) % plans.length].animal, plans[(index + 4) % plans.length].animal];
    const args = [];
    for (const image of [background, ...animals.map(animal => path.join(root, "assets", `${animal}.png`)), props]) args.push("-framerate", "30", "-i", image);
    args.push("-i", path.join(root, "audio", plan.id, "song.wav"));
    const beat = 60 / plan.bpm;
    const playStart = metadata.chapters.play, repeatStart = metadata.chapters.repeat;
    const filters = [
      "[0:v]scale=2016:1134,loop=loop=-1:size=1:start=0,setpts=N/(30*TB),crop=1920:1080:x='48+18*sin(t/9)':y='27+12*cos(t/11)',setsar=1[bg]",
      `[1:v]scale=800:800:force_original_aspect_ratio=decrease,pad=800:800:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba,loop=loop=-1:size=1:start=0,setpts=N/(30*TB),rotate='0.028*sin(2*PI*t/4)':ow=840:oh=840:c=none[lead]`,
      "[2:v]scale=470:470:force_original_aspect_ratio=decrease,pad=470:470:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba,loop=loop=-1:size=1:start=0,setpts=N/(30*TB),rotate='0.045*sin(t*2)':ow=510:oh=510:c=none[friend]",
      "[3:v]scale=380:380:force_original_aspect_ratio=decrease,pad=380:380:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba,loop=loop=-1:size=1:start=0,setpts=N/(30*TB),rotate='0.035*cos(t*2)':ow=420:oh=420:c=none[buddy]",
      `[bg][friend]overlay=x='1350+25*sin(t/4)':y='560-18*abs(sin(PI*t/${beat}))':enable='gte(t,${metadata.chapters.song + 6})'[a]`,
      `[a][buddy]overlay=x='65+25*cos(t/5)':y='650-14*abs(sin(PI*t/${beat}))':enable='gte(t,${playStart})'[b]`,
      `[b][lead]overlay=x='if(lt(t,${metadata.chapters.song}),570,if(between(t,${playStart},${repeatStart}),570,300))+45*sin(t/6)':y='215-${plan.animal === "rabbit" || plan.animal === "puppy" ? 48 : 18}*abs(sin(PI*t/${beat}))'[c]`,
      "[c][4:v]overlay=x=0:y='8*sin(t/3)'[video]",
    ];
    args.push("-progress", "pipe:1", "-filter_complex_threads", "2", "-filter_complex", filters.join(";"), "-map", "[video]", "-map", "5:a:0", "-t", String(metadata.duration), "-c:v", "libx264", "-threads", "2", "-preset", "veryfast", "-crf", "21", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", destination.replace(".mp4", ".working.mp4"));
    console.log(`Rendering 1080p/30fps: ${plan.id}`);
    await run(args);
    fs.renameSync(destination.replace(".mp4", ".working.mp4"), destination);
  }
  await run(["-ss", "2", "-i", destination, "-frames:v", "1", "-vf", "scale=1280:720", "-quality", "86", path.join(output, `${plan.id}-poster.webp`)]);
  for (const language of ["en", "ko"]) {
    const content = "WEBVTT\n\n" + metadata.segments.map((segment, segmentIndex) => `${segmentIndex + 1}\n${timecode(segment.start)} --> ${timecode(segment.end)}\n${language === "en" ? segment.text : segment.korean}\n`).join("\n");
    fs.writeFileSync(path.join(output, `${plan.id}.${language}.vtt`), content);
  }
  fs.writeFileSync(path.join(output, `${plan.id}.json`), JSON.stringify({ ...metadata, width: 1920, height: 1080, fps: 30 }, null, 2) + "\n");
  console.log(`Completed ${plan.id}: ${Math.round(fs.statSync(destination).size / 1024)} KiB`);
}
fs.mkdirSync(output, { recursive: true });
for (let index = 0; index < plans.length; index++) if (!onlyId || plans[index].id === onlyId) await render(plans[index], index);
const manifest = {};
for (const plan of plans) {
  const file = path.join(output, `${plan.id}.json`);
  if (!fs.existsSync(file)) continue;
  const metadata = JSON.parse(fs.readFileSync(file, "utf8"));
  const seconds = Math.ceil(metadata.duration);
  manifest[plan.id] = { src: `/media/singalong/${plan.id}.mp4`, poster: `/media/singalong/${plan.id}-poster.webp`, captions: `/media/singalong/${plan.id}`, seconds: metadata.duration, label: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`, segments: metadata.segments, chapters: metadata.chapters, width: 1920, height: 1080, fps: 30 };
}
fs.writeFileSync(path.join(output, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
