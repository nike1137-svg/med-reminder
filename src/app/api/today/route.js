import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase";

const SLOT_ORDER = ["아침", "점심", "저녁", "취침", "시간무관"];

function seoulToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(
    new Date()
  );
}

// GET /api/today?date=YYYY-MM-DD — 내 오늘의 복약 현황
export async function GET(request) {
  const auth = await requireUser(request);
  if (!auth) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const { db, user } = auth;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || seoulToday();

  const { data: meds, error: medErr } = await db
    .from("medications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  if (medErr)
    return NextResponse.json({ error: medErr.message }, { status: 500 });

  const { data: logs, error: logErr } = await db
    .from("dose_logs")
    .select("*")
    .eq("date", date);
  if (logErr)
    return NextResponse.json({ error: logErr.message }, { status: 500 });

  const takenMap = new Map();
  for (const log of logs) {
    takenMap.set(`${log.medication_id}|${log.time_slot}`, log.taken);
  }

  const bySlot = {};
  for (const med of meds) {
    for (const slot of med.time_slots) {
      if (!bySlot[slot]) bySlot[slot] = [];
      bySlot[slot].push({
        medication_id: med.id,
        name: med.name,
        dosage: med.dosage,
        memo: med.memo,
        time_slot: slot,
        taken: takenMap.get(`${med.id}|${slot}`) || false,
      });
    }
  }

  const slots = SLOT_ORDER.filter((s) => bySlot[s]).map((s) => ({
    slot: s,
    items: bySlot[s],
  }));

  return NextResponse.json({ date, slots });
}
