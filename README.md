# MedCheck (복약 관리 알리미) README

## Project Overview

돌봄제공자(요양보호사·가족)가 어르신의 복약 현황을 기록하고, 교대자·보호자와 공유할 수 있도록 돕는 웹 서비스입니다. 인지저하·거동불편 어르신은 복용 여부를 스스로 기억하거나 실행하기 어렵기 때문에, "누가 언제 무엇을 드렸는지"를 명확히 기록하는 것을 목표로 합니다. 자세한 기획 배경은 [PRD.md](./PRD.md)를 참고하세요.

## Key Features

- **오늘의 복약 체크리스트**: 시간대(아침/점심/저녁/취침/시간무관)별로 오늘 먹어야 할 약을 보여주고, 미완료 항목을 강조 표시
- **약 등록/수정/삭제**: 약 이름·용량·복용 시간대·메모 관리 (CRUD)
- **복용 기록**: 체크한 시각을 저장, 날짜별로 관리
- **이메일 로그인 + 사용자별 데이터 분리**: Supabase Auth 매직링크 로그인, Row-Level Security로 로그인한 사용자 본인의 데이터만 조회/수정 가능

## Technology Foundation

- **프론트엔드**: Next.js 16 (App Router), Tailwind CSS
- **백엔드**: Next.js Route Handlers (API)
- **데이터베이스 / 인증**: Supabase (PostgreSQL + Auth, Row-Level Security)
- **배포**: Vercel

## Local Development

```bash
npm install
npm run dev
```

`.env.local`에 아래 두 값이 필요합니다 (Supabase 프로젝트 설정 → API Keys):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

DB 스키마는 `supabase/schema.sql` → `supabase/auth_migration.sql` 순서로 Supabase SQL Editor에서 실행합니다.

## Deployment

Vercel을 통해 배포되어 실제 접속 가능한 URL로 서비스됩니다. (배포 URL은 추후 업데이트)

## Development Roadmap

PRD 작성 → 화면/데이터 구조 설계 → 프론트엔드 구현 → 백엔드/API 구현 (CRUD 6종) → DB 연동 (Supabase) → 로그인 및 사용자별 데이터 분리 추가 → 배포.
