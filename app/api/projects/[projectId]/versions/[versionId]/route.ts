import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { projectId: string; versionId: string }}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findFirst({ where: { id: params.projectId, userId } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const version = await prisma.resumeVersion.findFirst({
    where: { id: params.versionId, projectId: project.id },
    include: { analysisRuns: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!version) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const a = version.analysisRuns[0];
  return NextResponse.json({
    id: version.id,
    versionNumber: version.versionNumber,
    resumeText: version.resumeText,
    latestAnalysis: a ? {
      id: a.id,
      scoreOverall: a.scoreOverall,
      atsScore: a.atsScore,
      keywordCoverage: a.keywordCoverage,
      missingKeywords: a.missingKeywords,
      strengths: a.strengths,
      redFlags: a.redFlags,
      suggestedFixes: a.suggestedFixes,
      summary: a.summary,
      createdAt: a.createdAt,
    } : null
  });
}
