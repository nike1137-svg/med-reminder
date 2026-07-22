"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MedicationForm from "@/components/MedicationForm";
import { apiFetch } from "@/lib/api";

export default function NewMedicationPage() {
  const router = useRouter();
  const [aiText, setAiText] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // 자연어 문장 → 약 등록 폼 값으로 자동완성 (로고스, 실험적 기능)
  async function callAi() {
    if (!aiText.trim()) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await apiFetch("/api/ai/parse-medication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "자동완성에 실패했습니다.");
      setAiResult(data); // 아래 MedicationForm이 key 변경으로 다시 그려지며 값이 채워진다
    } catch (e) {
      setAiError(e.message);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(values) {
    const res = await apiFetch("/api/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "등록에 실패했습니다.");
    }
    // 등록 성공 → 목록으로 이동
    router.push("/medications");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/medications" className="text-slate-400 hover:text-slate-600">
          ←
        </Link>
        <h1 className="text-xl font-bold">약 등록</h1>
      </div>

      {/* 자연어 자동완성 (실험적 기능) */}
      <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-4">
        <p className="text-sm font-semibold text-teal-800">
          ✨ 자연어로 빠르게 입력 <span className="text-teal-500">(베타)</span>
        </p>
        <p className="mt-1 text-xs text-teal-700/70">
          예: &ldquo;매일 아침저녁 혈압약 한 알, 식후 30분&rdquo;
        </p>
        <textarea
          value={aiText}
          onChange={(e) => setAiText(e.target.value)}
          rows={2}
          placeholder="약 정보를 편하게 문장으로 적어보세요"
          className="mt-2 w-full rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        <button
          type="button"
          onClick={callAi}
          disabled={aiLoading || !aiText.trim()}
          className="mt-2 rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {aiLoading ? "채우는 중…" : "AI로 채우기"}
        </button>
        {aiError && <p className="mt-2 text-xs text-red-600">{aiError}</p>}
        {aiResult && !aiError && (
          <p className="mt-2 text-xs text-teal-700">
            아래 폼에 채워졌습니다. 맞는지 확인하고 저장해주세요.
          </p>
        )}
      </div>

      <MedicationForm
        key={aiResult ? JSON.stringify(aiResult) : "empty"}
        initial={aiResult}
        onSubmit={handleSubmit}
        submitLabel="등록"
      />
    </div>
  );
}
