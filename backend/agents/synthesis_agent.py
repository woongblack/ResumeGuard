import json
from agents import call_llm

_SYSTEM = """너는 채용 서류 종합 평가 전문가다. 기업 AI 스크리닝 시스템 관점에서 최종 판정을 내린다.

절대 규칙:
- 서류에 텍스트로 명시되지 않은 기술, 경험, 수치, 역량은 존재하지 않는 것으로 간주한다.
- 추론이나 유추로 점수를 부여하지 않는다.
- 면접 질문은 이 서류의 구체적인 빈틈을 겨냥한 압박 질문이어야 한다. 일반적인 질문 금지.

판정 기준:
- PASS (70점 이상): JD 자격요건 대부분 충족, 기술 깊이 또는 수치 성과 존재
- HOLD (40~69점): 일부 충족하나 핵심 항목 빈틈 존재
- FAIL (39점 이하): JD 자격요건 미달 또는 핵심 정보 현저히 부족

점수 산정 가중치:
- 직무 적합도 (Job Fit): 35%
- 기술 깊이 (Technical Depth): 25%
- 수치 성과 (Quantitative Evidence): 20%
- 자소서 역량 (Cover Letter BP): 20% (자소서 없으면 이력서 항목으로 재배분)

상/중/하 → 점수 변환: 상=100, 중=50, 하=0

반드시 아래 JSON만 반환:
{
  "decision": "PASS" | "HOLD" | "FAIL",
  "overall_score": 0~100 정수,
  "evaluation_metrics": {
    "job_fit": "상" | "중" | "하",
    "technical_depth": "상" | "중" | "하",
    "quantitative_evidence": "상" | "중" | "하",
    "cover_letter_bp": "상" | "중" | "하" | null,
    "ai_detection_suspicion": "낮음" | "보통" | "높음" | null
  },
  "summary": "2~3문장 종합 평가. 핵심 강점과 핵심 약점 명시.",
  "strengths": ["강점 항목 리스트 (최대 3개)"],
  "gaps": ["갭 항목 리스트 (최대 5개, 구체적으로)"],
  "expected_interview_questions": ["압박 질문 3개 (이 서류의 빈틈을 겨냥)"]
}"""


async def run_synthesis_agent(
    jd_result: dict,
    resume_result: dict,
    cover_result: dict | None,
    ai_detection: dict | None,
) -> dict:
    context = {
        "jd_analysis": jd_result,
        "resume_analysis": resume_result,
        "cover_letter_bp": cover_result,
        "ai_detection_score": ai_detection,
    }
    result = await call_llm(_SYSTEM, json.dumps(context, ensure_ascii=False))

    score = result.get("overall_score", 0)
    if score >= 70:
        result["decision"] = "PASS"
    elif score >= 40:
        result["decision"] = "HOLD"
    else:
        result["decision"] = "FAIL"

    return result
