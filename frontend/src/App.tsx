import { useState } from "react";
import { InputForm } from "./components/InputForm";
import { ResultView } from "./components/ResultView";
import { AnalyzeResponse } from "./types";

export default function App() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "16px 0" }}>
        <div style={container}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>
            ResumeGuard
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>
            기업 AI 스크리닝 기준으로 내 서류를 먼저 검토합니다
          </p>
        </div>
      </header>

      <main style={container}>
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#6b7280" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <p style={{ margin: 0, fontWeight: 500 }}>서류를 분석하는 중입니다...</p>
            <p style={{ margin: "6px 0 0", fontSize: 13 }}>JD · 이력서 · 자소서를 병렬로 분석 중 (최대 30초)</p>
          </div>
        )}

        {!loading && !result && (
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <InputForm onResult={setResult} onLoading={setLoading} />
          </div>
        )}

        {!loading && result && (
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <ResultView result={result} onReset={() => setResult(null)} />
          </div>
        )}
      </main>
    </div>
  );
}

const container: React.CSSProperties = {
  maxWidth: 800,
  margin: "0 auto",
  padding: "24px 20px",
};
