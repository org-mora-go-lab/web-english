"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRef, useState } from "react";

import { AccountIdentity } from "@/src/4-entity/account/client";

import type { AccountSettingsProps } from "./type";

export function AccountSettings({ email, displayName, profileImageUrl, isKakao }: AccountSettingsProps) {
  const [name, setName] = useState(displayName);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const deleteDialog = useRef<HTMLDialogElement | null>(null);
  function closeDeleteDialog() { if (!busy) deleteDialog.current?.close(); }
  async function update(body: unknown, method = "PATCH") {
    setBusy(true); setMessage(""); setError(""); setDeleteError("");
    try {
      const response = await fetch("/api/account", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "요청을 처리하지 못했습니다.");
      setMessage(result.message ?? "변경사항을 저장했습니다.");
      return true;
    } catch (cause) { (method === "DELETE" ? setDeleteError : setError)(cause instanceof Error ? cause.message : "오류가 발생했습니다."); return false; }
    finally { setBusy(false); }
  }
  return <main className="account-settings mx-auto max-w-2xl space-y-8 px-4 py-10">
    <nav className="flex flex-wrap items-center justify-between gap-3"><Link href="/" className="font-bold page-accent">mora english</Link><div className="flex gap-4 text-sm"><Link href="/">놀이로 돌아가기</Link><button onClick={() => signOut({ callbackUrl: "/login" })}>로그아웃</button></div></nav>
    <h1 className="text-3xl font-bold">계정 설정</h1>
    <div className="rounded-2xl border p-5"><AccountIdentity displayName={displayName} profileImageUrl={profileImageUrl} />{isKakao && <p className="mt-3 text-sm page-muted">카카오 계정으로 로그인했습니다. 이름과 사진은 카카오 프로필에서 변경한 뒤 다시 로그인하면 반영됩니다.</p>}</div>
    {message && <p role="status" className="rounded-xl page-success p-3 page-success-text">{message}</p>}
    {error && <p role="alert" className="rounded-xl page-danger-soft p-3 page-danger-text">{error}</p>}
    {!isKakao && <section className="space-y-3 rounded-2xl border p-5"><h2 className="text-xl font-semibold">닉네임</h2><form onSubmit={async event => { event.preventDefault(); await update({ type: "profile", displayName: name }); }} className="flex flex-wrap gap-2"><input aria-label="닉네임" required minLength={2} maxLength={40} value={name} onChange={event => setName(event.target.value)} className="min-w-0 flex-1 rounded-lg border p-3"/><button disabled={busy} className="rounded-lg page-primary px-4 text-white">저장</button></form></section>}
    {!isKakao && <>
    <section className="space-y-3 rounded-2xl border p-5"><h2 className="text-xl font-semibold">로그인 이메일</h2><p>현재 주소: {email}</p><form onSubmit={async event => { event.preventDefault(); if (await update({ type: "email", email: newEmail, currentPassword: emailPassword })) await signOut({ callbackUrl: "/login" }); }} className="space-y-2"><input type="email" aria-label="새 이메일" required value={newEmail} onChange={event => setNewEmail(event.target.value)} className="w-full rounded-lg border p-3"/><input type="password" aria-label="이메일 변경 확인 비밀번호" required value={emailPassword} onChange={event => setEmailPassword(event.target.value)} className="w-full rounded-lg border p-3" placeholder="현재 비밀번호"/><button disabled={busy} className="rounded-lg page-primary px-4 py-3 text-white">이메일 변경</button></form><p className="text-sm page-muted">현재 비밀번호를 확인한 뒤 로그인 이메일을 변경합니다. 변경 후 다시 로그인해야 합니다.</p></section>
    <section className="space-y-3 rounded-2xl border p-5"><h2 className="text-xl font-semibold">비밀번호</h2><form onSubmit={async event => { event.preventDefault(); if (await update({ type: "password", currentPassword, newPassword })) await signOut({ callbackUrl: "/login" }); }} className="space-y-2"><input type="password" aria-label="현재 비밀번호" placeholder="현재 비밀번호" required value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} className="w-full rounded-lg border p-3"/><input type="password" aria-label="새 비밀번호" placeholder="새 비밀번호 (12자 이상)" required minLength={12} value={newPassword} onChange={event => setNewPassword(event.target.value)} className="w-full rounded-lg border p-3"/><button disabled={busy} className="rounded-lg page-primary px-4 py-3 text-white">비밀번호 변경</button></form></section>
    </>}
    <footer className="account-settings-footer"><button type="button" className="account-delete-link" disabled={busy} onClick={() => deleteDialog.current?.showModal()}>회원 탈퇴</button></footer>
    <dialog ref={deleteDialog} className="account-delete-dialog" aria-labelledby="account-delete-title" aria-describedby="account-delete-description" onCancel={event => { if (busy) event.preventDefault(); }} onClose={() => { setDeletePassword(""); setConfirmation(""); setDeleteError(""); }} onClick={event => { if (event.target === event.currentTarget) closeDeleteDialog(); }}>
      <div className="account-delete-body">
        <div className="account-delete-heading"><h2 id="account-delete-title">회원 탈퇴</h2><button type="button" aria-label="회원 탈퇴 창 닫기" disabled={busy} onClick={closeDeleteDialog}><X size={20} aria-hidden="true" /></button></div>
        <p id="account-delete-description">탈퇴하면 대화와 프로젝트, 놀이·학습 기록, 작성한 글과 이미지 기록이 삭제되며 복구할 수 없습니다.</p>
        {isKakao && <p className="page-muted">카카오 계정은 로그인 후 10분 안에만 탈퇴할 수 있습니다. 시간이 지났다면 로그아웃 후 다시 로그인해 주세요.</p>}
        {deleteError && <p role="alert" className="page-danger-text">{deleteError}</p>}
        <form onSubmit={async event => { event.preventDefault(); if (await update({ ...(isKakao ? {} : { password: deletePassword }), confirmation }, "DELETE")) await signOut({ callbackUrl: "/login" }); }}>
          {!isKakao && <label>현재 비밀번호<input type="password" aria-label="탈퇴 확인 비밀번호" autoComplete="current-password" required disabled={busy} value={deletePassword} onChange={event => setDeletePassword(event.target.value)} /></label>}
          <label>계속하려면 DELETE를 입력해 주세요<input aria-label="DELETE 입력" autoComplete="off" spellCheck={false} required disabled={busy} value={confirmation} onChange={event => setConfirmation(event.target.value)} /></label>
          <div className="account-delete-actions"><button type="button" autoFocus disabled={busy} onClick={closeDeleteDialog}>취소</button><button type="submit" disabled={busy || confirmation !== "DELETE"} className="page-danger-button">{busy ? "삭제 중…" : "계정과 데이터 삭제"}</button></div>
        </form>
      </div>
    </dialog>
  </main>;
}
