"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import type { AccountProps } from "./type";

const headings = {
  signup: ["계정 만들기", "작성한 글과 학습 기록을 어디서든 이어가세요."],
  login: ["다시 만나서 반가워요", "내 학습 공간으로 돌아가세요."],
  verify: ["이메일 인증", "이메일 주소를 확인하고 계정을 활성화합니다."],
  forgot: ["비밀번호 재설정", "가입한 이메일로 재설정 링크를 보내드립니다."],
  reset: ["새 비밀번호 설정", "새 비밀번호를 입력해 주세요."],
} as const;

async function post(path: string, body: unknown) {
  const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "요청을 처리하지 못했습니다.");
  return data;
}

export function Account({ mode, token, returnTo = "/studio" }: AccountProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [displayName, setDisplayName] = useState("");
  const verificationStarted = useRef(false);

  useEffect(() => {
    if (mode !== "verify" || !token || verificationStarted.current) return;
    verificationStarted.current = true;
    post("/api/account/verify", { token }).then(() => {
      setMessage("인증이 완료되었습니다. 로그인해 주세요.");
    }).catch((cause: Error) => { setError(cause.message); });
  }, [mode, token]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (mode === "signup") {
        if (password !== confirmation) throw new Error("비밀번호가 일치하지 않습니다.");
        const result = await post("/api/account/signup", { email, password, passwordConfirmation: confirmation, displayName });
        setMessage(result.message);
      } else if (mode === "login") {
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) throw new Error("로그인 정보를 확인해 주세요. 이메일 인증이 필요할 수 있습니다.");
        router.push(returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/studio");
        router.refresh();
      } else if (mode === "forgot") {
        const result = await post("/api/account/forgot-password", { email });
        setMessage(result.message);
      } else if (mode === "reset") {
        if (password !== confirmation) throw new Error("비밀번호가 일치하지 않습니다.");
        await post("/api/account/reset-password", { token, password });
        setMessage("비밀번호가 변경되었습니다. 다시 로그인해 주세요.");
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
        {mode === "verify" ? (
          <div className="mt-8">{!token && <p>인증 이메일의 링크를 열어주세요.</p>}<Link href="/login" className="font-semibold text-orange-700 underline">로그인으로 이동</Link></div>
        ) : (
          <form onSubmit={submit} className="mt-7 space-y-4">
            {(mode === "signup" || mode === "login" || mode === "forgot") && <label className="block text-sm font-medium">이메일<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>}
            {mode === "signup" && <label className="block text-sm font-medium">닉네임<input required minLength={2} maxLength={40} autoComplete="nickname" value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>}
            {(mode === "signup" || mode === "login" || mode === "reset") && <label className="block text-sm font-medium">비밀번호<input type="password" aria-label="비밀번호" required minLength={mode === "login" ? 1 : 12} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />{mode !== "login" && <span className="mt-1 block text-xs text-slate-500">12자 이상, 영문·숫자·특수문자를 포함하세요.</span>}</label>}
            {(mode === "signup" || mode === "reset") && <label className="block text-sm font-medium">비밀번호 확인<input type="password" required autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>}
            <button disabled={busy || (mode === "reset" && !token)} className="w-full rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-50">{busy ? "처리 중…" : mode === "signup" ? "가입하기" : mode === "login" ? "로그인" : mode === "forgot" ? "재설정 이메일 받기" : "비밀번호 변경"}</button>
          </form>
        )}
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
          {mode !== "login" && <Link href="/login" className="underline">로그인</Link>}
          {mode !== "signup" && <Link href="/signup" className="underline">회원가입</Link>}
          {mode === "login" && <Link href="/forgot-password" className="underline">비밀번호를 잊으셨나요?</Link>}
        </div>
      </div>
    </main>
  );
}
