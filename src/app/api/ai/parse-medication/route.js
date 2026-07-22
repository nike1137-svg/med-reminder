import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase";

// POST /api/ai/parse-medication — 자연어 문장을 약 등록 폼 값으로 변환
// 로고스(CrewAI + Vertex AI, 조경호 님 PC에서 터널로 노출)에 위임한다.
// 이 기능이 꺼져 있어도(PC가 안 켜져 있음) 수동 입력은 항상 가능해야 하므로,
// 실패 시 친절한 한국어 안내만 돌려주고 500으로 앱을 깨지 않는다.
export async function POST(request) {
  const auth = await requireUser(request);
  if (!auth)
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await request.json();
  const text = (body?.text || "").trim();
  if (!text) {
    return NextResponse.json({ error: "문장을 입력해주세요." }, { status: 400 });
  }

  const baseUrl = process.env.MED_PARSER_API_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { error: "AI 자동완성이 지금은 준비되어 있지 않습니다. 직접 입력해주세요." },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(`${baseUrl}/parse-medication`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(15000), // 15초 넘으면 포기 — 화면이 무한 로딩되지 않게
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "AI가 지금 응답하지 않습니다. 잠시 후 다시 시도하거나 직접 입력해주세요." },
        { status: 503 }
      );
    }

    const data = await res.json();
    if (data.error) {
      return NextResponse.json(
        { error: "AI가 문장을 이해하지 못했습니다. 다르게 표현해보거나 직접 입력해주세요." },
        { status: 503 }
      );
    }
    return NextResponse.json(data);
  } catch {
    // PC가 꺼져 있거나 터널이 끊긴 경우가 대부분 — 앱 자체는 계속 정상 동작해야 한다.
    return NextResponse.json(
      { error: "AI 자동완성 서비스에 연결할 수 없습니다. 직접 입력해주세요." },
      { status: 503 }
    );
  }
}
