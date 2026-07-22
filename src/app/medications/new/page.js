"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import MedicationForm from "@/components/MedicationForm";
import { apiFetch } from "@/lib/api";

export default function NewMedicationPage() {
  const router = useRouter();

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
      <MedicationForm onSubmit={handleSubmit} submitLabel="등록" />
    </div>
  );
}
