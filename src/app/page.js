"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

// 시간대별 "이 시각(서울 기준)까지가 예정, 이후는 놓침" 마감 기준.
// 임의로 정한 규칙이라 현장에 안 맞으면 이 표만 조정하면 된다.
const SLOT_DEADLINE_HOUR = { 아침: 11, 점심: 15, 저녁: 21, 취침: 24 };

function seoulHour() {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul",
      hour: "2-digit",
      hour12: false,
    }).format(new Date())
  );
}

// 항목 하나의 상태: done(완료) / missed(놓침) / upcoming(예정) / anytime(시간무관, 아직 체크 전)
function getStatus(item) {
  if (item.taken) return "done";
  if (item.time_slot === "시간무관") return "anytime";
  const deadline = SLOT_DEADLINE_HOUR[item.time_slot];
  if (deadline != null && seoulHour() >= deadline) return "missed";
  return "upcoming";
}

const STATUS_STYLE = {
  done: {
    card: "border-slate-200 bg-slate-50",
    check: "border-green-500 bg-green-500 text-white",
    name: "text-slate-400 line-through",
    badge: null,
  },
  missed: {
    card: "border-red-300 bg-white ring-1 ring-red-100",
    check: "border-red-300 text-transparent",
    name: "text-slate-900",
    badge: { text: "놓침", className: "bg-red-100 text-red-700" },
  },
  upcoming: {
    card: "border-blue-200 bg-blue-50/50",
    check: "border-blue-300 text-transparent",
    name: "text-slate-900",
    badge: { text: "예정", className: "bg-blue-100 text-blue-700" },
  },
  anytime: {
    card: "border-teal-200 bg-teal-50/50",
    check: "border-teal-300 text-transparent",
    name: "text-slate-900",
    badge: { text: "체크 필요", className: "bg-teal-100 text-teal-700" },
  },
};

function OnboardingStep({ icon, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium text-slate-500">{label}</span>
    </div>
  );
}

export default function HomePage() {
  const [data, setData] = useState(null); // { date, slots: [{slot, items:[...]}] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await apiFetch("/api/today");
      if (!res.ok) throw new Error("현황을 불러오지 못했습니다.");
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(item) {
    await apiFetch("/api/doses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medication_id: item.medication_id,
        time_slot: item.time_slot,
        taken: !item.taken,
      }),
    });
    load();
  }

  if (loading)
    return <p className="py-8 text-center text-base text-slate-500">불러오는 중…</p>;
  if (error)
    return <p className="py-8 text-center text-base text-red-600">{error}</p>;

  const allItems = data.slots.flatMap((s) => s.items);
  const total = allItems.length;
  const done = allItems.filter((i) => i.taken).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">오늘의 복약</h1>
        <p className="text-sm text-slate-600">{data.date}</p>
      </div>

      {total === 0 ? (
        // 처음 로그인해서 아직 약이 없을 때 — 무엇을 해야 하는지 3단계로 미리 보여준다.
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6">
          <p className="text-center text-base text-slate-600">
            아직 등록된 약이 없습니다.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <OnboardingStep icon="💊" label="약·시간 등록" />
            <span className="text-slate-300">→</span>
            <OnboardingStep icon="📋" label="오늘 목록에 표시" />
            <span className="text-slate-300">→</span>
            <OnboardingStep icon="✅" label="체크 시작" />
          </div>
          <Link
            href="/medications/new"
            className="mt-6 block rounded-xl bg-teal-600 py-4 text-center text-base font-semibold text-white hover:bg-teal-700"
          >
            + 약 등록하기
          </Link>
        </div>
      ) : (
        <>
          {/* 요약: 몇 개 중 몇 개 완료 */}
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-slate-700">
                오늘 완료
              </span>
              <span className="text-lg font-bold text-teal-700">
                {done} / {total}
              </span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-teal-500 transition-all"
                style={{ width: total ? `${(done / total) * 100}%` : "0%" }}
              />
            </div>
          </div>

          {/* 시간대별 섹션 */}
          {data.slots.map((section) => (
            <section key={section.slot}>
              <h2 className="mb-2 text-base font-bold text-slate-600">
                {section.slot}
              </h2>
              <ul className="space-y-2">
                {section.items.map((item) => {
                  const status = getStatus(item);
                  const style = STATUS_STYLE[status];
                  return (
                    <li key={`${item.medication_id}-${item.time_slot}`}>
                      <button
                        onClick={() => toggle(item)}
                        className={`flex w-full min-h-[56px] items-center gap-3 rounded-xl border p-4 text-left transition ${style.card}`}
                      >
                        {/* 체크 표시 */}
                        <span
                          className={`flex h-7 w-7 flex-none items-center justify-center rounded-full border-2 text-base ${style.check}`}
                        >
                          ✓
                        </span>
                        <span className="flex-1">
                          <span className={`block text-base font-semibold ${style.name}`}>
                            {item.name}
                          </span>
                          <span className="block text-sm text-slate-500">
                            {[item.dosage, item.memo].filter(Boolean).join(" · ")}
                          </span>
                        </span>
                        {/* 상태 배지 */}
                        {style.badge && (
                          <span
                            className={`flex-none rounded-full px-2.5 py-1 text-xs font-bold ${style.badge.className}`}
                          >
                            {style.badge.text}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
