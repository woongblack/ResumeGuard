import { useState, useRef } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { AnalyzeResponse } from "../types";

interface Props {
  onResult: (result: AnalyzeResponse) => void;
  onLoading: (loading: boolean) => void;
}

export function InputForm({ onResult, onLoading }: Props) {
  const [jdUrl, setJdUrl] = useState("");
  const [resumeText, setResumeText, clearResume] = useLocalStorage("rg_resume");
  const [coverText, setCoverText, clearCover] = useLocalStorage("rg_cover");
  const [error, setError] = useState<string | null>(null);

  const resumeRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = async (
    file: File,
    setter: (v: string) => void
  ) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/parse-pdf", { method: "POST", body: form });
    if (!res.ok) throw new Error("PDF 파싱 실패");
    const data = await res.json();
    setter(data.text);
  };

  const handleSubmit = async () => {
    if (!jdUrl.trim()) return setError("JD URL을 입력해주세요.");
    if (!resumeText.trim()) return setError("이력서를 입력해주세요.");
    setError(null);
    onLoading(true);
    try {
      const res = await fetch("/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jd_url: jdUrl,
          resume_text: resumeText,
          cover_letter_text: coverText || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail?.message ?? "분석 중 오류가 발생했습니다.");
      }
      const data: AnalyzeResponse = await res.json();
      onResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      onLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <label style={labelStyle}>채용공고 URL</label>
        <input
          style={inputStyle}
          placeholder="https://www.wanted.co.kr/wd/..."
          value={jdUrl}
          onChange={(e) => setJdUrl(e.target.value)}
        />
      </div>

      <div>
        <label style={labelStyle}>
          이력서
          <span style={savedBadge(!!resumeText)}>
            {resumeText ? "저장됨" : "미입력"}
          </span>
        </label>
        <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
          <button style={btnStyle} onClick={() => resumeRef.current?.click()}>
            PDF 업로드
          </button>
          {resumeText && (
            <button style={{ ...btnStyle, background: "#fee2e2", color: "#991b1b" }} onClick={clearResume}>
              초기화
            </button>
          )}
        </div>
        <input
          ref={resumeRef}
          type="file"
          accept=".pdf"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              try {
                await handlePdfUpload(file, setResumeText);
              } catch {
                setError("PDF 파싱에 실패했습니다. 텍스트를 직접 붙여넣어 주세요.");
              }
            }
          }}
        />
        <textarea
          style={textareaStyle}
          placeholder="이력서 텍스트를 붙여넣거나 PDF를 업로드하세요."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        />
      </div>

      <div>
        <label style={labelStyle}>
          자소서 <span style={{ color: "#9ca3af", fontSize: 13 }}>(선택)</span>
          <span style={savedBadge(!!coverText)}>
            {coverText ? "저장됨" : "미입력"}
          </span>
        </label>
        <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
          <button style={btnStyle} onClick={() => coverRef.current?.click()}>
            PDF 업로드
          </button>
          {coverText && (
            <button style={{ ...btnStyle, background: "#fee2e2", color: "#991b1b" }} onClick={clearCover}>
              초기화
            </button>
          )}
        </div>
        <input
          ref={coverRef}
          type="file"
          accept=".pdf"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              try {
                await handlePdfUpload(file, setCoverText);
              } catch {
                setError("PDF 파싱에 실패했습니다. 텍스트를 직접 붙여넣어 주세요.");
              }
            }
          }}
        />
        <textarea
          style={textareaStyle}
          placeholder="자소서 텍스트를 붙여넣거나 PDF를 업로드하세요."
          value={coverText}
          onChange={(e) => setCoverText(e.target.value)}
        />
      </div>

      {error && <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>}

      <button style={submitStyle} onClick={handleSubmit}>
        서류 분석하기
      </button>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 600,
  marginBottom: 6,
};

const savedBadge = (saved: boolean): React.CSSProperties => ({
  fontSize: 11,
  padding: "2px 7px",
  borderRadius: 99,
  background: saved ? "#dcfce7" : "#f3f4f6",
  color: saved ? "#166534" : "#6b7280",
});

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 14,
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  height: 140,
  resize: "vertical",
  fontFamily: "inherit",
};

const btnStyle: React.CSSProperties = {
  padding: "6px 14px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  background: "#f9fafb",
  cursor: "pointer",
  fontSize: 13,
};

const submitStyle: React.CSSProperties = {
  padding: "12px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};
