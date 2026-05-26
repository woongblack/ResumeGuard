import { useState } from "react";
import { AnalyzeResponse } from "../types";

interface Props {
  result: AnalyzeResponse;
}

const TABS = ["강점", "갭", "면접 질문", "AI 탐지"] as const;

export function ResultTabs({ result }: Props) {
  const [active, setActive] = useState<(typeof TABS)[number]>("강점");

  return (
    <div>
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #e5e7eb", marginBottom: 16 }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            style={{
              padding: "8px 16px",
              border: "none",
              borderBottom: active === tab ? "2px solid #2563eb" : "2px solid transparent",
              background: "none",
              cursor: "pointer",
              fontWeight: active === tab ? 600 : 400,
              color: active === tab ? "#2563eb" : "#6b7280",
              fontSize: 14,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {active === "강점" && (
        <ul style={listStyle}>
          {result.strengths.map((s, i) => (
            <li key={i} style={{ ...itemStyle, borderLeft: "3px solid #22c55e" }}>
              {s}
            </li>
          ))}
        </ul>
      )}

      {active === "갭" && (
        <ul style={listStyle}>
          {result.gaps.map((g, i) => (
            <li key={i} style={{ ...itemStyle, borderLeft: "3px solid #ef4444" }}>
              {g}
            </li>
          ))}
        </ul>
      )}

      {active === "면접 질문" && (
        <ol style={listStyle}>
          {result.expected_interview_questions.map((q, i) => (
            <li key={i} style={{ ...itemStyle, borderLeft: "3px solid #f59e0b" }}>
              {q}
            </li>
          ))}
        </ol>
      )}

      {active === "AI 탐지" && (
        <div>
          {result.ai_detection ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 32, fontWeight: 700 }}>
                  {result.ai_detection.score}
                </span>
                <span style={{
                  padding: "4px 12px",
                  borderRadius: 99,
                  fontWeight: 600,
                  fontSize: 14,
                  background: result.ai_detection.label === "높음" ? "#fee2e2" :
                    result.ai_detection.label === "보통" ? "#fef9c3" : "#dcfce7",
                  color: result.ai_detection.label === "높음" ? "#991b1b" :
                    result.ai_detection.label === "보통" ? "#854d0e" : "#166534",
                }}>
                  {result.ai_detection.label}
                </span>
              </div>
              <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
                {result.ai_detection.note}
              </p>
            </div>
          ) : (
            <p style={{ color: "#9ca3af" }}>자소서를 입력하면 AI 생성 탐지 결과가 표시됩니다.</p>
          )}
        </div>
      )}
    </div>
  );
}

const listStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const itemStyle: React.CSSProperties = {
  padding: "10px 14px",
  background: "#f9fafb",
  borderRadius: "0 6px 6px 0",
  fontSize: 14,
  lineHeight: 1.5,
};
