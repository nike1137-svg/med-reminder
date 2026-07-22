-- ============================================================
-- MedCheck (복약 관리 알리미) — DB 스키마
-- Supabase SQL Editor에 붙여넣고 실행하세요.
-- 이 스크립트는 additive-only 입니다: 기존 데이터를 지우지 않습니다.
-- ============================================================

-- 1) medications : 약 마스터 (무엇을 먹어야 하는가)
create table if not exists medications (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,                       -- 약 이름 (예: 암로디핀 5mg)
  dosage      text,                                -- 용량 (예: 1정)
  time_slots  text[] not null default '{}',        -- 복용 시간대 (예: {아침,저녁} / {시간무관})
  memo        text,                                -- 메모 (예: 식후 30분 / 보통 아침)
  created_at  timestamptz not null default now()
);

-- 2) dose_logs : 복용 기록 (실제로 먹었는가)
create table if not exists dose_logs (
  id             uuid primary key default gen_random_uuid(),
  medication_id  uuid not null references medications(id) on delete cascade,
  date           date not null,                    -- 복용 날짜
  time_slot      text not null,                    -- 어느 시간대분인지
  taken          boolean not null default false,   -- 먹음/안먹음
  taken_at       timestamptz,                      -- 체크한 시각
  unique (medication_id, date, time_slot)          -- 같은 약·같은 날·같은 시간대 중복 방지
);

-- 조회 성능: 오늘 날짜로 자주 찾으므로 date 인덱스
create index if not exists dose_logs_date_idx on dose_logs (date);

-- 3) RLS (Row-Level Security) 활성화
alter table medications enable row level security;
alter table dose_logs   enable row level security;

-- 4) MVP 정책: 공개 읽기/쓰기 허용 (인증 없는 단일 돌봄팀 가정)
--    * 나중에 로그인을 붙이면 이 정책을 사용자별로 좁힌다.
drop policy if exists "medications public access" on medications;
create policy "medications public access" on medications
  for all using (true) with check (true);

drop policy if exists "dose_logs public access" on dose_logs;
create policy "dose_logs public access" on dose_logs
  for all using (true) with check (true);
