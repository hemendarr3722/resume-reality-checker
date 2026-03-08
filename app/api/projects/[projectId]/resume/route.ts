import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parsePdf, parseDocx, normalizeText } from "@/lib/parse";
import { diffLines } from "diff";

export const runtime = "nodejs";

function ext(name: string) {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "";
}

export async function POST(req: Request, { params }: { params: { projectId: string }}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findFirst({ where: { id: params.projectId, userId } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const contentType = req.headers.get("content-type") || "";
  let resumeText = "";
  let fileName: string | null = null;
  let sourceType = "paste";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "file is required" }, { status: 400 });

    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });

    fileName = file.name;
    sourceType = "upload";
    const buffer = Buffer.from(await file.arrayBuffer());
    const e = ext(file.name);

    if (e === "pdf") resumeText = await parsePdf(buffer);
    else if (e === "docx") resumeText = await parseDocx(buffer);
    else return NextResponse.json({ error: "Only PDF or DOCX supported" }, { status: 400 });

  } else {
    const body = await req.json().catch(() => ({}));
    resumeText = String(body.resumeText || "");
    if (!resumeText.trim()) return NextResponse.json({ error: "resumeText required" }, { status: 400 });
    resumeText = resumeText.trim();
  }

  resumeText = normalizeText(resumeText);
  if (!resumeText) return NextResponse.json({ error: "Could not extract text from resume" }, { status: 400 });

  const last = await prisma.resumeVersion.findFirst({
    where: { projectId: project.id },
    orderBy: { versionNumber: "desc" },
  });
  const nextVersion = (last?.versionNumber || 0) + 1;

  const created = await prisma.resumeVersion.create({
    data: {
      projectId: project.id,
      versionNumber: nextVersion,
      sourceType,
      resumeText,
      resumeFileName: fileName || undefined,
    },
  });

  // Diff with previous version (if exists)
  if (last) {
    const parts = diffLines(last.resumeText, resumeText);
    const changed = parts.filter(p => p.added || p.removed).length;
    const summary = changed === 0 ? "No changes detected." : `Detected ${changed} changed blocks between v${last.versionNumber} and v${nextVersion}.`;

    await prisma.diff.create({
      data: {
        projectId: project.id,
        fromResumeVersionId: last.id,
        toResumeVersionId: created.id,
        diffSummary: summary,
        addedKeywords: [],
        removedKeywords: [],
      },
    });
  }

  return NextResponse.json({ ok: true, resumeVersionId: created.id });
}
