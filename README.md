# MedCheck (복약 관리 알리미) README

## Project Overview

돌봄제공자(요양보호사·가족)가 어르신의 복약 현황을 기록하고, 교대자·보호자와 공유할 수 있도록 돕는 웹 서비스입니다. 인지저하·거동불편 어르신은 복용 여부를 스스로 기억하거나 실행하기 어렵기 때문에, "누가 언제 무엇을 드렸는지"를 명확히 기록하는 것을 목표로 합니다. 자세한 기획 배경은 [PRD.md](./PRD.md)를 참고하세요.

## Key Features

- **오늘의 복약 체크리스트**: 시간대(아침/점심/저녁/취침/시간무관)별로 오늘 먹어야 할 약을 보여주고, 미완료 항목을 강조 표시
- **약 등록/수정/삭제**: 약 이름·용량·복용 시간대·메모 관리 (CRUD)
- **복용 기록**: 체크한 시각을 저장, 날짜별로 관리
- **이메일·비밀번호 로그인 + 사용자별 데이터 분리**: Supabase Auth 이메일/비밀번호 로그인, Row-Level Security로 로그인한 사용자 본인의 데이터만 조회/수정 가능
- **자연어 약 등록 자동완성 (베타)**: "매일 아침저녁 혈압약 한 알" 같은 문장을 AI가 이름·용량·시간대로 구조화. CrewAI + Vertex AI(Gemini) 에이전트를 별도 서버에서 돌려 API로 연동 — 새로운 의료정보를 생성하지 않고 사용자 입력만 정리하도록 설계, 결과는 저장 전 사용자가 직접 확인

## Technology Foundation

- **프론트엔드**: Next.js 16 (App Router), Tailwind CSS
- **백엔드**: Next.js Route Handlers (API)
- **데이터베이스 / 인증**: Supabase (PostgreSQL + Auth, Row-Level Security)
- **AI 자동완성**: CrewAI + Vertex AI(Gemini 2.5 Flash) — 로컬 서버에서 구동, Cloudflare 터널로 노출
- **배포**: Vercel

## 개인정보·보안 설계

복약 정보는 건강 관련 **민감정보**이므로, 개인정보 **최소 수집** 원칙을 따랐습니다.

- 로그인에 필요한 **이메일·비밀번호만** 수집하고, 이름·연락처 등 부가 정보는 받지 않습니다.
- **Row-Level Security(RLS)**로 로그인한 본인의 데이터에만 접근 가능하며, 다른 사용자의 복약 기록은 조회되지 않습니다.
- 교육용 프로젝트이므로 **실제 환자의 실데이터가 아닌 테스트 데이터** 사용을 전제로 합니다.

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

Vercel을 통해 배포되어 실제 접속 가능한 URL로 서비스됩니다.

🔗 https://med-reminder-chi.vercel.app

> 로그인은 이메일·비밀번호 방식입니다. 처음이면 "회원가입"으로 계정을 만들고(즉시 로그인), 이후 같은 정보로 로그인하면 됩니다.

### AI 자동완성(베타) 관련 운영 안내

약 등록 화면의 "자연어로 빠르게 입력" 기능은 별도 로컬 서버(CrewAI + Vertex AI)를 Cloudflare 터널로 연결해 제공합니다. **이 서버는 상시 구동이 아니며, 운영자(marcus) PC가 켜져 있는 시간에만 동작합니다.** 해당 기능이 응답하지 않을 때는 안내 메시지가 표시되며, **약 등록/조회/수정/삭제·복약 체크·로그인 등 핵심 기능은 이 기능과 무관하게 항상 정상 동작**합니다.

## Development Roadmap

PRD 작성 → 화면/데이터 구조 설계 → 프론트엔드 구현 → 백엔드/API 구현 (CRUD 6종) → DB 연동 (Supabase) → 로그인 및 사용자별 데이터 분리 추가 → 배포.
