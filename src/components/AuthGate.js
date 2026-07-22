"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Landing from "./Landing";

// 앱 전체를 감싸서: 로그인 안 했으면 로그인 화면만, 했으면 헤더+내비+실제 화면을 보여준다.
export default function AuthGate({ children }) {
  const [session, setSession] = useState(undefined); // undefined = 확인 중, null = 비로그인

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    // 로그인/로그아웃이 일어날 때마다 화면을 자동으로 다시 그린다.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <p className="p-6 text-base text-slate-400">불러오는 중…</p>;
  }

  if (!session) {
    return <Landing />;
  }

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-base">
              💊
            </span>
            <span className="text-lg font-bold text-slate-900">MedCheck</span>
          </Link>
          <nav className="flex items-center gap-1 text-base">
            <Link
              href="/"
              className="rounded-md px-3 py-2 font-medium text-slate-600 hover:bg-slate-100"
            >
              오늘
            </Link>
            <Link
              href="/medications"
              className="rounded-md px-3 py-2 font-medium text-slate-600 hover:bg-slate-100"
            >
              약 목록
            </Link>
            <button
              onClick={() => supabase.auth.signOut()}
              className="ml-1 rounded-md px-3 py-2 font-medium text-slate-400 hover:bg-slate-100"
            >
              로그아웃
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-6">{children}</main>
    </>
  );
}
