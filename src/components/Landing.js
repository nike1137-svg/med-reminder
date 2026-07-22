"use client";

import LoginForm from "./LoginForm";

// 로그인 전 방문자에게 보여주는 소개 화면: 서비스 설명 + 로그인 폼
export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-14">
        {/* 소개 섹션 */}
        <div className="text-center">
          <p className="text-4xl">💊</p>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">MedCheck</h1>
          <p className="mt-1 font-semibold text-teal-700">복약 관리 알리미</p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-500">
            인지저하·거동불편 어르신은 스스로 복약을 챙기기 어렵습니다.
            MedCheck은 돌봄제공자가 &ldquo;오늘 무엇을 드렸는지&rdquo;를
            기록하고, 교대자·보호자와 공유할 수 있도록 돕는 서비스입니다.
          </p>
        </div>

        {/* 핵심 기능 3가지 */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FeatureCard
            icon="✅"
            title="오늘의 복약 체크"
            desc="시간대별로 오늘 먹어야 할 약을 확인하고 체크합니다."
          />
          <FeatureCard
            icon="🔔"
            title="미완료 강조"
            desc="아직 복용하지 않은 약을 눈에 띄게 표시합니다."
          />
          <FeatureCard
            icon="🔒"
            title="내 계정, 내 데이터"
            desc="로그인한 본인의 기록만 안전하게 보이고 관리됩니다."
          />
        </div>

        {/* 로그인 폼 */}
        <div className="mt-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200">
      <p className="text-2xl">{icon}</p>
      <p className="mt-1 text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-400">{desc}</p>
    </div>
  );
}
