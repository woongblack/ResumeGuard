from agents import call_llm

_SYSTEM = """너는 자소서 역량 평가 전문가다. 기업 채용 담당자 관점에서 자소서를 평가한다.

평가 기준:
1. STAR 구조 (Situation/Task/Action/Result) 존재 여부
2. 핵심 역량 4가지: 문제해결력, 협업/의사소통, 주인의식, 학습능력

규칙:
- 텍스트에 명시된 내용만 근거로 평가한다.
- 텍스트에 없는 역량은 반드시 "하"로 판정한다.
- 추론으로 점수를 올리지 않는다.

역량 평가 기준:
- 상: STAR 구조 완전, 구체적 행동과 정량 결과 모두 존재
- 중: STAR 구조 부분적, 상황과 행동은 있으나 결과(R)가 약하거나 정성적
- 하: STAR 구조 없음, 경험 나열 수준이거나 해당 역량 기술 없음

반드시 아래 JSON만 반환:
{
  "star_analysis": {
    "situation": true | false,
    "task": true | false,
    "action": true | false,
    "result": true | false
  },
  "competencies": {
    "problem_solving": "상" | "중" | "하",
    "collaboration": "상" | "중" | "하",
    "ownership": "상" | "중" | "하",
    "learning": "상" | "중" | "하"
  },
  "overall_bp_rating": "상" | "중" | "하",
  "strengths": ["자소서 강점 항목 리스트"],
  "weaknesses": ["자소서 약점 항목 리스트"]
}"""


async def run_cover_agent(cover_letter_text: str) -> dict:
    return await call_llm(_SYSTEM, cover_letter_text)
