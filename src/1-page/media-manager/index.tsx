"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Asset = { id: string; url: string; mimeType: string; size: number; createdAt: number };

export function MediaManager() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function refresh() { const response = await fetch("/api/media"); if (response.ok) setAssets((await response.json()).assets); }
  useEffect(() => { void fetch("/api/media").then(async response => { if (response.ok) setAssets((await response.json()).assets); }); }, []);
  async function upload(file: File) {
    const form = new FormData(); form.set("file", file);
    const response = await fetch("/api/media", { method: "POST", body: form }); const result = await response.json();
    if (!response.ok) { setError(result.error ?? "업로드하지 못했습니다."); return; }
    setMessage("이미지를 업로드했습니다."); await refresh();
  }
  async function remove(id: string) {
    const response = await fetch(`/api/media/${id}`, { method: "DELETE" });
    if (!response.ok) { setError("삭제하지 못했습니다."); return; }
    await refresh();
  }
  return <main className="media-manager mx-auto max-w-5xl space-y-6 px-4 py-8 text-slate-900"><Link href="/studio" className="font-semibold text-orange-700">← 스튜디오</Link><h1 className="text-3xl font-bold">이미지 관리</h1><p className="text-slate-600">PNG, JPEG, WebP 이미지(5MB 이하)를 업로드할 수 있습니다. 비공개 저장소에 보관하며 권한이 있는 글에서만 표시됩니다.</p><input aria-label="이미지 업로드" type="file" accept="image/png,image/jpeg,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }}/>{message && <p role="status">{message}</p>}{error && <p role="alert" className="text-red-700">{error}</p>}<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{assets.map(asset => <div key={asset.id} className="overflow-hidden rounded-xl border"><Image unoptimized width={1200} height={800} src={asset.url} alt="업로드한 이미지" className="h-44 w-full object-cover"/><div className="flex justify-between p-3 text-sm"><span>{Math.round(asset.size / 1024)} KB</span><button onClick={() => void remove(asset.id)} className="text-red-700 underline">삭제</button></div></div>)}</div></main>;
}
