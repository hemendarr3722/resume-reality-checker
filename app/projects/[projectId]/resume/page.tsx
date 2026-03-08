"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddResume({ params }: { params: { projectId: string }}) {
  const router = useRouter();
  const [mode, setMode] = useState<"paste" | "upload">("paste");
  const [resumeText, setResumeText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    let res: Response;
    if (mode === "paste") {
      res = await fetch(`/api/projects/${params.projectId}/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
    } else {
      if (!file) { setLoading(false); setErr("Choose a PDF or DOCX file"); return; }
      const form = new FormData();
      form.append("file", file);
      res = await fetch(`/api/projects/${params.projectId}/resume`, { method: "POST", body: form });
    }

    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(()=>({}));
      setErr(j.error || "Failed");
      return;
    }
    const j = await res.json();
    router.push(`/projects/${params.projectId}/versions/${j.resumeVersionId}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-card p-8 space-y-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Add resume version</h1>
          <p className="mt-1 text-sm text-slate-400">Paste text or upload a PDF/DOCX. A new version will be created automatically.</p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2">
          <button type="button" onClick={()=>setMode("paste")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    mode === "paste"
                      ? "text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                  style={mode === "paste" ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)" } : { border: "1px solid rgba(99, 102, 241, 0.15)" }}>
            📝 Paste text
          </button>
          <button type="button" onClick={()=>setMode("upload")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    mode === "upload"
                      ? "text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                  style={mode === "upload" ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)" } : { border: "1px solid rgba(99, 102, 241, 0.15)" }}>
            📎 Upload file
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "paste" ? (
            <textarea className="input-field min-h-[300px] resize-y" placeholder="Paste your resume text here..." value={resumeText} onChange={(e)=>setResumeText(e.target.value)} />
          ) : (
            <div className="rounded-xl p-8 text-center transition-all cursor-pointer"
                 style={{ border: "2px dashed rgba(99, 102, 241, 0.2)", background: "rgba(99, 102, 241, 0.03)" }}>
              <div className="text-3xl mb-2">📁</div>
              <p className="text-sm text-slate-400 mb-3">
                {file ? file.name : "Drag & drop or click to select"}
              </p>
              <input className="w-full opacity-0 absolute inset-0 cursor-pointer" type="file" accept=".pdf,.docx" onChange={(e)=>setFile(e.target.files?.[0] || null)} style={{ position: "relative", opacity: 1, fontSize: "0.875rem", color: "#94a3b8" }} />
              <p className="text-xs text-slate-500 mt-2">PDF or DOCX, max 5MB</p>
            </div>
          )}

          {err && (
            <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              ⚠️ {err}
            </div>
          )}
          <button disabled={loading} className="btn-primary py-3 px-6">
            {loading ? "Saving..." : "Create version →"}
          </button>
        </form>
      </div>
    </div>
  );
}
