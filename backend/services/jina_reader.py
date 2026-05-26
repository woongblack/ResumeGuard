import httpx


class JDFetchError(Exception):
    pass


async def fetch_jd(url: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(f"https://r.jina.ai/{url}")
            response.raise_for_status()
            return response.text
    except httpx.HTTPStatusError as e:
        raise JDFetchError(f"HTTP {e.response.status_code}") from e
    except httpx.RequestError as e:
        raise JDFetchError(str(e)) from e
