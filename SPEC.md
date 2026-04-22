# SPEC — FitConsult 실행용 상세 스펙

## 완성 모습 (시나리오)
1. 아침 9시, 트레이너 김OO이 앱에 로그인. 대시보드에 "오늘 할 일 8개" — 재등록 멘트 보낼 회원 3명, OT 후속 전화 2명, 미방문 리콜백 3명. 대상자별 맞춤 멘트·타이밍을 바로 확인.
2. 11시 수업 끝. 회원 카드에 "관절 컨디션 호전" 한 줄 + 세션 차감 입력. AI가 "다음 주 재등록 명분 3가지"를 그 위에서 자동 갱신.
3. 저녁, 팀장이 본인 팀 3명의 주간 지표 한 화면에서 점검. 전환율 낮은 팀원에게 AI가 뽑아준 "약점 코칭 + 이번 주 집중 액션 3줄" 공유.
4. 금요일, 매니저가 전 트레이너 순위·재등록률·미스회원 수를 확인. 월 1000만원 목표 대비 잔여분을 주간 계획에 자동 반영.
5. 신규 미스회원 엑셀 업로드 한 번 → AI가 개인별 상황 추정 + 재OT/PT 유도 이벤트·멘트 초안 즉시 생성.

## 기능 목록

### 필수 (MVP에 반드시)
- 구글 OAuth 로그인 (Supabase Auth)
- 직급 기반 가시성 — "자기 직급 이하만 보임"
  - 매니저: 전부 / 팀장: 매니저 제외 / 주임: 팀장·매니저 제외 / 사원: 사원만
  - Supabase RLS로 강제
- PT 회원 CRUD (이름·세션 잔여·상태·목표·재등록 가능성)
- OT·체험 명단 CRUD (상태: 등록·진행·놓침)
- 엑셀 업로드 → 파싱해서 DB 적재
- 대시보드: 개인별 "오늘 할 일" 체크리스트
- AI 멘트 생성: 회원 1명 클릭 → 재등록 멘트·세일즈 흐름 초안 (심리학 기반)
- 주간 지표: OT·체험·재등록 등록률, 개인별 약점 자동 집계
- 주간 전략 리포트: 지표·회원 상태 읽고 "이번 주 집중 포인트 3가지"

### 있으면 좋은 것
- 구글 드라이브 "제로코치 자료" RAG 연동
- 미스회원용 이벤트·문안 자동 생성
- 재등록 권유 타이밍 알림
- 팀장·매니저 전체 조회 뷰 (권한별 집계)

## 단계별 상세

### 1단계 — Next.js 돌아가는 최소 버전
- **목표**: Vercel 배포 URL에서 화면이 진짜로 뜬다
- **완료 조건**:
  - `create-next-app`으로 생성된 프로젝트가 로컬 `npm run dev`에서 돌아감
  - GitHub 레포에 push됨
  - Vercel이 자동 배포하고 `https://xxx.vercel.app` URL로 접속 가능
  - GitHub에 새 커밋 push → Vercel 재배포 자동 트리거 확인
- **만들·수정할 파일 힌트**:
  - `app/page.tsx` — 홈 화면("Hello FitConsult" + 더미 로그인 버튼)
  - `README.md` — 프로젝트 한 줄 설명
  - `.gitignore` (기본값 OK)
- **필요한 API**: 없음 (GitHub·Vercel 계정만)

### 2단계 — Supabase 연결 + 구글 로그인
- **목표**: 구글 계정으로 로그인하면 사용자 정보가 DB에 저장됨
- **완료 조건**:
  - 로그인 버튼 클릭 → 구글 계정 선택 → 앱으로 리다이렉트되어 "환영합니다 {이름}님" 표시
  - `profiles` 테이블에 해당 사용자 row가 생성됨 (id·이름·email·rank·team_id)
  - 직급이 `manager`인 사용자만 `/manager` 페이지에 접근 가능
- **만들·수정할 파일 힌트**:
  - `lib/supabase/client.ts`, `lib/supabase/server.ts` — Supabase 클라이언트 (브라우저용/서버용)
  - `middleware.ts` — 세션 쿠키 갱신
  - `app/login/page.tsx` — 로그인 페이지
  - `app/auth/callback/route.ts` — OAuth 콜백
  - `app/manager/page.tsx` — 매니저 전용 페이지 (권한 확인)
  - `supabase/migrations/001_profiles.sql` — `profiles` 테이블 SQL
- **필요한 API**: Supabase, Google OAuth 2.0 클라이언트 ID

