import os
import json
import asyncio
from litellm import acompletion

MODEL = os.getenv("LLM_MODEL", "gemini/gemini-2.5-flash")
_MAX_RETRIES = 5
_RETRY_DELAY = 8  # seconds — 503 과부하 응답에는 더 긴 대기 필요
_semaphore = asyncio.Semaphore(2)  # Gemini free tier: 동시 요청 2개로 제한


class LLMParseError(Exception):
    pass


async def call_llm(system_prompt: str, user_content: str) -> dict:
    last_error = None
    for attempt in range(_MAX_RETRIES):
        try:
            async with _semaphore:
                response = await acompletion(
                    model=MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_content},
                    ],
                    response_format={"type": "json_object"},
                    timeout=30,
                )
            content = response.choices[0].message.content
            try:
                return json.loads(content)
            except json.JSONDecodeError as e:
                raise LLMParseError("LLM이 유효한 JSON을 반환하지 않았습니다.") from e
        except LLMParseError:
            raise
        except Exception as e:
            last_error = e
            print(f"[call_llm] attempt {attempt+1}/{_MAX_RETRIES} failed: {type(e).__name__}: {e}", flush=True)
            if attempt < _MAX_RETRIES - 1:
                await asyncio.sleep(_RETRY_DELAY * (attempt + 1))
    raise last_error
