import { z } from "zod";

export const AnalysisSchema = z.object({
  scoreOverall: z.number().int().min(0).max(100),
  atsScore: z.number().int().min(0).max(100),
  keywordCoverage: z.number().int().min(0).max(100),
  missingKeywords: z.array(z.string()).default([]),
  strengths: z.array(z.string()).default([]),
  redFlags: z.array(z.string()).default([]),
  suggestedFixes: z.array(z.object({
    section: z.string(),
    issue: z.string(),
    fix: z.string(),
    exampleRewrite: z.string().optional().default("")
  })).default([]),
  summary: z.string().default("")
});

export type AnalysisResult = z.infer<typeof AnalysisSchema>;

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

// Uses Google Gemini REST API (server-side, free tier)
export async function analyzeResumeWithGemini(args: { resumeText: string; jdText: string; }): Promise<AnalysisResult & { modelName: string }> {
  const apiKey = mustEnv("GEMINI_API_KEY");
  const model = "gemini-2.0-flash";

  const systemInstruction = `You are an ATS and hiring manager assistant.
Return ONLY valid JSON matching the schema below. No markdown, no code fences, no extra text — just the raw JSON object.
Be specific and practical in your analysis.
Scoring guidance:
- ATS score: formatting clarity, section structure, avoiding tables/columns, consistent dates.
- Keyword coverage: how well resume matches job description skills/keywords.
- Overall score: weighted blend, include seniority fit and evidence.

JSON Schema:
{
  "scoreOverall": "int 0-100",
  "atsScore": "int 0-100",
  "keywordCoverage": "int 0-100",
  "missingKeywords": ["string"],
  "strengths": ["string"],
  "redFlags": ["string"],
  "suggestedFixes": [{ "section": "string", "issue": "string", "fix": "string", "exampleRewrite": "string" }],
  "summary": "string"
}`;

  const userPrompt = `JOB DESCRIPTION:
${args.jdText}

RESUME:
${args.resumeText}

Analyze this resume against the job description. Return ONLY the JSON object matching the schema described in your instructions. No other text.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [{
        parts: [{ text: userPrompt }]
      }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Gemini API error ${resp.status}: ${text.slice(0, 500)}`);
  }

  const data: any = await resp.json();

  // Gemini response: candidates[0].content.parts[0].text
  let rawText = "";
  try {
    rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  } catch {}
  if (!rawText) throw new Error("Gemini returned empty output");

  // Extract JSON if wrapped in markdown code fences
  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = fenceMatch ? fenceMatch[1].trim() : rawText.trim();

  // Further extract if there's a JSON object
  const objMatch = jsonText.match(/\{[\s\S]*\}$/);
  const finalJson = objMatch ? objMatch[0] : jsonText;

  let parsed: any;
  try {
    parsed = JSON.parse(finalJson);
  } catch (e) {
    throw new Error(`Failed to parse JSON from Gemini output: ${String(e)}. Output: ${rawText.slice(0, 500)}`);
  }

  const result = AnalysisSchema.parse(parsed);
  return { ...result, modelName: model };
}
