"""Free offline nursery-song production: Kokoro voices, WORLD singing, original score.

Usage: python scripts/create-singalong-audio.py <production-directory>
Dependencies: kokoro-onnx, onnxruntime==1.20.1, numpy, scipy, soundfile, pyworld.
Model files: kokoro-v1.0.onnx and voices-v1.0.bin in <directory>/models/.
The phonetic voice is retimed and resynthesized at score pitches; no paid API.
"""
import json
import math
import pathlib
import sys

import numpy as np
import onnxruntime as rt
import pyworld as world
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = pathlib.Path(sys.argv[1]).resolve()
SR = 24000
FRAME = 5.0
options = rt.SessionOptions()
options.intra_op_num_threads = 2
options.inter_op_num_threads = 1
session = rt.InferenceSession(str(ROOT / "models/kokoro-v1.0.onnx"), sess_options=options, providers=["CPUExecutionProvider"])
voice = Kokoro.from_session(session, str(ROOT / "models/voices-v1.0.bin"))
CACHE = ROOT / "audio-cache"
CACHE.mkdir(exist_ok=True)


def spoken(text, name):
    target = CACHE / f"{name}.wav"
    if target.exists():
        return sf.read(target)[0]
    samples, rate = voice.create(text, voice="af_heart", speed=.84, lang="en-us")
    assert rate == SR
    sf.write(target, samples, SR)
    return samples.astype(np.float64)


