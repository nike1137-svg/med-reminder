"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function HomePage() {
  const [data, setData] = useState(null); // { date, slots: [{slot, items:[...]}] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 오늘의 복약 현황을 서버에서 불러온다.
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

  // 체크/해제 → 서버에 저장 후 다시 로드
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

  if (loading) return <p className="text-slate-500">불러오는 중…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  // 전체 항목 수 / 완료 수 계산 (요약 표시용)
  const allItems = data.slots.flatMap((s) => s.items);
  const total = allItems.length;
  const done = allItems.filter((i) => i.taken).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">오늘의 복약</h1>
        <p className="text-sm text-slate-500">{data.date}</p>
      </div>

      {total === 0 ? (
        // 등록된 약이 없을 때
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-500">아직 등록된 약이 없습니다.</p>
          <Link
            href="/medications/new"
            className="mt-3 inline-block rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            + 약 등록하기
          </Link>
        </div>
      ) : (
        <>
          {/* 요약: 몇 개 중 몇 개 완료 */}
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">오늘 완료</span>
              <span className="text-sm font-bold text-teal-700">
                {done} / {total}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-teal-500 transition-all"
                style={{ width: total ? `${(done / total) * 100}%` : "0%" }}
              />
            </div>
          </div>

          {/* 시간대별 섹션 */}
          {data.slots.map((section) => (
            <section key={section.slot}>
              <h2 className="mb-2 text-sm font-bold text-slate-500">
                {section.slot}
              </h2>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={`${item.medication_id}-${item.time_slot}`}>
                    <button
                      onClick={() => toggle(item)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                        item.taken
                          ? "border-slate-200 bg-slate-50"
                          : "border-red-200 bg-white ring-1 ring-red-100"
                      }`}
                    >
                      {/* 체크 표시 */}
                      <span
                        className={`flex h-6 w-6 flex-none items-center justify-center rounded-full border-2 ${
                          item.taken
                            ? "border-teal-500 bg-teal-500 text-white"
                            : "border-red-300 text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                      <span className="flex-1">
                        <span
                          className={`block font-semibold ${
                            item.taken
                              ? "text-slate-400 line-through"
                              : "text-slate-900"
                          }`}
                        >
                          {item.name}
                        </span>
                        <span className="block text-xs text-slate-400">
                          {[item.dosage, item.memo].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      {/* 미완료 강조 배지 */}
                      {!item.taken && (
                        <span className="flex-none rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                          미완료
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
