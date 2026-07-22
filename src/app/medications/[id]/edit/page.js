"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import MedicationForm from "@/components/MedicationForm";
import { apiFetch } from "@/lib/api";

export default function EditMedicationPage() {
  const router = useRouter();
  const { id } = useParams(); // 클라이언트 컴포넌트에서 [id] 값 꺼내기
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 기존 약 정보를 불러와 폼 초기값으로 사용
  useEffect(() => {
    apiFetch(`/api/medications/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("약 정보를 불러오지 못했습니다.");
        return res.json();
      })
      .then((data) => setInitial(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(values) {
    const res = await apiFetch(`/api/medications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "수정에 실패했습니다.");
    }
    router.push("/medications");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/medications" className="text-slate-400 hover:text-slate-600">
          ←
        </Link>
        <h1 className="text-xl font-bold">약 수정</h1>
      </div>

      {loading ? (
        <p className="text-slate-500">불러오는 중…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <MedicationForm
          initial={initial}
          onSubmit={handleSubmit}
          submitLabel="수정"
        />
      )}
    </div>
  );
}
