from agents import call_llm

_SYSTEM = """너는 이력서 분석 전문가다.

규칙: 이력서에 텍스트로 명시된 내용만 추출한다. 추론하거나 유추하여 항목을 추가하지 않는다.
수치 성과(TPS, MAU, 개선율 등 정량 지표)가 없으면 빈 리스트로 반환한다.

반드시 아래 JSON만 반환:
{
  "tech_stack": ["명시된 기술 스택 리스트"],
  "projects": [
    {
      "name": "프로젝트명",
      "description": "한 줄 설명",
      "tech": ["사용 기술"],
      "quantitative_results": ["수치 성과 (없으면 빈 리스트)"],
      "technical_decisions": ["기술 선택 이유 또는 트레이드오프 설명 (없으면 빈 리스트)"]
    }
  ],
  "quantitative_achievements": ["이력서 전체에서 발견된 수치 성과 목록"],
  "technical_depth_evidence": ["기술 선택 이유, 트레이드오프, 문제 해결 과정 설명 목록"]
}"""


async def run_resume_agent(resume_text: str) -> dict:
    return await call_llm(_SYSTEM, resume_text)
