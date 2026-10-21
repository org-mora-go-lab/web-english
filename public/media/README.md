# Momo welcome video

Original vector character animation created for Mora English. No third-party character art, stock footage, or runtime speech service is used.

- `momo-welcome.mp4`: 1280×720, 24 fps, H.264 + AAC, approximately 20 seconds.
- `momo-welcome-poster.webp`: first-screen poster.
- `momo-welcome.en.vtt`, `momo-welcome.ko.vtt`: timed English captions and Korean subtitles.
- `momo-welcome.json`: transcript and generation metadata.

English narration is synthesized offline with the installed Microsoft Zira Desktop voice. Mouth motion follows the narration's measured amplitude. The original character, scene, animation and encoding source is in `scripts/create-welcome-video.mjs`; narration generation is in `scripts/create-welcome-audio.ps1`.

To regenerate on Windows, create the narration with the PowerShell script, then run the Node script with the audio directory and an FFmpeg executable. The renderer uses `sharp`, included by Next.js. Regeneration tools are not needed to serve the site.

## Complete lesson series

`lessons/` contains 15 distinct original 1280×720, 12 fps H.264/AAC English learning videos (approximately 47–57 seconds each), individual WebP preview images, English/Korean VTT captions, and metadata. `lessons/manifest.json` is the application's source for actual duration and chapter/phrase/dialogue timestamps. The MP4 files include offline synthesized narration; no runtime TTS, remote video provider, API key, or third-party footage is needed.

Each lesson includes its three vocabulary items, five key phrases, four dialogue lines, review and closing practice advice. All segments have timed English and Korean text. The narrator and visual character are the same Momo as the welcome animation; each lesson has its own content, number, preview title and color palette.

Regenerate from the repository root on Windows:

```powershell
node scripts/prepare-lesson-videos.mjs <audio-directory>
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/create-lesson-audio.ps1 -OutputDirectory <audio-directory>
node scripts/create-lesson-videos.mjs <audio-directory> <ffmpeg-executable>
```

The batch renderer skips completed lesson metadata to resume interrupted work. To regenerate a specific lesson, remove only that lesson's generated metadata JSON before rerunning. Keep generated MP4, poster, VTT and manifest files together in version control.