def singing_word(word, midi, duration):
    target = CACHE / f"sung-{word.lower()}-{midi}-{int(duration * 1000)}.wav"
    if target.exists():
        return sf.read(target)[0]
    samples = spoken(word, f"word-{word.lower()}")
    active = np.flatnonzero(np.abs(samples) > .009)
    if len(active):
        samples = samples[max(0, active[0] - 160):min(len(samples), active[-1] + 300)]
    samples = np.ascontiguousarray(samples, dtype=np.float64)
    f0, times = world.dio(samples, SR, f0_floor=80, f0_ceil=750, frame_period=FRAME)
    f0 = world.stonemask(samples, f0, times, SR)
    spectrum = world.cheaptrick(samples, f0, times, SR)
    noise = world.d4c(samples, f0, times, SR)
    frames = max(8, round(duration * 1000 / FRAME))
    voiced = np.flatnonzero(f0 > 0)
    if len(voiced) and frames > len(f0):
        first, last = int(voiced[0]), int(voiced[-1])
        head, tail = min(first, frames // 6), min(len(f0) - last - 1, frames // 6)
        indexes = np.concatenate([np.linspace(0, first, head, endpoint=False), np.linspace(first, last, frames - head - tail), np.linspace(last, len(f0) - 1, tail + 1)[1:]])
    else:
        indexes = np.linspace(0, len(f0) - 1, frames)
    low = np.floor(indexes).astype(int)
    high = np.minimum(low + 1, len(f0) - 1)
    mix = (indexes - low)[:, None]
    new_spectrum = np.ascontiguousarray(spectrum[low] * (1 - mix) + spectrum[high] * mix)
    new_noise = np.ascontiguousarray(noise[low] * (1 - mix) + noise[high] * mix)
    mask = f0[np.rint(indexes).astype(int)] > 0
    clock = np.arange(frames) * FRAME / 1000
    pitch = 440 * 2 ** ((midi - 69) / 12)
    new_f0 = np.where(mask, pitch * (1 + .003 * np.sin(2 * np.pi * 4.7 * clock)), 0).astype(np.float64)
    result = world.synthesize(new_f0, new_spectrum, new_noise, SR, FRAME)
    desired = round(duration * SR)
    result = np.pad(result, (0, max(0, desired - len(result))))[:desired]
    result *= .24 / max(.05, np.max(np.abs(result)))
    fade = min(280, len(result) // 4)
    result[:fade] *= np.linspace(0, 1, fade)
    result[-fade:] *= np.linspace(1, 0, fade)
    sf.write(target, result, SR)
    return result


def instrument(midi, length, kind="bell"):
    clock = np.arange(round(length * SR)) / SR
    frequency = 440 * 2 ** ((midi - 69) / 12)
    if kind == "bass":
        return np.sin(2 * np.pi * frequency * clock) * np.exp(-clock * 4) * .065
    sound = sum(np.sin(2 * np.pi * frequency * harmonic * clock) / harmonic ** 2 for harmonic in (1, 2, 3, 4))
    envelope = (1 - np.exp(-clock * 90)) * np.exp(-clock * (6 if kind == "pluck" else 3.2))
    return sound * envelope * (.055 if kind == "bell" else .028)


def create_song(plan):
    destination = ROOT / (sys.argv[2] if len(sys.argv) > 2 else "audio") / plan["id"]
    destination.mkdir(parents=True, exist_ok=True)
    if (destination / "song.json").exists():
        print("Using completed audio", plan["id"], flush=True)
        return
    beat = 60 / plan["bpm"]
    intro = spoken(plan["intro"], plan["id"] + "-intro")
    play = spoken(plan["play"], plan["id"] + "-play")
    outro = spoken(plan["outro"], plan["id"] + "-outro")
    start = max(5, math.ceil(len(intro) / SR + 1))
    verse_length = 20 * beat
    play_start = start + verse_length + .8
    repeat_start = play_start + max(6, len(play) / SR + 1)
    outro_start = repeat_start + verse_length + .8
    duration = outro_start + max(4.5, len(outro) / SR + 1)
    mix = np.zeros((math.ceil(duration * SR), 2))

    def add(audio, at, pan=0):
        offset = round(at * SR)
        size = min(len(audio), len(mix) - offset)
        if size <= 0:
            return
        mix[offset:offset + size, 0] += audio[:size] * (1 - max(0, pan) * .55)
        mix[offset:offset + size, 1] += audio[:size] * (1 + min(0, pan) * .55)

    def say(audio, at):
        audio = audio * (.24 / max(.05, np.max(np.abs(audio))))
        add(audio, at)

    segments = [{"kind": "intro", "text": plan["intro"], "korean": f'{plan["korean"]} {plan["name"]}와 함께 노래해요!', "start": .6, "end": .6 + len(intro) / SR}]
    say(intro, .6)
    transpose = -2 if plan["animal"] == "kitten" else (plan["number"] - 1) % 3
    rng = np.random.default_rng(plan["number"])
    for index, at in enumerate(np.arange(0, duration - .2, beat)):
        chord = [[48, 52, 55], [53, 57, 60], [55, 59, 62], [48, 52, 55]][(index // 4) % 4]
        chord = [midi + transpose for midi in chord]
        if index % 2 == 0:
            add(instrument(chord[0] - 12, beat, "bass"), at)
        for midi in chord:
            add(instrument(midi + 12, beat * .85, "pluck"), at, -.35)
        shaker_time = np.arange(round(.065 * SR)) / SR
        shaker = rng.normal(0, .007, len(shaker_time)) * np.exp(-shaker_time * 85)
        add(shaker, at + beat / 2, .55)
    for repetition, verse_start in enumerate([start, repeat_start]):
        for line_index, line in enumerate(plan["lyrics"]):
            position = verse_start + line_index * 5 * beat
            words = line.split()
            assert len(words) == 4, line
            segments.append({"kind": "song" if repetition == 0 else "repeat", "text": line, "korean": plan["translations"][line_index], "start": position, "end": position + 5 * beat - .1})
            notes = plan["notes"][line_index]
            transpose = (plan["number"] - 1) % 3
            if plan["animal"] == "kitten":
                transpose = -2
            for word_index, word in enumerate(words):
                note = notes[word_index] + transpose
                length = beat * (1.8 if word_index == 3 else .88)
                sample = singing_word(word, note, length)
                add(sample, position + word_index * beat)
                add(instrument(note + 12, length, "bell"), position + word_index * beat, .4)
    say(play, play_start + .5)
    segments.append({"kind": "play", "text": plan["play"], "korean": f'함께 해 봐요: {plan["meaning"]}', "start": play_start + .5, "end": play_start + .5 + len(play) / SR})
    say(outro, outro_start + .3)
    segments.append({"kind": "outro", "text": plan["outro"], "korean": "잘했어요! 손을 흔들며 인사해요.", "start": outro_start + .3, "end": outro_start + .3 + len(outro) / SR})
    segments.sort(key=lambda item: item["start"])
    mix = np.tanh(mix * 1.2)
    mix *= .86 / max(.86, np.max(np.abs(mix)))
    tail = min(SR, len(mix))
    mix[-tail:] *= np.linspace(1, 0, tail)[:, None]
    sf.write(destination / "song.wav", mix, SR, subtype="PCM_16")
    metadata = {**plan, "duration": duration, "segments": segments, "chapters": {"intro": 0, "song": start, "play": play_start, "repeat": repeat_start, "outro": outro_start}, "synthesis": "Kokoro af_heart + WORLD score resynthesis", "score": "Original melody, lyrics and arrangement"}
    (destination / "song.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Created singing, score and timings:", plan["id"], round(duration, 2), "seconds", flush=True)


if __name__ == "__main__":
    for item in json.loads((ROOT / "plans.json").read_text(encoding="utf-8")):
        create_song(item)
