import { AnalyzeResponse } from "../types";
import { EvalRadarChart } from "./RadarChart";
import { ResultTabs } from "./ResultTabs";

interface Props {
  result: AnalyzeResponse;
  onReset: () => void;
}

const DECISION_CONFIG = {
  PASS: { label: "합격 가능", bg: "#dcfce7", color: "#166534" },
  HOLD: { label: "검토 필요", bg: "#fef9c3", color: "#854d0e" },
  FAIL: { label: "부적합", bg: "#fee2e2", color: "#991b1b" },
};

const RATING_LABEL = { 상: "상", 중: "중", 하: "하" } as const;
const RATING_COLOR = {
  상: { bg: "#dcfce7", color: "#166534" },
  중: { bg: "#fef9c3", color: "#854d0e" },
  하: { bg: "#fee2e2", color: "#991b1b" },
};

export function ResultView({ result, onReset }: Props) {
  const decision = DECISION_CONFIG[result.decision];
  const m = result.evaluation_metrics;

  const axes = [
    { label: "직무 적합도", value: m.job_fit },
    { label: "기술 깊이", value: m.technical_depth },
    { label: "수치 성과", value: m.quantitative_evidence },
    ...(m.cover_letter_bp ? [{ label: "자소서 역량", value: m.cover_letter_bp }] : []),
  ] as { label: string; value: "상" | "중" | "하" }[];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{
            padding: "6px 18px",
            borderRadius: 99,
            fontWeight: 700,
            fontSize: 18,
            background: decision.bg,
            color: decision.color,
          }}>
            {decision.label}
          </span>
          <span style={{ fontSize: 32, fontWeight: 700 }}>{result.overall_score}점</span>
        </div>
        <button
          onClick={onReset}
          style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer", background: "#fff" }}
        >
          다시 분석
        </button>
      </div>

      {/* 요약 */}
      <p style={{ margin: 0, color: "#374151", lineHeight: 1.6, padding: "14px 16px", background: "#f9fafb", borderRadius: 8 }}>
        {result.summary}
      </p>

      {/* 5개 축 배지 */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {axes.map(({ label, value }) => {
          const c = RATING_COLOR[value];
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#f3f4f6", borderRadius: 8 }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span>
              <span style={{ padding: "2px 8px", borderRadius: 99, background: c.bg, color: c.color, fontWeight: 600, fontSize: 13 }}>
                {RATING_LABEL[value]}
              </span>
            </div>
          );
        })}
      </div>

      {/* 레이더 차트 */}
      <EvalRadarChart metrics={result.evaluation_metrics} />

      {/* 탭 */}
      <ResultTabs result={result} />
    </div>
  );
}
