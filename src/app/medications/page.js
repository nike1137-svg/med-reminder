"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function MedicationsPage() {
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await apiFetch("/api/medications");
    setMeds(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id, name) {
    if (
      !confirm(`'${name}'을(를) 삭제할까요?\n관련된 복용 기록도 함께 삭제됩니다.`)
    )
      return;
    await apiFetch(`/api/medications/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">약 목록</h1>
        <Link
          href="/medications/new"
          className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          + 약 등록
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-500">불러오는 중…</p>
      ) : meds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          등록된 약이 없습니다.
        </div>
      ) : (
        <ul className="space-y-2">
          {meds.map((med) => (
            <li
              key={med.id}
              className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{med.name}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {[med.dosage, med.memo].filter(Boolean).join(" · ")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {med.time_slots.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-none gap-1">
                  <Link
                    href={`/medications/${med.id}/edit`}
                    className="rounded-md px-2 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100"
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => handleDelete(med.id, med.name)}
                    className="rounded-md px-2 py-1 text-sm font-medium text-red-500 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
