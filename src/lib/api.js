import { supabase } from "./supabase";

// 우리 API를 호출할 때, 현재 로그인 세션의 토큰을 Authorization 헤더에 실어 보낸다.
// 이 토큰이 있어야 서버에서 RLS가 "이 사용자"로 동작한다.
export async function apiFetch(path, options = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = { ...(options.headers || {}) };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  return fetch(path, { ...options, headers });
}
