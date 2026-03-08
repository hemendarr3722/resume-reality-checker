import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string;

  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      analysisRuns: { orderBy: { createdAt: "desc" }, take: 1 },
      resumeVersions: { orderBy: { versionNumber: "desc" }, take: 1 },
    },
  });

  function getScoreColor(value: number) {
    if (value >= 75) return "#10b981";
    if (value >= 50) return "#f59e0b";
    return "#ef4444";
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">Manage your job applications and track resume scores</p>
        </div>
        <Link href="/projects/new" className="btn-primary">
          ＋ New Project
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => {
          const a = p.analysisRuns[0];
          const latestV = p.resumeVersions[0];
          return (
            <Link key={p.id} href={`/projects/${p.id}`}
                  className="glass-card p-6 no-underline group gradient-border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-lg group-hover:text-brand-300 transition-colors">{p.title}</div>
                  <div className="mt-1 text-sm text-slate-400 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(99, 102, 241, 0.1)", color: "#a5b4fc" }}>
                      {p.companyName}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span>{p.roleTitle}</span>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    {latestV ? `Latest: v${latestV.versionNumber}` : "No resume yet"} • Updated {p.updatedAt.toDateString()}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Score</div>
                  <div className="text-3xl font-bold mt-1"
                       style={{ color: a ? getScoreColor(a.scoreOverall) : "#475569" }}>
                    {a ? a.scoreOverall : "—"}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
        {projects.length === 0 && (
          <div className="glass-card p-8 text-center col-span-full space-y-3">
            <div className="text-4xl">📋</div>
            <div className="text-slate-400">No projects yet. Create one to get started.</div>
            <Link href="/projects/new" className="btn-primary inline-flex">
              Create your first project
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
