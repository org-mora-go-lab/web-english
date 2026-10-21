"""Revoice the existing four-line welcome with the free local Kokoro model."""
import importlib.util
import json
import pathlib

spec = importlib.util.spec_from_file_location("singing", pathlib.Path(__file__).with_name("create-singalong-audio.py"))
singing = importlib.util.module_from_spec(spec)
spec.loader.exec_module(singing)
np, sf, sr = singing.np, singing.sf, singing.SR
metadata = json.loads(pathlib.Path("public/media/momo-welcome.json").read_text(encoding="utf-8"))
audio = np.zeros((20 * sr, 2))
cursor = .45
for index, segment in enumerate(metadata["segments"]):
    voice = singing.spoken(segment["text"], f"welcome-{index}")
    voice = voice * (.24 / max(.05, np.max(np.abs(voice))))
    offset = round(cursor * sr)
    assert offset + len(voice) < len(audio), "Welcome must fit twenty seconds"
    audio[offset:offset + len(voice)] += voice[:, None]
    segment["start"] = cursor
    cursor += len(voice) / sr
    segment["end"] = cursor
    cursor += .55
for index, at in enumerate(np.arange(0, 19, .65)):
    note = [60, 64, 67, 72, 67, 64][index % 6]
    bell = singing.instrument(note, .6) * .45
    offset = round(at * sr)
    audio[offset:offset + len(bell), 0] += bell
    audio[offset:offset + len(bell), 1] += bell * .9
audio[-sr:] *= np.linspace(1, 0, sr)[:, None]
folder = singing.ROOT / "welcome"
folder.mkdir(exist_ok=True)
sf.write(folder / "welcome.wav", audio, sr, subtype="PCM_16")
metadata.update(duration=20, fps=30, width=1920, height=1080, voice="Kokoro af_heart, offline", characters=10)
(folder / "welcome.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")
print("Created 20-second neural-voice welcome with ten animal friends")
