"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditJD({ params }: { params: { projectId: string }}) {
  const router = useRouter();
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/projects/${params.projectId}/get`);
      if (res.ok) {
        const j = await res.json();
        setJdText(j.jdText || "");
      }
    })();
  }, [params.projectId]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const res = await fetch(`/api/projects/${params.projectId}/jd`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jdText }),
    });
    setLoading(false);
    if (!res.ok) { setErr("Failed to save"); return; }
    router.push(`/projects/${params.projectId}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-card p-8 space-y-6 animate-fade-in-up">
        <div>
          <Link href={`/projects/${params.projectId}`} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">← Back to project</Link>
          <h1 className="text-2xl font-bold text-white mt-2">Edit job description</h1>
          <p className="mt-1 text-sm text-slate-400">Update the job description to re-analyze your resume against it.</p>
        </div>
        <form onSubmit={save} className="space-y-4">
          <textarea className="input-field min-h-[320px] resize-y" value={jdText} onChange={(e)=>setJdText(e.target.value)} placeholder="Paste the full job description here..." />
          {err && (
            <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              ⚠️ {err}
            </div>
          )}
          <button disabled={loading} className="btn-primary py-3 px-6">
            {loading ? "Saving..." : "Save changes →"}
          </button>
        </form>
      </div>
    </div>
  );
}
