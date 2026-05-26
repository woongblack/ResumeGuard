import os
import json
import asyncio
from litellm import acompletion

MODEL = os.getenv("LLM_MODEL", "gemini/gemini-2.5-flash")
_MAX_RETRIES = 3
_RETRY_DELAY = 5  # seconds


class LLMParseError(Exception):
    pass


async def call_llm(system_prompt: str, user_content: str) -> dict:
    last_error = None
    for attempt in range(_MAX_RETRIES):
        try:
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
            if attempt < _MAX_RETRIES - 1:
                await asyncio.sleep(_RETRY_DELAY * (attempt + 1))
    raise last_error
