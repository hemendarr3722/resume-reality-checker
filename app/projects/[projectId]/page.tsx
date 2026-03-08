import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ScoreBar } from "@/components/ScoreBars";

export default async function ProjectPage({ params }: { params: { projectId: string }}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string;

  const project = await prisma.project.findFirst({
    where: { id: params.projectId, userId },
    include: {
      resumeVersions: { orderBy: { versionNumber: "desc" }, take: 10 },
      analysisRuns: { orderBy: { createdAt: "desc" }, take: 1 },
      diffs: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!project) return <div className="glass-card p-8 text-center text-slate-400">Project not found</div>;

  const latestAnalysis = project.analysisRuns[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 animate-fade-in-up">
        <div>
          <Link href="/dashboard" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">← Back to dashboard</Link>
          <h1 className="text-3xl font-bold text-white mt-2">{project.title}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(99, 102, 241, 0.1)", color: "#a5b4fc" }}>
              {project.companyName}
            </span>
            <span className="text-slate-500">•</span>
            <span>{project.roleTitle}</span>
          </div>
          <div className="mt-4 flex gap-3">
            <Link href={`/projects/${project.id}/resume`} className="btn-primary text-sm py-2 px-4">
              ＋ Add resume version
            </Link>
            <Link href={`/projects/${project.id}/jd`} className="btn-secondary text-sm py-2 px-4">
              ✏️ Edit job description
            </Link>
          </div>
        </div>
      </div>

      {/* Latest analysis */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <span>📊</span> Latest analysis
        </h2>
        {!latestAnalysis ? (
          <p className="text-sm text-slate-400">No analysis yet. Add a resume version, then run analysis from the version page.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            <ScoreBar label="Overall" value={latestAnalysis.scoreOverall} />
            <ScoreBar label="ATS" value={latestAnalysis.atsScore} />
            <ScoreBar label="Keyword coverage" value={latestAnalysis.keywordCoverage} />
          </div>
        )}
      </section>

      {/* Resume versions + Diffs */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
            <span>📄</span> Resume versions
          </h2>
          <div className="space-y-2">
            {project.resumeVersions.map(v => (
              <Link key={v.id} className="block rounded-lg p-3 no-underline transition-all hover:bg-white/5"
                    style={{ border: "1px solid rgba(99, 102, 241, 0.1)" }}
                    href={`/projects/${project.id}/versions/${v.id}`}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-white">v{v.versionNumber}</span>
                  <span className="text-slate-500 text-xs">{v.createdAt.toDateString()}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {v.sourceType === "upload" ? "📎" : "📝"} {v.sourceType}{v.resumeFileName ? ` • ${v.resumeFileName}` : ""}
                </div>
              </Link>
            ))}
            {project.resumeVersions.length === 0 && <div className="text-sm text-slate-500">No resume versions yet.</div>}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
            <span>🔀</span> Recent diffs
          </h2>
          <div className="space-y-2">
            {project.diffs.map(d => (
              <Link key={d.id} className="block rounded-lg p-3 no-underline transition-all hover:bg-white/5"
                style={{ border: "1px solid rgba(99, 102, 241, 0.1)" }}
                href={`/projects/${project.id}/compare?from=${d.fromResumeVersionId}&to=${d.toResumeVersionId}`}>
                <div className="text-sm font-medium text-white">Version comparison</div>
                <div className="text-xs text-slate-400 mt-0.5">{d.diffSummary}</div>
              </Link>
            ))}
            {project.diffs.length === 0 && <div className="text-sm text-slate-500">No diffs yet.</div>}
          </div>
        </div>
      </section>
    </div>
  );
}
