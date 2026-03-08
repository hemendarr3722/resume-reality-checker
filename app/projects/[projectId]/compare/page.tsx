"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ComparePage({ params }: { params: { projectId: string }}) {
  const sp = useSearchParams();
  const from = sp.get("from") || "";
  const to = sp.get("to") || "";
  const [diff, setDiff] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/projects/${params.projectId}/compare?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
      if (!res.ok) { setErr("Could not load diff"); return; }
      const j = await res.json();
      setDiff(j.diffText || "");
    })();
  }, [params.projectId, from, to]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <Link href={`/projects/${params.projectId}`} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">← Back to project</Link>
        <h1 className="text-3xl font-bold text-white mt-2">Compare versions</h1>
        <p className="mt-1 text-sm text-slate-400">Line-by-line diff between two resume versions</p>
      </div>
      {err && (
        <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg max-w-md" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
          ⚠️ {err}
        </div>
      )}
      <div className="glass-card p-6 overflow-x-auto">
        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
          {diff.split("\n").map((line, i) => {
            let color = "#94a3b8";
            let bg = "transparent";
            if (line.startsWith("+ ")) { color = "#34d399"; bg = "rgba(16, 185, 129, 0.08)"; }
            else if (line.startsWith("- ")) { color = "#f87171"; bg = "rgba(239, 68, 68, 0.08)"; }
            return (
              <div key={i} style={{ color, background: bg, padding: "1px 8px", borderRadius: "2px" }}>
                {line}
              </div>
            );
          })}
        </pre>
      </div>
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: "rgba(16, 185, 129, 0.2)" }} /> Added</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: "rgba(239, 68, 68, 0.2)" }} /> Removed</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: "rgba(148, 163, 184, 0.1)" }} /> Unchanged</span>
      </div>
    </div>
  );
}
