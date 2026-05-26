# ResumeGuard

> 기업 AI 스크리닝 기준으로 내 서류를 먼저 검토하는 도구.

채용공고 URL + 이력서 + 자소서를 넣으면 4개 에이전트가 병렬 분석 후 PASS/HOLD/FAIL 판정, 5개 축 점수, 갭 리스트, 면접 압박 질문을 반환한다.

---

## 배경

원티드 스타트업 지원 서류 통과율 0%. 탈락 피드백 없음. 무하유 프리즘 같은 기업용 AI 스크리닝 도구는 지원자가 직접 쓸 수 없음. 본인이 1번 사용자.

---

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| Backend | Python 3.12 + FastAPI |
| JD 파싱 | Jina Reader API |
| PDF 파싱 | pypdf |
| LLM 추상화 | LiteLLM |
| 기본 모델 | Gemini 2.5 Flash (무료 플랜) |
| AI 생성 탐지 | GPTZero API + LLM fallback |
| 에이전트 실행 | asyncio (병렬) |
| Frontend | React 18 + TypeScript + Vite |
| 시각화 | Recharts |
| 입력 저장 | 브라우저 localStorage |

---

## 아키텍처

```
사용자 입력
 ├─ JD URL ──────────→ Jina Reader → [Agent 1: JD 구조화]      ─┐
 ├─ 이력서 PDF/텍스트 →              [Agent 2: 이력서 분석]      ├→ [Agent 4: 종합 판정]
 └─ 자소서 PDF/텍스트 →              [Agent 3: 자소서 BP 평가]  ─┘
                                     + AI 생성 탐지 (병렬)
```

Agent 1·2·3 + AI 탐지는 `asyncio.gather`로 병렬 실행.

---

## 평가 항목

| 항목 | 근거 서류 |
|------|---------|
| 직무 적합도 (Job Fit) | 이력서 |
| 기술 깊이 (Technical Depth) | 이력서 |
| 수치 성과 (Quantitative Evidence) | 이력서 |
| 자소서 역량 (Cover Letter BP) | 자소서 |
| AI 생성 의심도 (AI Detection) | 자소서 |

---

## 디렉토리 구조

```
ResumeGuard/
├── backend/
│   ├── main.py                   # FastAPI 앱 (POST /analyze, POST /parse-pdf)
│   ├── schemas.py                # Pydantic 요청/응답 모델
│   ├── requirements.txt
│   ├── .env.example
│   ├── agents/
│   │   ├── __init__.py           # call_llm 공통 헬퍼 (LiteLLM)
│   │   ├── jd_agent.py
│   │   ├── resume_agent.py
│   │   ├── cover_letter_agent.py
│   │   └── synthesis_agent.py
│   └── services/
│       ├── jina_reader.py
│       ├── pdf_parser.py
│       └── ai_detector.py
└── frontend/
    └── src/
        ├── App.tsx
        ├── components/
        │   ├── InputForm.tsx
        │   ├── ResultView.tsx
        │   ├── RadarChart.tsx
        │   └── ResultTabs.tsx
        ├── hooks/useLocalStorage.ts
        └── types/index.ts
```

---

## 실행 방법

### 백엔드

```bash
cd backend
cp .env.example .env       # GEMINI_API_KEY 입력
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs (Swagger)
```

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 환경변수 (.env)

```bash
LLM_MODEL=gemini/gemini-2.5-flash
GEMINI_API_KEY=your_key_here
GPTZERO_API_KEY=your_key_here   # 없으면 LLM fallback 자동
```

---

## 지원 플랫폼 (JD URL)

원티드, 사람인, 점핏 — Jina Reader 실측 동작 확인 완료.

---

## Phase 1 성공 기준

| 지표 | 통과 기준 |
|------|---------|
| JD 파싱 정확도 | 3개 플랫폼 총 20개 공고 수동 검수, 90% 이상 |
| 평가 일관성 | 동일 서류 3회 반복, 점수 편차 ±5점 이내 |
| 자기 유용성 | 실제 지원 공고 5개 사용 후 본인 판단 |
