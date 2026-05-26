import asyncio
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import AnalyzeRequest, AnalyzeResponse, ParsePDFResponse
from agents import LLMParseError
from agents.jd_agent import run_jd_agent
from agents.resume_agent import run_resume_agent
from agents.cover_letter_agent import run_cover_agent
from agents.synthesis_agent import run_synthesis_agent
from services.jina_reader import fetch_jd, JDFetchError
from services.pdf_parser import extract_text, PDFParseError
from services.ai_detector import detect_ai

app = FastAPI(title="ResumeGuard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    if not req.resume_text.strip():
        raise HTTPException(
            status_code=422,
            detail={"error_code": "RESUME_EMPTY", "message": "이력서를 입력해주세요."},
        )

    try:
        jd_text = await fetch_jd(req.jd_url)
    except JDFetchError:
        raise HTTPException(
            status_code=422,
            detail={
                "error_code": "JD_FETCH_FAILED",
                "message": "채용공고를 불러올 수 없습니다. 공고가 마감되었거나 접근이 차단되었을 수 있습니다.",
                "suggestion": "JD 내용을 직접 텍스트로 붙여넣어 주세요.",
            },
        )

    tasks: list = [
        asyncio.create_task(run_jd_agent(jd_text)),
        asyncio.create_task(run_resume_agent(req.resume_text)),
    ]
    has_cover = bool(req.cover_letter_text)
    if has_cover:
        tasks.append(asyncio.create_task(run_cover_agent(req.cover_letter_text)))
        tasks.append(asyncio.create_task(detect_ai(req.cover_letter_text)))

    results = await asyncio.gather(*tasks, return_exceptions=True)

    jd_result = results[0]
    if isinstance(jd_result, Exception) or not jd_result.get("requirements"):
        raise HTTPException(
            status_code=422,
            detail={
                "error_code": "JD_PARSE_FAILED",
                "message": "채용공고에서 자격요건을 추출하지 못했습니다.",
                "suggestion": "JD 내용을 직접 텍스트로 붙여넣어 주세요.",
            },
        )

    resume_result = results[1] if not isinstance(results[1], Exception) else {}
    cover_result = results[2] if has_cover and not isinstance(results[2], Exception) else None
    ai_detection = results[3] if has_cover and not isinstance(results[3], Exception) else None

    try:
        synthesis = await run_synthesis_agent(jd_result, resume_result, cover_result, ai_detection)
    except (LLMParseError, Exception):
        raise HTTPException(
            status_code=503,
            detail={"error_code": "LLM_TIMEOUT", "message": "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."},
        )

    metrics = synthesis.get("evaluation_metrics", {})
    if ai_detection:
        metrics["ai_detection_suspicion"] = ai_detection.get("label")

    return AnalyzeResponse(
        decision=synthesis["decision"],
        overall_score=synthesis["overall_score"],
        evaluation_metrics=metrics,
        ai_detection=ai_detection,
        summary=synthesis["summary"],
        strengths=synthesis.get("strengths", []),
        gaps=synthesis.get("gaps", []),
        expected_interview_questions=synthesis.get("expected_interview_questions", []),
    )


@app.post("/parse-pdf", response_model=ParsePDFResponse)
async def parse_pdf(file: UploadFile):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="PDF 파일만 업로드 가능합니다.")
    try:
        contents = await file.read()
        text = extract_text(contents)
        return ParsePDFResponse(text=text)
    except PDFParseError as e:
        raise HTTPException(status_code=422, detail=str(e))
