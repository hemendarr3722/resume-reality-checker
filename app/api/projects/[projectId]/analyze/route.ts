import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeResumeWithGemini } from "@/lib/gemini";

export async function POST(req: Request, { params }: { params: { projectId: string }}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findFirst({ where: { id: params.projectId, userId } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const resumeVersionId = body.resumeVersionId as string | undefined;
  if (!resumeVersionId) return NextResponse.json({ error: "resumeVersionId required" }, { status: 400 });

  const version = await prisma.resumeVersion.findFirst({ where: { id: resumeVersionId, projectId: project.id } });
  if (!version) return NextResponse.json({ error: "Resume version not found" }, { status: 404 });

  const result = await analyzeResumeWithGemini({ resumeText: version.resumeText, jdText: project.jdText });

  const run = await prisma.analysisRun.create({
    data: {
      projectId: project.id,
      resumeVersionId: version.id,
      modelName: result.modelName,
      scoreOverall: result.scoreOverall,
      atsScore: result.atsScore,
      keywordCoverage: result.keywordCoverage,
      missingKeywords: result.missingKeywords,
      strengths: result.strengths,
      redFlags: result.redFlags,
      suggestedFixes: result.suggestedFixes,
      summary: result.summary,
    },
  });

  return NextResponse.json({ ok: true, analysisRunId: run.id });
}
