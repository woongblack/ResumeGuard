import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { EvaluationMetrics } from "../types";

const ratingToScore = (r: "상" | "중" | "하" | "낮음" | "보통" | "높음" | null | undefined) => {
  if (r === "상" || r === "낮음") return 100;
  if (r === "중" || r === "보통") return 50;
  if (r === "하" || r === "높음") return 0;
  return 0;
};

interface Props {
  metrics: EvaluationMetrics;
}

export function EvalRadarChart({ metrics }: Props) {
  const data = [
    { axis: "직무 적합도", score: ratingToScore(metrics.job_fit) },
    { axis: "기술 깊이", score: ratingToScore(metrics.technical_depth) },
    { axis: "수치 성과", score: ratingToScore(metrics.quantitative_evidence) },
    ...(metrics.cover_letter_bp
      ? [{ axis: "자소서 역량", score: ratingToScore(metrics.cover_letter_bp) }]
      : []),
    ...(metrics.ai_detection_suspicion
      ? [{ axis: "AI 탐지", score: ratingToScore(metrics.ai_detection_suspicion) }]
      : []),
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12 }} />
        <Radar
          dataKey="score"
          stroke="#2563eb"
          fill="#2563eb"
          fillOpacity={0.25}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
