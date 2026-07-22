import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase";

// GET /api/medications — 내 약 목록 조회 (Read)
export async function GET(request) {
  const auth = await requireUser(request);
  if (!auth) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const { db, user } = auth;

  const { data, error } = await db
    .from("medications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST /api/medications — 약 등록 (Create)
export async function POST(request) {
  const auth = await requireUser(request);
  if (!auth) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const { db, user } = auth;

  const body = await request.json();
  const { name, dosage, time_slots, memo } = body;

  if (!name || !Array.isArray(time_slots) || time_slots.length === 0) {
    return NextResponse.json(
      { error: "약 이름과 복용 시간대는 필수입니다." },
      { status: 400 }
    );
  }

  const { data, error } = await db
    .from("medications")
    .insert({ name, dosage, time_slots, memo, user_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
