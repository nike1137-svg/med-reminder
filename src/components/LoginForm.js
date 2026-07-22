"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

// Supabase의 원문 에러(영어)를 사용자가 이해할 수 있는 한국어 안내로 바꾼다.
function friendlyErrorMessage(error) {
  const text = error?.message || "";
  if (/rate limit/i.test(text)) {
    return "요청이 많아 잠시 이메일 발송이 제한되었습니다. 몇 분 뒤 다시 시도해주세요.";
  }
  if (/invalid email/i.test(text)) {
    return "이메일 주소 형식을 다시 확인해주세요.";
  }
  return "전송에 실패했습니다. 잠시 후 다시 시도해주세요.";
}

// 이메일 → 메일함의 링크 클릭 → 로그인 (Supabase 기본 매직링크 방식)
export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendLink(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        // 링크를 클릭하면 이 주소로 돌아온다. (배포 후에는 배포 주소가 자동으로 잡힌다)
        emailRedirectTo:
          typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    setLoading(false);
    if (error) return setMsg(friendlyErrorMessage(error));
    setSent(true);
  }

  return (
    <div className="mx-auto mt-10 max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h1 className="text-lg font-bold text-teal-700">💊 MedCheck 로그인</h1>
      <p className="mt-1 mb-5 text-sm text-slate-500">
        이메일로 로그인 링크를 받습니다. 사용자별로 복약 데이터가 분리됩니다.
      </p>

      {!sent ? (
        <form onSubmit={sendLink} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-600 py-2.5 font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "전송 중…" : "로그인 링크 받기"}
          </button>
          <p className="text-xs leading-relaxed text-slate-400">
            메일이 도착하지 않으면 스팸함을 확인해주세요. 짧은 시간 안에 여러 번
            요청하면 잠시 발송이 제한될 수 있어요 — 그럴 땐 몇 분 뒤 다시
            시도해주세요.
          </p>
        </form>
      ) : (
        <div className="rounded-lg bg-teal-50 p-4 text-sm text-teal-800">
          <p className="font-semibold">📩 메일을 확인하세요</p>
          <p className="mt-1">
            <strong>{email}</strong> 로 로그인 링크를 보냈습니다. 메일함(스팸함
            포함)에서 <strong>&ldquo;Sign in&rdquo;</strong> 링크를 클릭하면
            자동으로 로그인됩니다.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-3 text-teal-700 underline"
          >
            다른 이메일로 다시 시도
          </button>
        </div>
      )}

      {msg && <p className="mt-4 text-sm text-red-600">{msg}</p>}
    </div>
  );
}
