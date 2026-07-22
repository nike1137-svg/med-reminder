import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase";

// GET /api/medications/[id] — 약 1개 조회 (수정 폼에서 기존 값 불러올 때 사용)
export async function GET(request, ctx) {
  const auth = await requireUser(request);
  if (!auth) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const { db, user } = auth;

  const { id } = await ctx.params;

  const { data, error } = await db
    .from("medications")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json(data);
}

// PATCH /api/medications/[id] — 약 수정 (Update)
export async function PATCH(request, ctx) {
  const auth = await requireUser(request);
  if (!auth) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const { db, user } = auth;

  const { id } = await ctx.params;
  const body = await request.json();
  const { name, dosage, time_slots, memo } = body;

  const { data, error } = await db
    .from("medications")
    .update({ name, dosage, time_slots, memo })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// DELETE /api/medications/[id] — 약 삭제 (Delete)
export async function DELETE(request, ctx) {
  const auth = await requireUser(request);
  if (!auth) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const { db, user } = auth;

  const { id } = await ctx.params;

  const { error } = await db
    .from("medications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
