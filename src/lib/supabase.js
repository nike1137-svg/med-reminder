import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Supabase 환경변수가 없습니다. .env.local 의 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 를 확인하세요."
  );
}

// 브라우저용 클라이언트: 로그인 세션을 브라우저에 저장/자동갱신한다. (로그인·인증 전용)
export const supabase = createClient(url, key);

// API 라우트용: 요청에 실려온 사용자 토큰으로 "그 사용자로 인증된" 클라이언트를 만든다.
// → 이 클라이언트로 DB(PostgREST)에 접근해야 RLS가 "이 사용자의 데이터만" 으로 동작한다.
export function supabaseFromRequest(request) {
  const authorization = request.headers.get("authorization") ?? "";
  return createClient(url, key, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// API 라우트 공통 인증 체크: 토큰이 없거나 유효하지 않으면 null 을 반환한다.
export async function requireUser(request) {
  const token = (request.headers.get("authorization") ?? "").replace(
    /^Bearer\s+/i,
    ""
  );
  if (!token) return null;

  // 토큰 검증은 "깨끗한" 클라이언트(전역 헤더 없음)로 한다.
  // getUser(jwt)는 내부적으로 자기 세션 상태와 얽힐 수 있어, 확인용과 조회용 클라이언트를 분리한다.
  const authClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data?.user) return null;

  // 검증이 끝난 뒤에만, RLS가 적용될 조회용 클라이언트를 만든다.
  const db = supabaseFromRequest(request);
  return { db, user: data.user };
}
