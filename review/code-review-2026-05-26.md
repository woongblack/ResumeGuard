# ResumeGuard 코드 리뷰

**날짜:** 2026-05-26  
**대상:** PRD v5.0 기준 1차 구현  
**검토 범위:** 백엔드 (FastAPI) + 프론트엔드 (React + TypeScript)

---

## 전체 평가

PRD v5.0 요구사항을 잘 반영했다. 아키텍처 흐름(4-에이전트 파이프라인), asyncio 병렬 실행, 할루시네이션 방지 규칙, localStorage 기반 입력 저장 등 핵심 요소가 모두 구현되어 있다. 아래는 심각도별 이슈 목록이다.

---

## Critical — 기능을 깨트리는 버그

### 1. `call_llm` JSON 파싱 에러 미처리

**위치:** `backend/agents/__init__.py:17`

LLM이 JSON이 아닌 텍스트를 반환하면 `json.loads()`에서 uncaught exception이 발생한다. `response_format={"type": "json_object"}`는 Gemini에서 항상 보장되지 않는다. 오류 발생 시 500 + 빈 응답이 클라이언트에 내려간다.

```python
# 현재
return json.loads(response.choices[0].message.content)

# 권장
content = response.choices[0].message.content
try:
    return json.loads(content)
except json.JSONDecodeError:
    raise LLMParseError("LLM이 유효한 JSON을 반환하지 않았습니다.")
```

추가로, `acompletion()` 호출에 `timeout` 파라미터가 없어 LLM 응답이 지연될 경우 요청이 무기한 대기한다. PRD에 `LLM_TIMEOUT` 에러 코드가 정의되어 있지만 실제로 발생하지 않는다.

---

## Medium — UX를 깨트리는 버그

### 2. 레이더 차트 — null 축을 0으로 렌더링

**위치:** `frontend/src/components/RadarChart.tsx:27-35`

자소서 미입력 시 `cover_letter_bp`와 `ai_detection_suspicion`이 null인데, 차트는 이를 0점("하")으로 그린다. "해당 없음"인 항목이 최저점처럼 시각화된다.

```tsx
// 현재: null → 0으로 처리
score: metrics.cover_letter_bp ? ratingToScore(metrics.cover_letter_bp) : 0,

// 권장: null 항목은 data 배열에서 제외
const data = [
  { axis: "직무 적합도", score: ratingToScore(metrics.job_fit) },
  { axis: "기술 깊이", score: ratingToScore(metrics.technical_depth) },
  { axis: "수치 성과", score: ratingToScore(metrics.quantitative_evidence) },
  ...(metrics.cover_letter_bp
    ? [{ axis: "자소서 역량", score: ratingToScore(metrics.cover_letter_bp) }]
    : []),
  ...(metrics.ai_detection_suspicion
    ? [{ axis: "AI 탐지 (낮을수록 좋음)", score: ratingToScore(metrics.ai_detection_suspicion) }]
    : []),
];
```

### 3. PDF 업로드 에러 silent failure

**위치:** `frontend/src/components/InputForm.tsx:93-96`

`handlePdfUpload`가 throw하면 `onChange` 내부에서 잡히지 않아 사용자에게 아무 피드백 없이 실패한다.

```tsx
// 현재
onChange={async (e) => {
  const file = e.target.files?.[0];
  if (file) await handlePdfUpload(file, setResumeText);
}}

// 권장
onChange={async (e) => {
  const file = e.target.files?.[0];
  if (file) {
    try {
      await handlePdfUpload(file, setResumeText);
    } catch {
      setError("PDF 파싱에 실패했습니다. 텍스트를 직접 붙여넣어 주세요.");
    }
  }
}}
```

커버 레터 PDF 업로드(`InputForm.tsx:128-131`)도 동일한 문제가 있다.

### 4. `resume_text` 빈 문자열 검증 없음

**위치:** `backend/schemas.py:6`, `backend/main.py`

`resume_text: str`은 빈 문자열을 허용한다. PRD에 `RESUME_EMPTY` 에러 코드가 정의되어 있지만 실제로 발생하지 않는다.

```python
# main.py /analyze 핸들러 상단에 추가
if not req.resume_text.strip():
    raise HTTPException(status_code=422, detail={
        "error_code": "RESUME_EMPTY",
        "message": "이력서를 입력해주세요.",
    })
```

---

## Low — PRD 정합성 & 개선사항

### 5. Synthesis agent 점수 ↔ 판정 일관성 미보장

**위치:** `backend/agents/synthesis_agent.py`

LLM이 점수 71을 내면서 HOLD를 반환하는 등 일관성을 어길 수 있다. 서버에서 score 값 기준으로 decision을 덮어쓰거나, 최소한 일관성 검증을 추가하는 것이 안전하다.

```python
# run_synthesis_agent 반환 후 검증 예시
score = synthesis["overall_score"]
if score >= 70 and synthesis["decision"] != "PASS":
    synthesis["decision"] = "PASS"
elif score >= 40 and synthesis["decision"] == "FAIL":
    synthesis["decision"] = "HOLD"
elif score < 40 and synthesis["decision"] == "PASS":
    synthesis["decision"] = "HOLD"
```

### 6. `JD_PARSE_FAILED` 에러 코드 미구현

**위치:** `backend/main.py:49`

```python
jd_result = results[0] if not isinstance(results[0], Exception) else {}
```

Agent 1 실패 시 빈 dict `{}`로 조용히 폴백하여 클라이언트에 아무 안내가 없다. PRD에 정의된 `JD_PARSE_FAILED` 에러가 발생하지 않는다. Agent 1 결과가 비어 있으면 명시적 에러를 내리는 것이 좋다.

### 7. 레이더 차트 축 레이블 `\n` 미작동

**위치:** `frontend/src/components/RadarChart.tsx:31`

```tsx
axis: "AI 탐지\n(낮을수록 좋음)",
```

Recharts `PolarAngleAxis`의 기본 tick은 줄바꿈을 렌더링하지 않는다. `customTick` 컴포넌트를 쓰거나 레이블을 단순화해야 한다.

---

## 이슈 요약

| 심각도 | 항목 | 위치 |
|--------|------|------|
| Critical | `call_llm` JSON 파싱 에러 미처리 + timeout 없음 | `agents/__init__.py:17` |
| Medium | 레이더 차트 null 축을 0으로 오표시 | `RadarChart.tsx:27-35` |
| Medium | PDF 업로드 에러 silent failure (이력서/자소서 공통) | `InputForm.tsx:93-96, 128-131` |
| Medium | `resume_text` 빈 문자열 허용, `RESUME_EMPTY` 미발생 | `schemas.py:6`, `main.py` |
| Low | Synthesis score ↔ decision 일관성 미보장 | `synthesis_agent.py` |
| Low | `JD_PARSE_FAILED` 에러 코드 미구현, Agent 1 실패 silent 폴백 | `main.py:49` |
| Low | 레이더 차트 축 레이블 `\n` 미작동 | `RadarChart.tsx:31` |
