export interface EvaluationMetrics {
  job_fit: "상" | "중" | "하";
  technical_depth: "상" | "중" | "하";
  quantitative_evidence: "상" | "중" | "하";
  cover_letter_bp: "상" | "중" | "하" | null;
  ai_detection_suspicion: "낮음" | "보통" | "높음" | null;
}

export interface AIDetectionResult {
  score: number;
  label: string;
  note: string;
}

export interface AnalyzeResponse {
  decision: "PASS" | "HOLD" | "FAIL";
  overall_score: number;
  evaluation_metrics: EvaluationMetrics;
  ai_detection: AIDetectionResult | null;
  summary: string;
  strengths: string[];
  gaps: string[];
  expected_interview_questions: string[];
}
