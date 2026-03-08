"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProject() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, companyName, roleTitle, jdText }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(()=>({}));
      setErr(j.error || "Failed to create project");
      return;
    }
    const j = await res.json();
    router.push(`/projects/${j.projectId}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-card p-8 space-y-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">New project</h1>
          <p className="mt-1 text-sm text-slate-400">One project = one job application. Add the job details below.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Project title</label>
            <input className="input-field" placeholder="e.g., Senior DE — Amazon" value={title} onChange={(e)=>setTitle(e.target.value)} required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Company</label>
              <input className="input-field" placeholder="Amazon" value={companyName} onChange={(e)=>setCompanyName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Role title</label>
              <input className="input-field" placeholder="Senior Data Engineer" value={roleTitle} onChange={(e)=>setRoleTitle(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Job description</label>
            <textarea className="input-field min-h-[240px] resize-y" placeholder="Paste the full job description here..." value={jdText} onChange={(e)=>setJdText(e.target.value)} required />
          </div>
          {err && (
            <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              ⚠️ {err}
            </div>
          )}
          <button disabled={loading} className="btn-primary py-3 px-6">
            {loading ? "Creating..." : "Create project →"}
          </button>
        </form>
      </div>
    </div>
  );
}
