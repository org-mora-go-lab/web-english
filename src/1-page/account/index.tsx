"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

import type { AccountProps } from "./type";

const headings = {
  signup: ["계정 만들기", "가입하면 바로 글을 쓰고 학습 기록을 저장할 수 있습니다."],
  login: ["다시 만나서 반가워요", "내 학습 공간으로 돌아가세요."],
} as const;

async function post(path: string, body: unknown) {
  const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "요청을 처리하지 못했습니다.");
  return data;
}

export function Account({ mode, returnTo = "/studio", kakaoEnabled = false }: AccountProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [displayName, setDisplayName] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (mode === "signup") {
        if (password !== confirmation) throw new Error("비밀번호가 일치하지 않습니다.");
        await post("/api/account/signup", { email, password, passwordConfirmation: confirmation, displayName });
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) throw new Error("가입을 완료할 수 없습니다. 입력한 이메일로 로그인할 수 있는지 확인해 주세요.");
        router.push("/studio");
        router.refresh();
      } else if (mode === "login") {
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) throw new Error("로그인 정보를 확인해 주세요.");
        router.push(returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/studio");
        router.refresh();
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "요청을 처리하지 못했습니다."); }
    finally { setBusy(false); }
  }

  return (
    <main className="account flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-10">
        <Link href="/" className="text-sm font-bold tracking-wide text-orange-600">mora english</Link>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">{headings[mode][0]}</h1>
        <p className="mt-2 text-sm text-slate-600">{headings[mode][1]}</p>
        {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="mt-5 rounded-xl bg-green-50 p-3 text-sm text-green-800">{message}</p>}
        {kakaoEnabled && <><button type="button" disabled={busy} onClick={() => void signIn("kakao", { callbackUrl: returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/studio" })} className="mt-7 w-full rounded-xl bg-[#FEE500] px-4 py-3 font-semibold text-slate-950 hover:bg-[#f7dc00] disabled:opacity-50">카카오로 계속하기</button><p className="mt-3 text-center text-xs text-slate-500">기존 이메일 계정과 자동으로 합쳐지지 않습니다.</p><div className="my-5 flex items-center gap-3 text-xs text-slate-500"><span className="h-px flex-1 bg-slate-200"/>또는 이메일로 계속<span className="h-px flex-1 bg-slate-200"/></div></>}
          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block text-sm font-medium">이메일<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
            {mode === "signup" && <label className="block text-sm font-medium">닉네임<input required minLength={2} maxLength={40} autoComplete="nickname" value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>}
            <label className="block text-sm font-medium">비밀번호<input type="password" aria-label="비밀번호" required minLength={mode === "login" ? 1 : 12} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />{mode === "signup" && <span className="mt-1 block text-xs text-slate-500">12자 이상, 영문·숫자·특수문자를 포함하세요.</span>}</label>
            {mode === "signup" && <label className="block text-sm font-medium">비밀번호 확인<input type="password" required autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>}
            <button disabled={busy} className="w-full rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-50">{busy ? "처리 중…" : mode === "signup" ? "가입하기" : "로그인"}</button>
          </form>
        {mode === "signup" && <p className="mt-4 text-xs text-slate-500">이메일 인증과 비밀번호 찾기는 제공되지 않습니다. 비밀번호를 안전하게 보관해 주세요.</p>}
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
          {mode !== "login" && <Link href="/login" className="underline">로그인</Link>}
          {mode !== "signup" && <Link href="/signup" className="underline">회원가입</Link>}
        </div>
      </div>
    </main>
  );
}
