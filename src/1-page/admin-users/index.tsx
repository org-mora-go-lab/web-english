"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type User = { id: string; email: string; displayName: string; role: string; status: string; createdAt: number };

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  async function load() { const response = await fetch("/api/admin/users"); if (response.ok) setUsers((await response.json()).users); }
  useEffect(() => { void fetch("/api/admin/users").then(async response => { if (response.ok) setUsers((await response.json()).users); }); }, []);
  async function setStatus(id: string, status: "active" | "disabled") {
    const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (!response.ok) { setError("상태를 변경하지 못했습니다."); return; }
    await load();
  }
  return <main className="admin-users mx-auto max-w-5xl space-y-6 px-4 py-8 text-slate-900"><nav className="flex flex-wrap gap-4"><Link href="/studio">스튜디오</Link><Link href="/admin/posts">글 관리</Link></nav><h1 className="text-3xl font-bold">회원 관리</h1>{error && <p role="alert" className="text-red-700">{error}</p>}<div className="space-y-3">{users.map(user => <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div><strong>{user.displayName}</strong><p className="text-sm text-slate-600">{user.email} · {user.role} · {user.status}</p></div>{user.role !== "admin" && <button onClick={() => void setStatus(user.id, user.status === "disabled" ? "active" : "disabled")} className="rounded-lg border px-3 py-2">{user.status === "disabled" ? "활성화" : "비활성화"}</button>}</div>)}</div></main>;
}
