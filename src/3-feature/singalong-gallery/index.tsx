"use client";

import { Music2, Play, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { lessonVideos, songs, useBrowse } from "@/src/4-entity";

export function SingalongGallery() {
  const [animal, setAnimal] = useState("all");
  const visible = animal === "all" ? songs : songs.filter(song => song.animal === animal);
  return <section className="singalong-gallery" aria-label="동물 친구 영어 동요">
    <div className="singalong-heading"><div><span className="singalong-eyebrow"><Sparkles size={14} /> LITTLE VOICES, BIG SMILES</span><h2>노래로 만나는 10마리 동물 친구</h2><p>두 살 아이와 함께, 듣고 · 몸을 움직이고 · 한 번 더 불러요.</p></div><span className="singalong-tag"><Music2 size={15} /> 오리지널 영어 동요 10편</span></div>
    <div className="animal-picker" aria-label="동물 친구 선택"><button aria-pressed={animal === "all"} onClick={() => setAnimal("all")}>모든 친구</button>{songs.map(song => <button key={song.id} aria-pressed={animal === song.animal} onClick={() => setAnimal(song.animal!)}><Image src={`/media/singalong/characters/${song.animal}.png`} width={56} height={56} alt="" /><span>{song.animalName}</span></button>)}</div>
    <div className="singalong-grid">{visible.map(song => <div className="singalong-card" key={song.id}><Link href={`/watch/${song.id}`} aria-label={`${song.title} 동요 보기`} onClick={() => useBrowse.getState().change({ scroll: window.scrollY })}><div className="song-preview"><Image src={lessonVideos[song.id].poster} width={1280} height={720} alt={`${song.animalName} 영어 동요 영상 프리뷰`} sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 30vw" /><span className="song-play"><Play size={20} fill="currentColor" /></span><span className="song-duration">{lessonVideos[song.id].label}</span></div><div className="song-card-info"><span>{song.animalName} · {song.caption}</span><h3>{song.title}</h3><p>노래 + 따라 하기 + 다시 부르기</p></div></Link></div>)}</div>
    <p className="together-note">아이가 좋아하는 한 구절부터. 보호자와 함께 천천히 즐겨 주세요.</p>
  </section>;
}
