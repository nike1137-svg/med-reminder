"use client";

import { useState } from "react";

const SLOTS = ["아침", "점심", "저녁", "취침", "시간무관"];

// 등록/수정 화면에서 공통으로 쓰는 폼.
// initial 이 있으면 그 값으로 채워지고(수정), 없으면 빈 폼(등록).
export default function MedicationForm({ initial, onSubmit, submitLabel = "저장" }) {
  const [name, setName] = useState(initial?.name || "");
  const [dosage, setDosage] = useState(initial?.dosage || "");
  const [timeSlots, setTimeSlots] = useState(initial?.time_slots || []);
  const [memo, setMemo] = useState(initial?.memo || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleSlot(slot) {
    setTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("약 이름을 입력하세요.");
    if (timeSlots.length === 0)
      return setError("복용 시간대를 하나 이상 선택하세요.");

    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        dosage: dosage.trim(),
        time_slots: timeSlots,
        memo: memo.trim(),
      });
    } catch (err) {
      setError(err.message || "저장 중 오류가 발생했습니다.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-base font-semibold text-slate-700">
          약 이름 <span className="text-red-500">*</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 암로디핀 5mg"
          className="w-full rounded-lg border border-slate-300 px-4 py-4 text-base focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-base font-semibold text-slate-700">
          용량
        </label>
        <input
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          placeholder="예: 1정"
          className="w-full rounded-lg border border-slate-300 px-4 py-4 text-base focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-base font-semibold text-slate-700">
          복용 시간대 <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SLOTS.map((slot) => {
            const active = timeSlots.includes(slot);
            return (
              <button
                type="button"
                key={slot}
                onClick={() => toggleSlot(slot)}
                className={`min-h-[48px] rounded-full border px-5 text-base font-medium transition ${
                  active
                    ? "border-teal-600 bg-teal-600 text-white"
                    : "border-slate-300 bg-white text-slate-600 hover:border-teal-400"
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-sm text-slate-500">
          영양제 등 시간이 정해지지 않은 약은 &lsquo;시간무관&rsquo;을 선택하세요 (하루 1회).
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-base font-semibold text-slate-700">
          메모
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="예: 식후 30분 / 보통 아침에 드림"
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      {error && <p className="text-base text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="min-h-[56px] w-full rounded-lg bg-teal-600 text-base font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
      >
        {saving ? "저장 중…" : submitLabel}
      </button>
    </form>
  );
}
