import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { diffLines } from "diff";

export async function GET(req: Request, { params }: { params: { projectId: string }}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const fromId = url.searchParams.get("from");
  const toId = url.searchParams.get("to");
  if (!fromId || !toId) return NextResponse.json({ error: "from and to required" }, { status: 400 });

  const project = await prisma.project.findFirst({ where: { id: params.projectId, userId } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [from, to] = await Promise.all([
    prisma.resumeVersion.findFirst({ where: { id: fromId, projectId: project.id } }),
    prisma.resumeVersion.findFirst({ where: { id: toId, projectId: project.id } }),
  ]);
  if (!from || !to) return NextResponse.json({ error: "versions not found" }, { status: 404 });

  const parts = diffLines(from.resumeText, to.resumeText);
  const out = parts.map(p => {
    const prefix = p.added ? "+ " : p.removed ? "- " : "  ";
    return p.value.split("\n").map(line => prefix + line).join("\n");
  }).join("\n");

  return NextResponse.json({ diffText: out });
}
