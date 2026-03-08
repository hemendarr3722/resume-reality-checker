"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ScoreCard } from "@/components/ScoreBars";

type Analysis = {
  id: string;
  scoreOverall: number;
  atsScore: number;
  keywordCoverage: number;
  missingKeywords: string[];
  strengths: string[];
  redFlags: string[];
  suggestedFixes: { section: string; issue: string; fix: string; exampleRewrite?: string }[];
  summary: string;
  createdAt: string;
};

export default function VersionPage({ params }: { params: { projectId: string; versionId: string }}) {
  const [resumeText, setResumeText] = useState("");
  const [versionNumber, setVersionNumber] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/projects/${params.projectId}/versions/${params.versionId}`);
      if (res.ok) {
        const j = await res.json();
        setResumeText(j.resumeText || "");
        setVersionNumber(j.versionNumber);
        setAnalysis(j.latestAnalysis || null);
      }
    })();
  }, [params.projectId, params.versionId]);

  async function runAnalysis() {
    setLoading(true);
    setErr(null);
    const res = await fetch(`/api/projects/${params.projectId}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeVersionId: params.versionId }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(()=>({}));
      setErr(j.error || "Analysis failed");
      return;
    }
    const r2 = await fetch(`/api/projects/${params.projectId}/versions/${params.versionId}`);
    const j2 = await r2.json();
    setAnalysis(j2.latestAnalysis || null);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <Link href={`/projects/${params.projectId}`} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">← Back to project</Link>
        <h1 className="text-3xl font-bold text-white mt-2">
          Resume version {versionNumber ? `v${versionNumber}` : ""}
        </h1>
        <div className="mt-4 flex gap-3">
          <button onClick={runAnalysis} disabled={loading} className="btn-primary text-sm py-2 px-5">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Analyzing...
              </span>
            ) : "🤖 Run AI analysis"}
          </button>
        </div>
        {err && (
          <div className="mt-3 flex items-center gap-2 text-sm px-3 py-2 rounded-lg max-w-md" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            ⚠️ {err}
          </div>
        )}
      </div>

      {/* Analysis results */}
      {analysis && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Score cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <ScoreCard label="Overall" value={analysis.scoreOverall} icon="🎯" />
            <ScoreCard label="ATS Score" value={analysis.atsScore} icon="📋" />
            <ScoreCard label="Keywords" value={analysis.keywordCoverage} icon="🔑" />
          </div>

          {/* Summary */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-3">📝 Summary</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Three columns */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2 mb-3">
                <span style={{ color: "#ef4444" }}>🚫</span> Missing keywords
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingKeywords?.slice(0, 15).map((k) => (
                  <span key={k} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
                        style={{ background: "rgba(239, 68, 68, 0.1)", color: "#fca5a5", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
                    {k}
                  </span>
                ))}
                {(!analysis.missingKeywords || analysis.missingKeywords.length === 0) &&
                  <span className="text-xs text-slate-500">None — great job!</span>
                }
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2 mb-3">
                <span style={{ color: "#10b981" }}>✅</span> Strengths
              </h3>
              <ul className="space-y-1.5">
                {analysis.strengths?.slice(0, 10).map((k, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#10b981" }} />
                    {k}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-5">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2 mb-3">
                <span style={{ color: "#f59e0b" }}>⚠️</span> Red flags
              </h3>
              <ul className="space-y-1.5">
                {analysis.redFlags?.slice(0, 10).map((k, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#f59e0b" }} />
                    {k}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggested fixes */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-4">🔧 Suggested fixes</h3>
            <div className="space-y-3">
              {analysis.suggestedFixes?.slice(0, 8).map((f, idx) => (
                <div key={idx} className="rounded-lg p-4 transition-all hover:bg-white/5"
                     style={{ border: "1px solid rgba(99, 102, 241, 0.1)" }}>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{f.section}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{f.issue}</div>
                      <div className="mt-2 text-sm text-slate-300">{f.fix}</div>
                      {f.exampleRewrite && (
                        <div className="mt-2 rounded-md p-3 text-xs font-mono text-slate-300"
                             style={{ background: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.1)" }}>
                          {f.exampleRewrite}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resume text */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">📄 Resume text</h3>
        <pre className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-sans">{resumeText}</pre>
      </div>
    </div>
  );
}
