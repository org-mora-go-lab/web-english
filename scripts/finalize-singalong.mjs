import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import sharp from "sharp";

const [productionDirectory, ffmpeg] = process.argv.slice(2);
const root = path.resolve(productionDirectory);
const output = path.resolve("public/media/singalong");
const plans = JSON.parse(fs.readFileSync(path.join(root, "plans.json"), "utf8"));
function run(args) {
  const result = spawnSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", ...args], { stdio: "inherit" });
  if (result.status !== 0) throw new Error("Media finalization failed");
}
const manifest = JSON.parse(fs.readFileSync(path.join(output, "manifest.json"), "utf8"));
for (const plan of plans) {
  const destination = path.join(output, `${plan.id}.mp4`);
  const replacement = path.join(output, `${plan.id}.final.mp4`);
  const audio = path.join(root, "audio-v2", plan.id);
  run(["-i", destination, "-i", path.join(audio, "song.wav"), "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-shortest", replacement]);
  fs.renameSync(replacement, destination);
  const metadata = JSON.parse(fs.readFileSync(path.join(audio, "song.json"), "utf8"));
  fs.writeFileSync(path.join(output, `${plan.id}.json`), JSON.stringify({ ...metadata, width: 1920, height: 1080, fps: 30 }, null, 2) + "\n");
  manifest[plan.id].segments = metadata.segments;
  console.log(`Finalized original song: ${plan.id}`);
}
fs.writeFileSync(path.join(output, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
const clips = [];
const welcome = path.join(root, "welcome");
for (const plan of plans) {
  const clip = path.join(welcome, `${plan.id}.mp4`);
  run(["-ss", "0.4", "-i", path.join(output, `${plan.id}.mp4`), "-t", "2", "-an", "-c:v", "libx264", "-threads", "2", "-preset", "veryfast", "-crf", "22", "-pix_fmt", "yuv420p", clip]);
  clips.push(`file '${clip.replaceAll("\\", "/")}'`);
}
const list = path.join(welcome, "clips.txt");
fs.writeFileSync(list, clips.join("\n"));
run(["-f", "concat", "-safe", "0", "-i", list, "-i", path.join(welcome, "welcome.wav"), "-t", "20", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "public/media/momo-welcome.mp4"]);
await sharp(path.join(root, "assets", "ensemble.png")).resize(1280, 720, { fit: "cover" }).webp({ quality: 88 }).toFile("public/media/momo-welcome-poster.webp");
const metadata = JSON.parse(fs.readFileSync(path.join(welcome, "welcome.json"), "utf8"));
fs.writeFileSync("public/media/momo-welcome.json", JSON.stringify(metadata, null, 2) + "\n");
function timestamp(value) { const ms = Math.round(value * 1000); return `00:${String(Math.floor(ms / 60000)).padStart(2,"0")}:${String(Math.floor(ms / 1000) % 60).padStart(2,"0")}.${String(ms % 1000).padStart(3,"0")}`; }
for (const language of ["en", "ko"]) fs.writeFileSync(`public/media/momo-welcome.${language}.vtt`, "WEBVTT\n\n" + metadata.segments.map((segment, index) => `${index + 1}\n${timestamp(segment.start)} --> ${timestamp(segment.end)}\n${language === "en" ? segment.text : segment.korean}\n`).join("\n"));
console.log("Completed twenty-second 1080p welcome montage with all ten animals.");
