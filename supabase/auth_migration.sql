-- ============================================================
-- MedCheck — 로그인 대응 마이그레이션
-- 기존 schema.sql 실행 후, 이 스크립트를 Supabase SQL Editor에서 실행하세요.
-- additive-only: 기존 데이터를 지우지 않습니다.
-- ============================================================

-- 1) medications 에 소유자 컬럼 추가
alter table medications
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- 2) 기존 정책(공개 허용)을 제거하고, "내 것만" 정책으로 교체
drop policy if exists "medications public access" on medications;
drop policy if exists "dose_logs public access" on dose_logs;

-- medications: 로그인한 사용자 자신의 행만 조회/작성/수정/삭제 가능
create policy "medications owner access" on medications
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- dose_logs: 자기 소유 medication 에 연결된 기록만 접근 가능
-- (dose_logs 자체엔 user_id가 없으므로, medications 를 통해 소유권을 확인한다)
create policy "dose_logs owner access" on dose_logs
  for all
  using (
    exists (
      select 1 from medications m
      where m.id = dose_logs.medication_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from medications m
      where m.id = dose_logs.medication_id and m.user_id = auth.uid()
    )
  );
