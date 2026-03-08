import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function parsePdf(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return (data.text || "").trim();
}

export async function parseDocx(buffer: Buffer): Promise<string> {
  const { value } = await mammoth.extractRawText({ buffer });
  return (value || "").trim();
}

export function normalizeText(t: string): string {
  return t.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
