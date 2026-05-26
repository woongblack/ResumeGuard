import os
import httpx
from agents import call_llm

GPTZERO_API_KEY = os.getenv("GPTZERO_API_KEY", "")

_FALLBACK_PROMPT = """다음 텍스트가 AI(ChatGPT, Claude 등)에 의해 생성되었을 가능성을 분석하라.

판단 기준:
- 지나치게 균일한 문장 길이와 리듬
- 구체적 경험 묘사 없이 추상적 표현만 반복
- 개인적 실패나 갈등 경험 부재
- 지원자 개인의 고유한 어휘나 표현 부재

반드시 아래 JSON만 반환:
{
  "score": 0~100 사이 정수 (높을수록 AI 생성 의심),
  "label": "낮음" | "보통" | "높음",
  "note": "한 줄 판정 근거"
}"""


async def detect_ai(text: str) -> dict:
    if GPTZERO_API_KEY:
        result = await _gptzero(text)
        if result:
            return result
    return await _llm_fallback(text)


async def _gptzero(text: str) -> dict | None:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                "https://api.gptzero.me/v2/predict/text",
                headers={"x-api-key": GPTZERO_API_KEY, "Content-Type": "application/json"},
                json={"document": text},
            )
            response.raise_for_status()
            data = response.json()
            prob = data.get("documents", [{}])[0].get("completely_generated_prob", 0)
            score = int(prob * 100)
            label = "높음" if score >= 70 else "보통" if score >= 40 else "낮음"
            return {
                "score": score,
                "label": label,
                "note": f"GPTZero 분석 결과. AI 생성 확률 {score}%. 오탐 가능성이 있으므로 참고 수준으로 활용하세요.",
            }
    except Exception:
        return None


async def _llm_fallback(text: str) -> dict:
    try:
        result = await call_llm(_FALLBACK_PROMPT, text)
        return {
            "score": int(result.get("score", 0)),
            "label": result.get("label", "낮음"),
            "note": result.get("note", "") + " (LLM 기반 추정, 참고 수준)",
        }
    except Exception:
        return {"score": 0, "label": "알 수 없음", "note": "AI 탐지 분석에 실패했습니다."}
