import { Type } from "@google/genai";
import { generateJSON } from "./llm";
import type { RawRule } from "@/lib/policy/federalRegister";

export type Impact = "high" | "medium" | "low";

export type Classification = {
  docNumber: string;
  summary: string;
  visas: string[];
  impact: Impact;
};

const VISA_TAGS = [
  "O-1",
  "EB-1A",
  "EB-1B",
  "O-1B",
  "EB-2 NIW",
  "H-1B",
  "F-1",
  "General",
];

const schema = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          docNumber: { type: Type.STRING },
          summary: { type: Type.STRING },
          visas: { type: Type.ARRAY, items: { type: Type.STRING } },
          impact: { type: Type.STRING, enum: ["high", "medium", "low"] },
        },
        required: ["docNumber", "summary", "visas", "impact"],
      },
    },
  },
  required: ["items"],
};

export async function classifyRules(
  rules: RawRule[],
): Promise<Classification[]> {
  if (rules.length === 0) return [];

  const rulesText = rules
    .map(
      (r) =>
        `docNumber: ${r.docNumber}\ntype: ${r.type}\ntitle: ${r.title}\nabstract: ${r.abstract.slice(0, 400)}`,
    )
    .join("\n---\n");

  const prompt = `You are summarizing recent US immigration items from the Federal Register for a general audience.

For EACH item below, return:
- docNumber: echo it back exactly
- summary: ONE plain-language sentence — what changed or is proposed, and who it affects. Be faithful to the abstract; do not invent specifics. If it's a routine paperwork/form-renewal notice, say so plainly.
- visas: which of these it affects — ${VISA_TAGS.join(", ")}. Use "General" if it is broad or not tied to a specific visa. Include only genuinely relevant tags.
- impact: "high" for a new final rule or major change; "medium" for a proposed rule or notice affecting a group of applicants; "low" for routine administrative or paperwork items.

ITEMS:
${rulesText}

Return a JSON object of exactly this shape:
{"items": [{"docNumber": string, "summary": string, "visas": string[], "impact": "high"|"medium"|"low"}]}`;

  const parsed = await generateJSON<{ items?: Classification[] }>(prompt, schema);
  const valid = new Set(VISA_TAGS);
  return (parsed.items ?? []).map((c) => ({
    docNumber: c.docNumber,
    summary: c.summary,
    visas: (c.visas ?? []).filter((v) => valid.has(v)),
    impact: (["high", "medium", "low"] as const).includes(c.impact)
      ? c.impact
      : "low",
  }));
}
