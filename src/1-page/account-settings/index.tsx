"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";

import type { AccountSettingsProps } from "./type";

export function AccountSettings({ email, displayName }: AccountSettingsProps) {
  const [name, setName] = useState(displayName);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function update(body: unknown, method = "PATCH") {
    setBusy(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/account", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "요청을 처리하지 못했습니다.");
      setMessage(result.message ?? "변경사항을 저장했습니다.");
      return true;
    } catch (cause) { setError(cause instanceof Error ? cause.message : "오류가 발생했습니다."); return false; }
    finally { setBusy(false); }
  }
  return <main className="account-settings mx-auto max-w-2xl space-y-8 px-4 py-10 text-slate-900">
    <nav className="flex flex-wrap items-center justify-between gap-3"><Link href="/" className="font-bold text-orange-700">mora english</Link><div className="flex gap-4 text-sm"><Link href="/studio">내 글</Link><button onClick={() => signOut({ callbackUrl: "/login" })}>로그아웃</button></div></nav>
    <h1 className="text-3xl font-bold">계정 설정</h1>
    {message && <p role="status" className="rounded-xl bg-green-50 p-3 text-green-800">{message}</p>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
    <section className="space-y-3 rounded-2xl border p-5"><h2 className="text-xl font-semibold">닉네임</h2><form onSubmit={async event => { event.preventDefault(); await update({ type: "profile", displayName: name }); }} className="flex flex-wrap gap-2"><input aria-label="닉네임" required minLength={2} maxLength={40} value={name} onChange={event => setName(event.target.value)} className="min-w-0 flex-1 rounded-lg border p-3"/><button disabled={busy} className="rounded-lg bg-slate-900 px-4 text-white">저장</button></form></section>
    <section className="space-y-3 rounded-2xl border p-5"><h2 className="text-xl font-semibold">이메일</h2><p>현재 주소: {email}</p><form onSubmit={async event => { event.preventDefault(); await update({ type: "email", email: newEmail }); }} className="flex flex-wrap gap-2"><input type="email" aria-label="새 이메일" required value={newEmail} onChange={event => setNewEmail(event.target.value)} className="min-w-0 flex-1 rounded-lg border p-3"/><button disabled={busy} className="rounded-lg bg-slate-900 px-4 text-white">인증 메일 보내기</button></form><p className="text-sm text-slate-600">새 주소의 인증 링크를 열기 전까지 기존 주소가 유지됩니다.</p></section>
    <section className="space-y-3 rounded-2xl border p-5"><h2 className="text-xl font-semibold">비밀번호</h2><form onSubmit={async event => { event.preventDefault(); if (await update({ type: "password", currentPassword, newPassword })) await signOut({ callbackUrl: "/login" }); }} className="space-y-2"><input type="password" aria-label="현재 비밀번호" placeholder="현재 비밀번호" required value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} className="w-full rounded-lg border p-3"/><input type="password" aria-label="새 비밀번호" placeholder="새 비밀번호 (12자 이상)" required minLength={12} value={newPassword} onChange={event => setNewPassword(event.target.value)} className="w-full rounded-lg border p-3"/><button disabled={busy} className="rounded-lg bg-slate-900 px-4 py-3 text-white">비밀번호 변경</button></form></section>
    <section className="space-y-3 rounded-2xl border border-red-200 p-5"><h2 className="text-xl font-semibold text-red-700">회원 탈퇴</h2><p className="text-sm">탈퇴하면 작성한 글, 이미지 기록 및 학습 기록이 삭제되며 복구할 수 없습니다.</p><form onSubmit={async event => { event.preventDefault(); if (await update({ password: deletePassword, confirmation }, "DELETE")) await signOut({ callbackUrl: "/login" }); }} className="space-y-2"><input type="password" aria-label="탈퇴 확인 비밀번호" placeholder="비밀번호" required value={deletePassword} onChange={event => setDeletePassword(event.target.value)} className="w-full rounded-lg border p-3"/><input aria-label="DELETE 입력" placeholder="DELETE 입력" required value={confirmation} onChange={event => setConfirmation(event.target.value)} className="w-full rounded-lg border p-3"/><button disabled={busy || confirmation !== "DELETE"} className="rounded-lg bg-red-700 px-4 py-3 text-white">계정과 데이터 삭제</button></form></section>
  </main>;
}