### 3단계 — PT 회원 CRUD + 직급 기반 RLS
- **목표**: 트레이너가 본인 PT 회원을 관리하고, 직급에 따라 다른 사람 데이터가 자동으로 가려진다
- **완료 조건**:
  - 로그인한 사용자가 회원 추가·수정·삭제·조회 가능
  - 사원 계정으로 로그인하면 다른 사원 데이터만 보이고 팀장/주임/매니저 데이터는 쿼리 단계에서 차단됨
  - 로그아웃 후 재로그인해도 데이터 유지
- **만들·수정할 파일 힌트**:
  - `supabase/migrations/002_members.sql` — `members`, `ot_trials` 테이블 + RLS 정책
  - `app/members/page.tsx` — 내 회원 목록 (카드 뷰)
  - `app/members/[id]/page.tsx` — 회원 상세
  - `app/members/new/page.tsx` — 회원 추가 폼
  - `app/actions/members.ts` — Server Actions (추가·수정·삭제)
- **필요한 API**: 없음 (2단계 재사용)

### 4단계 — Gemini API로 AI 재등록 멘트 생성 (핵심)
- **목표**: 회원 카드의 버튼 하나로 심리학 기반 재등록 멘트 초안이 뜬다
- **완료 조건**:
  - 회원 상세 페이지에 "AI 재등록 멘트 생성" 버튼 존재
  - 클릭하면 3~5문장의 세일즈 멘트가 실제로 생성됨 (거부감 없이 설득되는 톤)
  - 회원의 세션 잔여·상태·목표 정보가 프롬프트에 반영되어 개인 맞춤 결과가 나옴
- **만들·수정할 파일 힌트**:
  - `lib/gemini.ts` — Vertex AI 클라이언트 (base64 키 디코딩 + VertexAI 초기화)
  - `lib/prompts/reengagement.ts` — 재등록 멘트 프롬프트 (심리학 기반 세일즈 흐름 고정)
  - `app/api/ai/reengagement/route.ts` — Gemini 호출 API 라우트
  - `app/members/[id]/ai-button.tsx` — 클라이언트 컴포넌트 (버튼 + 결과 표시)
- **필요한 API**: Google Vertex AI (서비스 계정 JSON). SDK: `@google-cloud/vertexai`. 기본 모델 `gemini-2.5-flash`.

### 5단계 — 엑셀 업로드 + OT·체험 + 지표
- **목표**: 엑셀 시트를 올리면 DB에 자동 적재되고, 개인별 등록률 수치가 계산된다
- **완료 조건**:
  - 엑셀 파일 업로드 폼 → 파싱 후 `ot_trials` 테이블에 row 생성
  - 트레이너별 OT→등록률, 체험→등록률, 재등록률 숫자가 대시보드에 표시
  - 가장 낮은 지표 = 해당 트레이너의 "약점"으로 자동 표시
- **만들·수정할 파일 힌트**:
  - `app/upload/page.tsx` — 업로드 페이지
  - `lib/excel-parser.ts` — xlsx 파싱 로직 (컬럼 매핑 포함)
  - `lib/metrics.ts` — 등록률 계산 함수
  - `app/dashboard/page.tsx` — 지표 카드
- **필요한 API**: 없음 (라이브러리 `xlsx`만 추가)

### 6단계 — 주간 전략 리포트 + 팀장·매니저 뷰
- **목표**: 주 1회 "이번 주 집중 포인트"가 개인별로 생성되고, 팀장·매니저는 집계로 본다
- **완료 조건**:
  - 트레이너 화면에 "이번 주 전략" 카드가 3줄 요약으로 표시 (지표+회원 상태 → AI 집중 포인트)
  - 팀장은 본인 팀원 전체의 지표 테이블 조회 가능
  - 매니저는 전 트레이너 순위·잔여 목표 자동 배분 뷰 접근 가능
- **만들·수정할 파일 힌트**:
  - `lib/prompts/weekly-strategy.ts` — 주간 전략 프롬프트
  - `app/api/ai/weekly-report/route.ts` — 주간 리포트 생성 API
  - `app/team/page.tsx` — 팀장 뷰
  - `app/manager/dashboard/page.tsx` — 매니저 집계 뷰
- **필요한 API**: 없음 (Gemini 재사용)

### (선택) 7단계 — 구글 드라이브 RAG
- **목표**: AI가 "제로코치 풀패키지" 문서 논리대로 전략을 짠다
- **완료 조건**: 문서 기반 근거가 들어간 답변이 나옴 (예: "제로코치 가이드 p.23에 따르면...")
- **만들·수정할 파일 힌트**:
  - `lib/drive.ts` — Google Drive API 클라이언트
  - `lib/embeddings.ts` — 문서 조각 임베딩 (Vertex AI Embeddings)
  - `supabase/migrations/003_documents.sql` — `documents` 테이블 + pgvector 컬럼
  - `lib/rag.ts` — 검색 + Gemini 프롬프트 결합
