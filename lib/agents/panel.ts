import { Type } from "@google/genai";
import { generateJSON } from "./llm";
import type { Visa } from "@/lib/visas";
import type { EvidenceItem } from "./extractor";

export type Verdict = "met" | "partial" | "gap";
export type Confidence = "low" | "medium" | "high";

export type CriterionVerdict = {
  criterionId: string;
  label: string;
  verdict: Verdict;
  confidence: Confidence;
  advocate: string;
  examiner: string;
  reasoning: string;
  runway: string; // how to close a gap/partial; empty when met
};

export type PanelResult = {
  criteria: CriterionVerdict[];
  metCount: number;
  partialCount: number;
  threshold: number;
  total: number;
  eligible: boolean;
  summary: string;
};

// One structured call judges every criterion. The free tier caps requests per
// minute hard (~5), so per-criterion calls overflow instantly — the whole panel
// runs in a single request instead. Each criterion still gets its own
// Advocate / Examiner / Adjudicator output in the response array.
const panelSchema = {
  type: Type.OBJECT,
  properties: {
    criteria: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          criterionId: { type: Type.STRING },
          verdict: { type: Type.STRING, enum: ["met", "partial", "gap"] },
          confidence: { type: Type.STRING, enum: ["low", "medium", "high"] },
          advocate: { type: Type.STRING },
          examiner: { type: Type.STRING },
          reasoning: { type: Type.STRING },
          runway: { type: Type.STRING },
        },
        required: [
          "criterionId",
          "verdict",
          "confidence",
          "advocate",
          "examiner",
          "reasoning",
          "runway",
        ],
      },
    },
  },
  required: ["criteria"],
};

const VERDICTS = new Set<Verdict>(["met", "partial", "gap"]);
const CONFS = new Set<Confidence>(["low", "medium", "high"]);

type RawVerdict = {
  criterionId: string;
  verdict: Verdict;
  confidence: Confidence;
  advocate: string;
  examiner: string;
  reasoning: string;
  runway: string;
};

export async function runPanel(
  evidence: EvidenceItem[],
  visa: Visa,
): Promise<PanelResult> {
  const evidenceText =
    evidence.map((e) => `- [${e.source}] ${e.title}: ${e.detail}`).join("\n") ||
    "(no evidence provided)";

  const criteriaList = visa.criteria
    .map((c) => `- ${c.id}: ${c.label} — ${c.hint}`)
    .join("\n");

  const prompt = `You are a three-member panel — Advocate, Examiner, and Adjudicator — assessing a US ${visa.name} petition ("${visa.fullName}"). The petition qualifies if the candidate MEETS at least ${visa.threshold} of the criteria below.

CRITERIA (judge each independently, only against its own standard):
${criteriaList}

STANDARD OF REVIEW — judge like a skeptical USCIS officer, NOT a supportive mentor. The bar is "sustained national or international acclaim" and being among the small percentage at the very top of the field. Default to skepticism: award "met" only when the evidence clearly clears that high bar. When in doubt, use "partial" or "gap". Do not be flattering.

Calibrations (common over-counting to avoid):
- Awards: must be nationally or internationally recognized awards for excellence in the field, judged by recognized experts. Student competitions, hackathons, university or department awards, scholarships, GPA/dean's-list, and internal company awards do NOT qualify.
- Membership: associations that require outstanding achievement, judged by experts. Ordinary or student memberships do not qualify.
- Published material about you: material ABOUT the person in professional or major trade media — not authored by them, not their own posts or papers.
- Judging: concrete evidence of reviewing or judging others' work in the field (peer review, program committees, competition judging).
- Original contributions of major significance: the contribution must be shown to have MAJOR significance — wide adoption, strong citation impact, or demonstrable influence on the field. A personal project, coursework, or an ordinary repo without evidence of field-wide impact does not clear this bar.
- Scholarly articles: authorship in reputable professional journals or major media. Papers in low-tier, student, or predatory journals, and non-peer-reviewed preprints or workshop notes, are weak evidence at best.
- Critical role for distinguished organizations: requires BOTH a leading or critical (not ordinary) role AND an organization with a genuinely distinguished reputation. Student, intern, or standard-employee roles do not qualify.
- High salary / remuneration: requires evidence the salary is high RELATIVE to others in the same field and region (a top percentile, with comparative data). A raw salary figure with no comparison cannot be "met" — treat it as "partial" at most, and have the examiner note that comparative wage (e.g. BLS) verification is required.

CANDIDATE'S EVIDENCE (their full record):
${evidenceText}

For EACH criterion above, return an object with:
- criterionId: the id shown above
- advocate: the strongest good-faith argument that the evidence MEETS this specific criterion, citing concrete facts — or state honestly if nothing supports it
- examiner: how a skeptical USCIS officer would push back — the likely Request for Evidence; name exactly what is thin, missing, or unpersuasive
- verdict: "met" only if the evidence clearly satisfies this criterion; "partial" if there is a real but insufficient start; "gap" if essentially nothing supports it
- confidence: low, medium, or high
- reasoning: the adjudicator's short decision weighing both sides against the standard
- runway: if the verdict is "partial" or "gap", give 1–2 concrete, field-specific next steps — what evidence would actually count for this criterion and how someone in this candidate's field typically obtains it. If the verdict is "met", return an empty string.

Be strictly faithful to the evidence. Never invent facts, awards, numbers, roles, or citations. Return exactly one object per criterion.

Return a JSON object of exactly this shape:
{"criteria": [{"criterionId": string, "verdict": "met"|"partial"|"gap", "confidence": "low"|"medium"|"high", "advocate": string, "examiner": string, "reasoning": string, "runway": string}]}`;

  const parsed = await generateJSON<{ criteria?: RawVerdict[] }>(
    prompt,
    panelSchema,
    { temperature: 0.3 },
  );

  const byId = new Map<string, RawVerdict>();
  for (const r of parsed.criteria ?? []) byId.set(r.criterionId, r);

  // Assemble in the canonical criterion order; a criterion the model skipped
  // defaults to a gap.
  const criteria: CriterionVerdict[] = visa.criteria.map((c) => {
    const r = byId.get(c.id);
    return {
      criterionId: c.id,
      label: c.label,
      verdict: r && VERDICTS.has(r.verdict) ? r.verdict : "gap",
      confidence: r && CONFS.has(r.confidence) ? r.confidence : "medium",
      advocate: r?.advocate ?? "",
      examiner: r?.examiner ?? "No evidence was provided for this criterion.",
      reasoning: r?.reasoning ?? "No supporting evidence found.",
      runway: r?.runway ?? "",
    };
  });

  // Deterministic verdict: code counts and applies the rule.
  const metCount = criteria.filter((c) => c.verdict === "met").length;
  const partialCount = criteria.filter((c) => c.verdict === "partial").length;
  const total = visa.criteria.length;
  const eligible = metCount >= visa.threshold;

  const summary = eligible
    ? `You meet ${metCount} of ${total} criteria. ${visa.name} requires ${visa.threshold} — likely eligible.`
    : `You meet ${metCount} of ${total} criteria. ${visa.name} requires ${visa.threshold} — ${visa.threshold - metCount} short${partialCount ? `, with ${partialCount} in reach` : ""}.`;

  return {
    criteria,
    metCount,
    partialCount,
    threshold: visa.threshold,
    total,
    eligible,
    summary,
  };
}
