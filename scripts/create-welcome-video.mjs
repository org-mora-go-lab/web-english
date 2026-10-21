/*
 * Original Momo vector animation rendered to H.264/AAC with embedded narration.
 * Usage: node scripts/create-welcome-video.mjs <audio-directory> <ffmpeg-path>
 * Audio: powershell -File scripts/create-welcome-audio.ps1 -OutputDirectory <audio-directory>
 * Requires sharp (provided by Next.js) and FFmpeg. No runtime speech service is used.
 */
import { spawn } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs";
import path from "node:path";

import sharp from "sharp";

const [audioDirectory, ffmpeg] = process.argv.slice(2);
if (!audioDirectory || !ffmpeg)
  throw new Error("Provide an audio directory and FFmpeg executable.");
const output = path.resolve("public/media");
fs.mkdirSync(output, { recursive: true });
const sampleRate = 24000;
const fps = 24;
const segments = [
  {
    text: "Hi! I'm Momo, your English buddy.",
    korean: "안녕! 나는 너의 영어 친구 Momo야.",
  },
  {
    text: "A little practice every day goes a long way.",
    korean: "매일 조금씩 연습하면 큰 변화가 생겨.",
  },
  {
    text: "Let's try it together. Hello! How are you?",
    korean: "함께 해 보자. 안녕! 어떻게 지내?",
  },
  {
    text: "Great job! Let's learn, one small step at a time.",
    korean: "잘했어! 한 걸음씩 함께 배워 보자.",
  },
];
function readPcm(file) {
  const buffer = fs.readFileSync(file);
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString("ascii", offset, offset + 4);
    const length = buffer.readUInt32LE(offset + 4);
    if (
      type === "fmt " &&
      (buffer.readUInt16LE(offset + 8) !== 1 ||
        buffer.readUInt16LE(offset + 10) !== 1 ||
        buffer.readUInt32LE(offset + 12) !== sampleRate ||
        buffer.readUInt16LE(offset + 22) !== 16)
    )
      throw new Error("Expected 24 kHz mono PCM16 audio.");
    if (type === "data")
      return buffer.subarray(offset + 8, offset + 8 + length);
    offset += 8 + length + (length % 2);
  }
  throw new Error("Missing PCM data.");
}
const pcmParts = [Buffer.alloc(Math.round(sampleRate * 0.5) * 2)];
let sampleCursor = pcmParts[0].length / 2;
segments.forEach((segment, index) => {
  const pcm = readPcm(path.join(audioDirectory, `${index}.wav`));
  segment.start = sampleCursor / sampleRate;
  sampleCursor += pcm.length / 2;
  segment.end = sampleCursor / sampleRate;
  pcmParts.push(pcm, Buffer.alloc(Math.round(sampleRate * 0.4) * 2));
  sampleCursor += Math.round(sampleRate * 0.4);
});
pcmParts.push(Buffer.alloc(sampleRate * 2));
const pcm = Buffer.concat(pcmParts);
const duration = pcm.length / 2 / sampleRate;
const wav = Buffer.alloc(44);
wav.write("RIFF");
wav.writeUInt32LE(36 + pcm.length, 4);
wav.write("WAVEfmt ", 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36);
wav.writeUInt32LE(pcm.length, 40);
const narration = path.join(audioDirectory, "narration.wav");
fs.writeFileSync(narration, Buffer.concat([wav, pcm]));
function mouthAt(time) {
  const center = Math.floor(time * sampleRate);
  let sum = 0,
    count = 0;
  for (
    let sample = Math.max(0, center - 240);
    sample < Math.min(pcm.length / 2, center + 240);
    sample++
  ) {
    const value = pcm.readInt16LE(sample * 2) / 32768;
    sum += value * value;
    count++;
  }
  return Math.min(1, Math.sqrt(sum / Math.max(count, 1)) * 7);
}
function escape(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
function svgAt(time) {
  const segment = segments.find(
    (item) => time >= item.start && time <= item.end,
  );
  const caption =
    segment?.text ||
    (time < 0.5
      ? "Meet Momo, your English buddy."
      : "One small step. Every day.");
  const mouth = mouthAt(time);
  const bob = Math.sin(time * 2.5) * 5;
  const tilt = Math.sin(time * 1.5) * 2;
  const blink = time % 4.1 > 3.87 && time % 4.1 < 4.02;
  const wave =
    time < segments[0].end + 0.2 || time > segments[3].start
      ? Math.sin(time * 8) * 14 - 18
      : 0;
  return `<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x2="0" y2="1"><stop stop-color="#fdf8ef"/><stop offset="1" stop-color="#f0eee3"/></linearGradient>
    <radialGradient id="fur" cx=".35" cy=".22" r=".9"><stop stop-color="#ce9c70"/><stop offset=".7" stop-color="#b67e54"/><stop offset="1" stop-color="#9e6745"/></radialGradient>
    <linearGradient id="cream" x2="0" y2="1"><stop stop-color="#fff0d6"/><stop offset="1" stop-color="#efcfa5"/></linearGradient>
    <linearGradient id="scarf" x2="1" y2="1"><stop stop-color="#8fa99b"/><stop offset="1" stop-color="#628b7a"/></linearGradient>
    <filter id="shadow"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <circle cx="640" cy="320" r="265" fill="#e1e8d9"/>
  <circle cx="662" cy="305" r="222" fill="#edf0e3" opacity=".65"/>
  <path d="M140 480 Q110 350 185 290 M144 420 Q78 395 91 363 Q141 354 145 410 M148 385 Q213 332 220 363 Q214 396 148 405" fill="#b0bfa1" stroke="#a2b28e" stroke-width="4"/>
  <path d="M1090 475 Q1140 370 1080 300 M1109 416 Q1171 370 1185 400 Q1165 435 1109 429 M1110 380 Q1049 332 1049 365 Q1062 395 1110 397" fill="#b9c9b3" stroke="#a2b69a" stroke-width="4"/>
  <text x="58" y="59" fill="#9b8c77" font-family="Arial,sans-serif" font-size="18" letter-spacing="4">MORA ENGLISH</text>
  <text x="1220" y="59" text-anchor="end" fill="#a18f75" font-family="Arial,sans-serif" font-size="15" letter-spacing="2">A LITTLE, EVERY DAY</text>
  <g transform="translate(130 ${158 + Math.sin(time * 2) * 5}) rotate(-7)"><rect width="212" height="100" rx="28" fill="#fffdf8"/><path d="M150 90 L171 120 L173 88" fill="#fffdf8"/><text x="105" y="65" text-anchor="middle" fill="#6b8167" font-size="44" font-family="Georgia,serif" font-style="italic">hello!</text></g>
  <g transform="translate(980 ${220 + Math.cos(time * 2) * 7}) rotate(8)"><rect width="165" height="100" rx="18" fill="#eddac3"/><text x="82" y="43" text-anchor="middle" fill="#8b7053" font-size="18" font-family="Arial,sans-serif">one small</text><text x="82" y="72" text-anchor="middle" fill="#6c563f" font-size="25" font-family="Georgia,serif" font-style="italic">step at a time</text></g>
  <g fill="#c6ad79"><path d="M348 344l7 19 19 7-19 7-7 19-7-19-19-7 19-7z"/><path d="M943 125l5 13 13 5-13 5-5 13-5-13-13-5 13-5z"/><circle cx="303" cy="480" r="5"/><circle cx="980" cy="436" r="5"/></g>
  <ellipse cx="640" cy="554" rx="176" ry="20" fill="#5c6245" opacity=".13" filter="url(#shadow)"/>
  <g transform="translate(640 ${330 + bob}) rotate(${tilt})">
    <path d="M110 116 Q218 175 158 211 Q129 208 114 176" fill="#ad734d"/>
    <ellipse cx="0" cy="114" rx="127" ry="128" fill="url(#fur)"/>
    <ellipse cx="0" cy="125" rx="85" ry="91" fill="url(#cream)"/>
    <ellipse cx="-81" cy="217" rx="50" ry="27" fill="#9e6946"/><ellipse cx="81" cy="217" rx="50" ry="27" fill="#9e6946"/>
    <ellipse cx="-107" cy="-137" rx="49" ry="45" fill="#ad764f"/><ellipse cx="107" cy="-137" rx="49" ry="45" fill="#ad764f"/>
    <ellipse cx="-107" cy="-137" rx="29" ry="25" fill="#e3b493"/><ellipse cx="107" cy="-137" rx="29" ry="25" fill="#e3b493"/>
    <ellipse cx="0" cy="-62" rx="151" ry="136" fill="url(#fur)"/>
    <path d="M-29-188 Q-11-220 2-191 Q22-220 35-184" fill="#bf8a5b"/>
    <path d="M-107-37 Q-126 13-69 44 Q0 86 69 44 Q126 13 107-37 Q75-77 29-43 Q0-26-29-43 Q-75-77-107-37" fill="url(#cream)"/>
    <ellipse cx="-94" cy="-7" rx="23" ry="12" fill="#df9f8c" opacity=".7"/><ellipse cx="94" cy="-7" rx="23" ry="12" fill="#df9f8c" opacity=".7"/>
    ${blink ? '<path d="M-75-68q18-14 36 0 M39-68q18-14 36 0" stroke="#4d342b" stroke-width="8" fill="none" stroke-linecap="round"/>' : '<ellipse cx="-57" cy="-69" rx="19" ry="24" fill="#3f2e28"/><ellipse cx="57" cy="-69" rx="19" ry="24" fill="#3f2e28"/><circle cx="-63" cy="-77" r="6" fill="#fff9e9"/><circle cx="51" cy="-77" r="6" fill="#fff9e9"/><circle cx="-52" cy="-59" r="3" fill="#b58660"/><circle cx="62" cy="-59" r="3" fill="#b58660"/>'}
    <path d="M-12-20 Q0-30 12-20 Q10-8 0-7 Q-10-8-12-20" fill="#543b30"/>
    <path d="M0-6v10 M0 4q-12 11-24 0 M0 4q12 11 24 0" stroke="#805740" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${mouth > 0.09 ? `<ellipse cx="0" cy="${22 + mouth * 4}" rx="${12 + mouth * 9}" ry="${4 + mouth * 20}" fill="#5c352d"/><ellipse cx="0" cy="${26 + mouth * 13}" rx="${8 + mouth * 5}" ry="${2 + mouth * 6}" fill="#d58c86"/>` : '<path d="M-15 20 Q0 35 15 20" stroke="#825c43" stroke-width="4" fill="none" stroke-linecap="round"/>'}
    <path d="M-113 53 Q0 92 111 52 L104 81 Q0 120-108 81z" fill="url(#scarf)"/>
    <path d="M67 82 L97 86 L93 148 L65 140z" fill="#7f9e8c"/><path d="M71 133l19 5" stroke="#a8beab" stroke-width="3"/>
    <g transform="translate(-114 88) rotate(${wave})"><ellipse cx="-20" cy="-16" rx="37" ry="57" transform="rotate(-35 -20 -16)" fill="url(#fur)"/><ellipse cx="-38" cy="-42" rx="20" ry="26" transform="rotate(-35 -38 -42)" fill="#e5b99a"/><circle cx="-64" cy="-57" r="6" fill="#f2ceb0"/><circle cx="-51" cy="-69" r="6" fill="#f2ceb0"/></g>
    <g transform="translate(8 135) rotate(-6)"><path d="M-62-25 Q-28-39 0-19 Q28-39 62-25 L62 44 Q28 31 0 50 Q-28 31-62 44z" fill="#eac77f" stroke="#d1a460" stroke-width="3"/><path d="M0-19v69" stroke="#b88e51" stroke-width="3"/><path d="M-48-8l32-2 M-48 5l32-2 M15-10l32 2 M15 3l32 2" stroke="#fff2c9" stroke-width="4" stroke-linecap="round"/></g>
    <ellipse cx="91" cy="144" rx="31" ry="29" fill="#bb865c"/>
  </g>
  <rect x="65" y="606" width="1150" height="65" rx="22" fill="#fffdf7" opacity=".95"/>
  <text x="640" y="648" text-anchor="middle" font-family="Arial,sans-serif" font-size="31" font-weight="500" fill="#4d5545">${escape(caption)}</text>
  <text x="640" y="702" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" letter-spacing="3" fill="#a89a83">MOMO · YOUR ENGLISH BUDDY</text>
  </svg>`;
}
function timecode(value) {
  const ms = Math.round(value * 1000);
  return `${String(Math.floor(ms / 3600000)).padStart(2, "0")}:${String(Math.floor(ms / 60000) % 60).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`;
}
async function main() {
  const destination = path.join(output, "momo-welcome.mp4");
  const processHandle = spawn(
    ffmpeg,
    [
      "-y",
      "-loglevel",
      "error",
      "-f",
      "rawvideo",
      "-pixel_format",
      "rgb24",
      "-video_size",
      "1280x720",
      "-framerate",
      String(fps),
      "-i",
      "pipe:0",
      "-i",
      narration,
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "22",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-movflags",
      "+faststart",
      "-shortest",
      destination,
    ],
    { stdio: ["pipe", "inherit", "inherit"] },
  );
  const completion = new Promise((resolve, reject) => {
    processHandle.on("error", reject);
    processHandle.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`FFmpeg exited ${code}`)),
    );
  });
  const frames = Math.ceil(duration * fps);
  for (let frame = 0; frame < frames; frame++) {
    const svg = Buffer.from(svgAt(frame / fps));
    const rendered = await sharp(svg).removeAlpha().raw().toBuffer();
    if (!processHandle.stdin.write(rendered))
      await once(processHandle.stdin, "drain");
    if (frame % 120 === 0) console.log(`Rendered ${frame}/${frames} frames`);
  }
  processHandle.stdin.end();
  await completion;
  await sharp(Buffer.from(svgAt(0.2)))
    .webp({ quality: 88 })
    .toFile(path.join(output, "momo-welcome-poster.webp"));
  fs.writeFileSync(
    path.join(output, "momo-welcome.en.vtt"),
    "WEBVTT\n\n" +
      segments
        .map(
          (segment, index) =>
            `${index + 1}\n${timecode(segment.start)} --> ${timecode(segment.end)}\n${segment.text}\n`,
        )
        .join("\n"),
  );
  fs.writeFileSync(
    path.join(output, "momo-welcome.ko.vtt"),
    "WEBVTT\n\n" +
      segments
        .map(
          (segment, index) =>
            `${index + 1}\n${timecode(segment.start)} --> ${timecode(segment.end)}\n${segment.korean}\n`,
        )
        .join("\n"),
  );
  fs.writeFileSync(
    path.join(output, "momo-welcome.json"),
    JSON.stringify(
      {
        duration,
        fps,
        width: 1280,
        height: 720,
        voice: "Microsoft Zira Desktop",
        segments,
      },
      null,
      2,
    ) + "\n",
  );
  fs.writeFileSync(path.join(audioDirectory, "momo-source.svg"), svgAt(0.2));
  console.log(
    JSON.stringify({
      destination,
      duration,
      frames,
      bytes: fs.statSync(destination).size,
    }),
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
