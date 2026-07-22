"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

// Supabase 원문 에러(영어)를 사용자가 이해할 한국어 안내로 바꾼다.
function friendlyError(error) {
  const t = error?.message || "";
  if (/invalid login credentials/i.test(t))
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  if (/user already registered/i.test(t))
    return "이미 가입된 이메일입니다. 아래 '로그인'으로 들어와 주세요.";
  if (/password should be at least/i.test(t))
    return "비밀번호는 6자 이상이어야 합니다.";
  if (/invalid email/i.test(t)) return "이메일 주소 형식을 확인해주세요.";
  return "처리에 실패했습니다. 잠시 후 다시 시도해주세요.";
}

// 이메일 + 비밀번호 로그인/회원가입. (이메일 발송이 없어 발송 제한 문제가 없다)
export default function LoginForm() {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) return;
    setLoading(true);

    const { error } = isSignup
      ? await supabase.auth.signUp({ email: email.trim(), password })
      : await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

    setLoading(false);
    if (error) return setError(friendlyError(error));
    // 성공 시 AuthGate의 onAuthStateChange가 세션을 감지해 화면을 전환한다.
  }

  return (
    <div className="mx-auto mt-10 max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-xl font-bold text-slate-900">
        {isSignup ? "회원가입" : "로그인"}
      </h2>
      <p className="mt-1 mb-5 text-base text-slate-600">
        {isSignup
          ? "이메일과 비밀번호로 계정을 만듭니다."
          : "이메일과 비밀번호로 로그인합니다."}
      </p>

      <form onSubmit={submit} className="space-y-3">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-slate-300 px-4 py-4 text-base focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete={isSignup ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호 (6자 이상)"
          className="w-full rounded-lg border border-slate-300 px-4 py-4 text-base focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="min-h-[56px] w-full rounded-lg bg-teal-600 text-base font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {loading ? "처리 중…" : isSignup ? "회원가입" : "로그인"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(isSignup ? "signin" : "signup");
          setError("");
        }}
        className="mt-4 text-sm font-medium text-teal-700 underline"
      >
        {isSignup ? "이미 계정이 있으신가요? 로그인" : "처음이신가요? 회원가입"}
      </button>

      {error && <p className="mt-4 text-base text-red-600">{error}</p>}
    </div>
  );
}
