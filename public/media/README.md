# Mora English media

The current home welcome is a 1920×1080, 30 fps, twenty-second H.264/AAC montage introducing ten original plush animal friends. The original four-line greeting has been revoiced with the free offline Kokoro model. English/Korean VTT and transcript metadata remain available. Its poster uses the original animal ensemble illustration. Reproduction sources are `scripts/create-friends-welcome-audio.py` and `scripts/finalize-singalong.mjs`.

The original vector welcome renderer remains in source history and `scripts/create-welcome-video.mjs`; it is also used for the existing fifteen conversation lessons.

The ten new original nursery songs and character assets are documented in [singalong/README.md](singalong/README.md).

## Complete lesson series

`lessons/` contains 15 distinct original 1280×720, 12 fps H.264/AAC English learning videos (approximately 47–57 seconds each), individual WebP preview images, English/Korean VTT captions, and metadata. `lessons/manifest.json` is the application's source for actual duration and chapter/phrase/dialogue timestamps. The MP4 files include offline synthesized narration; no runtime TTS, remote video provider, API key, or third-party footage is needed.

Each lesson includes its three vocabulary items, five key phrases, four dialogue lines, review and closing practice advice. All segments have timed English and Korean text. These legacy conversation videos retain the original vector Momo character; each lesson has its own content, number, preview title and color palette.

Regenerate from the repository root on Windows:

```powershell
node scripts/prepare-lesson-videos.mjs <audio-directory>
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/create-lesson-audio.ps1 -OutputDirectory <audio-directory>
node scripts/create-lesson-videos.mjs <audio-directory> <ffmpeg-executable>
```

The batch renderer skips completed lesson metadata to resume interrupted work. To regenerate a specific lesson, remove only that lesson's generated metadata JSON before rerunning. Keep generated MP4, poster, VTT and manifest files together in version control.
