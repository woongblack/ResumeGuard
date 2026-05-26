from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    jd_url: str
    resume_text: str
    cover_letter_text: str | None = None


class EvaluationMetrics(BaseModel):
    job_fit: str
    technical_depth: str
    quantitative_evidence: str
    cover_letter_bp: str | None = None
    ai_detection_suspicion: str | None = None


class AIDetectionResult(BaseModel):
    score: int
    label: str
    note: str


class AnalyzeResponse(BaseModel):
    decision: str
    overall_score: int
    evaluation_metrics: EvaluationMetrics
    ai_detection: AIDetectionResult | None = None
    summary: str
    strengths: list[str]
    gaps: list[str]
    expected_interview_questions: list[str]


class ParsePDFResponse(BaseModel):
    text: str


class ErrorResponse(BaseModel):
    error_code: str
    message: str
    suggestion: str | None = None