- **필요한 API**: Google Drive API, Supabase pgvector (확장 활성화만), Vertex AI Embeddings

## API·외부 도구

| 이름 | 가입·발급 | 처음이면 이렇게 배우기 |
|---|---|---|
| **GitHub** | 이미 있음 | — |
| **Vercel** | 이미 있음 (GitHub 연동) | Vercel 공식 Next.js 배포 가이드 1페이지 |
| **Supabase** | supabase.com 무료 가입 → New Project. Project URL·anon key를 Vercel 환경변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)에 저장 | Supabase 공식 "Next.js with Supabase Auth" 퀵스타트 (30분 투자) |
| **Google OAuth 2.0 클라이언트** | Google Cloud Console → "API 및 서비스" → "사용자 인증 정보" → OAuth 2.0 클라이언트 ID 생성. 리디렉션 URI는 Supabase가 알려주는 `https://<project>.supabase.co/auth/v1/callback`. Supabase 대시보드 Authentication → Providers → Google에 클라이언트ID·시크릿 붙여넣기 | 유튜브 "supabase google oauth nextjs" 10분짜리 영상 하나 |
| **Supabase RLS** | 위 Supabase에 포함. SQL Editor에서 정책 작성 | Supabase 공식 "Row Level Security" 문서가 **이 프로젝트 핵심**. 역할 기반 정책 예제를 거의 그대로 사용 가능 |
| **Google Vertex AI (Gemini)** | GCP 콘솔 → 프로젝트 선택 → Vertex AI API 활성화 → IAM에서 서비스 계정 만들고 "Vertex AI User" 권한 부여 → JSON 키 다운로드 → base64 인코딩 후 `GOOGLE_CREDENTIALS_BASE64`에 저장. 프로젝트 ID는 `GOOGLE_CLOUD_PROJECT`, 리전은 `GOOGLE_CLOUD_LOCATION`(예: `us-central1`). SDK: `npm i @google-cloud/vertexai` | Google 공식 "Vertex AI Gemini Node.js Quickstart" + Model Garden에서 `gemini-2.5-flash` 사용 가능한지 먼저 확인. Gemini Flash는 저비용·빠름. |
| **SheetJS** (`xlsx`) | `npm i xlsx` (가입 불필요) | 공식 문서 첫 페이지: 파일 input → ArrayBuffer → `XLSX.read()` |
| **Google Drive API** (선택) | Google Cloud Console에서 Drive API 활성화 + OAuth 스코프 `drive.readonly` 추가 | 앞 단계 다 끝낸 뒤 별도 학습 |
| **Supabase pgvector** (선택) | Supabase Dashboard → Database → Extensions → `vector` 켜기 | Google Gen AI 블로그 "RAG with Vertex AI Embeddings" 참고 |

## 오늘 수업 범위 vs 집에서 이어서 할 범위

### 오늘 수업 (권장)
- **1단계 끝까지**: `create-next-app` → GitHub push → Vercel URL에서 진짜 화면 뜨는 것 확인
- 시간 남으면 2단계 시작 (Supabase 프로젝트 생성, `@supabase/ssr` 설치, 로그인 페이지 뼈대만)
- **왜 1단계만**: 인프라가 실제로 돈다는 걸 손으로 한 번 밟아두지 않으면 이후 단계에서 원인 모를 배포 에러로 하루가 녹음. 첫날은 "배포 파이프라인이 돈다"만 확실히.

### 집에서 (다음 수업 전까지)
- 2단계 완료: 구글 OAuth 끝까지, `profiles` 테이블, 매니저 전용 페이지 접근 제어
- 3단계 시작: `members` 테이블 + 첫 RLS 정책 + 회원 추가 폼 하나

### 3~4주차
- 3단계 마무리 + **4단계 Gemini API 멘트** (이 프로젝트의 "심장"이 여기서 처음 뜀)

### 4주차 이후
- 5·6단계 (엑셀 업로드·지표·주간 리포트)
- 여력 되면 7단계 (구글 드라이브 RAG)

### 범위 경고
원래 구상 전체(회원권 부서 + SNS 마케팅 자동생성 + 멀티 지점)는 실제 SaaS 한 덩어리 규모라 1인 프로젝트로는 수개월~반년. **"PT 트레이너가 회원 1명에 대해 AI 재등록 멘트를 받는다"를 끝까지 완성**하는 게 우선. 이 한 조각이 돌면 나머지는 같은 패턴을 복제해서 붙이는 식으로 확장.
