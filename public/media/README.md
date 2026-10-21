# Momo welcome video

Original vector character animation created for Mora English. No third-party character art, stock footage, or runtime speech service is used.

- `momo-welcome.mp4`: 1280×720, 24 fps, H.264 + AAC, approximately 20 seconds.
- `momo-welcome-poster.webp`: first-screen poster.
- `momo-welcome.en.vtt`, `momo-welcome.ko.vtt`: timed English captions and Korean subtitles.
- `momo-welcome.json`: transcript and generation metadata.

English narration is synthesized offline with the installed Microsoft Zira Desktop voice. Mouth motion follows the narration's measured amplitude. The original character, scene, animation and encoding source is in `scripts/create-welcome-video.mjs`; narration generation is in `scripts/create-welcome-audio.ps1`.

To regenerate on Windows, create the narration with the PowerShell script, then run the Node script with the audio directory and an FFmpeg executable. The renderer uses `sharp`, included by Next.js. Regeneration tools are not needed to serve the site.
