# 🛡️ ResumeGuard: AI-Native Resume Screening & Gap Analysis System

> **"지피지기면 백전백승."**  
> 대기업 및 유망 스타트업 700+ 개 이상이 도입한 기업용 AI 스크리닝 메커니즘을 역이용하여, 지원 전에 내 서류의 빈틈(Gap)을 먼저 진단하고 면접 예상 질문까지 도출해 주는 취업 전략 대시보드 서비스입니다.

---

## 📌 1. Project Background & Problem Definition

- **문제 정의:** 현재 채용 시장에서 기업들은 AI 스크리닝 툴(무하유 프리즘, 원티드 AI 등)을 도입해 서류를 자동 필터링하지만, 지원자는 서류 탈락 시 어떤 부분이 부족했는지 피드백을 받지 못하는 **블랙박스(Black-box)** 상태에 놓여 있습니다.
- **해결 방안:** 기업용 AI와 동일한 메커니즘(`적합/검토필요/부적합` 3단계 분류 및 다면 평가 기준)을 적용한 내 전용 AI 인사담당자 에이전트를 구축합니다. 채용 공고(JD) URL만 넣으면 자격요건, 우대사항을 분석하여 내 이력서와의 **기술적/경험적 공백(Gap)**을 칼날처럼 짚어내고 서류 통과율을 극대화합니다.

---

## 🏗️ 2. Tech Stack & Architecture

### Technology Stack
- **Frontend:** React.js, Tailwind CSS, Recharts (대시보드 시각화)
- **Backend:** Python, FastAPI, Playwright (동적 웹 크롤링), Pydantic
- **AI Orchestration:** LangChain / OpenAI & Gemini API
- **Database:** MySQL, SQLAlchemy (ORM)

### Architecture Flow
1. **Frontend:** 사용자가 채용 공고 URL 및 이력서 텍스트 입력
2. **Scraper (Backend):** Playwright를 활용해 원티드(Wanted) 등의 동적 채용 페이지에서 자격요건/우대사항/주요업무 스크래핑
3. **AI Evaluator (LangChain):** 
   - **Agent 1:** JD 요구사항 구조화 (JSON 변환)
   - **Agent 2:** 근거 중심의 가혹한 HR 인사담당자 페르소나 주입 후 다면 평가 수행
4. **Database:** 분석 요청 이력 및 최종 레포트 데이터 저장 (MySQL)
5. **Frontend Dashboard:** 종합 점수, 3단계 판정 마크, 다면 항목 차트, Gap 리스트 및 면접 질문 시각화

---

## 📑 3. Key Features (MVP)

- [ ] **동적 JD URL 파싱:** 원티드(Wanted) 채용 사이트의 자격요건/우대사항/주요업무 자동 텍스트 스크래핑
- [ ] **3단계 척도 AI 스크리닝:** 실제 평가 기준을 반영한 `적합(PASS) / 검토필요(HOLD) / 부적합(FAIL)` 판정 및 종합 점수 산출
- [ ] **근거 중심 다면 평가:** `직무 적합도`, `기술적 깊이`, `문제 해결 능` 3대 항목별 상/중/하 척도 평가 및 시각화
- [ ] **역량 갭(Gap) 추출:** 서류에 명시적 근거가 부족하여 감점된 기술 스택 및 프로젝트 경험 리스트업
- [ ] **면접 예상 질문 생성:** 서류의 빈틈을 송곳처럼 찌르는 인사담당자 관점의 압박 면접 질문 3가지 자동 도출

---

## 🗂️ 4. Directory Structure

```text
resume-guard/
├── backend/
│   ├── app/
│   │   ├── api/          # API 엔드포인트 라우터 (evaluations, scraper)
│   │   ├── core/         # 보안 설정, DB 연결, LLM 클라이언트 설정
│   │   ├── models/       # SQLAlchemy ORM 모델 (User, Resume, Evaluation)
│   │   ├── schemas/      # Pydantic 입출력 데이터 검증 스펙
│   │   ├── services/     # 핵심 비즈니스 로직 (ScraperService, AIScreeningService)
│   │   └── main.py       # FastAPI 애플리케이션 진입점
│   ├── requirements.txt
│   └── README.md
└── frontend/
    ├── src/
    │   ├── components/   # 공통 UI 컴포넌트 (Chart, Editor, Layout)
    │   ├── pages/        # Dashboard, InputForm 페이지
    │   ├── services/     # API 통신 모듈 (Axios 인터셉터)
    │   └── App.js
    ├── package.json
    └── README.md