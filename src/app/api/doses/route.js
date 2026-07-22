import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase";

function seoulToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(
    new Date()
  );
}

// POST /api/doses — 복용 체크/해제 (upsert)
export async function POST(request) {
  const auth = await requireUser(request);
  if (!auth) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const { db, user } = auth;

  const body = await request.json();
  const { medication_id, time_slot, taken } = body;
  const date = body.date || seoulToday();

  if (!medication_id || !time_slot || typeof taken !== "boolean") {
    return NextResponse.json(
      { error: "medication_id, time_slot, taken(boolean) 은 필수입니다." },
      { status: 400 }
    );
  }

  // 이 약이 정말 내 것인지 먼저 확인한다 (RLS로도 막히지만, 명확한 에러 메시지를 위해 한 번 더 체크)
  const { data: med, error: medErr } = await db
    .from("medications")
    .select("id")
    .eq("id", medication_id)
    .eq("user_id", user.id)
    .single();
  if (medErr || !med) {
    return NextResponse.json({ error: "해당 약을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data, error } = await db
    .from("dose_logs")
    .upsert(
      {
        medication_id,
        date,
        time_slot,
        taken,
        taken_at: taken ? new Date().toISOString() : null,
      },
      { onConflict: "medication_id,date,time_slot" }
    )
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
