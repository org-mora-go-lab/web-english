# Mora Little Friends — free local production

Ten original toddler-friendly animal sing-alongs, plus the home welcome montage. Character species: bear, rabbit, duck, fox, elephant, lion, panda, turtle, puppy, kitten. Each video is 1920×1080, 30 fps, H.264/AAC, approximately 39–49 seconds. It contains a greeting, four sung lines, a movement prompt, the four sung lines again and a farewell.

## Assets and sound

- `characters/<animal>.png`: ten transparent plush character illustrations generated with the built-in image_gen tool. These exact native assets are retained in the repository.
- `ensemble.png`, `garden-day.png`, `garden-night.png`: original ensemble and background plates from the same tool.
- `image-prompts.json`: final prompts and production method. No Runway or other paid external generation service was used.
- `plans.json`: original English lyrics, Korean meanings, tempo and individual melody scores.
- `<id>.mp4`, `<id>-poster.webp`, `<id>.en.vtt`, `<id>.ko.vtt`, `<id>.json`: complete deliverables.
- `manifest.json`: application duration, chapter and caption metadata.

Illustrations are animated as layered puppets with rhythmic movement, timed friend entrances, camera parallax and vocabulary props. These are composited illustration animations, not full 3D skeletal animation or neural video generation. Lyrics are optional VTT captions rather than permanently burned into the new song frames, so turning them off hides the captions. Vocabulary props are part of the scene.

Voice generation uses [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), an Apache-2.0 open-weight model, through [kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx) (MIT). Sung words are retimed and resynthesized with [WORLD/pyworld](https://github.com/JeremyCCHsu/Python-Wrapper-for-World-Vocoder) using the original melody's pitches. These are synthetic singing voices, not recordings of a human singer. Original accompaniment is synthesized locally, including bell/plucked chords, bass and soft shakers. No purchased music, commercial stock soundtrack, borrowed recording, cloned person's voice, or runtime TTS service is required.

Background harmony and vocal score use the same per-song key. Audio and video are muxed with AAC and fast-start MP4. Existing conversation lessons are a separate series and retain their original recordings.

## Reproduction

The production directory holds `models/`, `assets/`, `plans.json`, audio caches and intermediate clips. Large model files and Python dependencies are not deployed or committed. Install free local packages (Python 3.12 used):

```text
kokoro-onnx==0.6.1
onnxruntime==1.20.1
numpy
scipy
soundfile
pyworld
```

Download the model and voices from the official kokoro-onnx README. Use an FFmpeg build with libx264 and AAC, and the repository's installed `sharp`. Run from the repository root:

```text
python scripts/create-singalong-audio.py <production-directory>
node scripts/create-singalong-videos.mjs <production-directory> <ffmpeg>
python scripts/create-singalong-audio.py <production-directory> audio-v2
python scripts/create-friends-welcome-audio.py <production-directory>
node scripts/finalize-singalong.mjs <production-directory> <ffmpeg>
```

The second audio pass permits score refinement without rerendering illustration frames. Video rendering caches decoded and scaled still frames before animation; output is moved from a `.working.mp4` only after encoding succeeds. Resume checks require completed metadata. Keep all generated media and metadata together when publishing.
