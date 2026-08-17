import { draftLetter } from "../lib/agents/letter.ts";
import { getVisa } from "../lib/visas.ts";
import type { PanelResult } from "../lib/agents/panel.ts";
import type { EvidenceItem } from "../lib/agents/extractor.ts";

const visa = getVisa("o1a")!;
const evidence: EvidenceItem[] = [
  { title: "linux kernel", detail: "Creator and lead maintainer of Linux, 243k GitHub stars, used worldwide.", source: "github", relatedCriteria: ["original", "critical-role"] },
  { title: "Deep learning paper", detail: "Authored a paper cited 83,000+ times.", source: "openalex", relatedCriteria: ["scholarly"] },
];
const panel: PanelResult = {
  criteria: [
    { criterionId: "original", label: "Original contributions of major significance", verdict: "partial", confidence: "medium", advocate: "Some citations.", examiner: "Impact unclear.", reasoning: "Partial.", runway: "Show field-wide impact." },
    { criterionId: "scholarly", label: "Scholarly articles", verdict: "partial", confidence: "medium", advocate: "A few papers.", examiner: "Low-tier venues.", reasoning: "Partial.", runway: "Publish in stronger journals." },
    { criterionId: "critical-role", label: "Critical role for distinguished organizations", verdict: "gap", confidence: "low", advocate: "None.", examiner: "No critical role.", reasoning: "Gap.", runway: "Take a leading role." },
  ],
  metCount: 0, partialCount: 2, threshold: 3, total: 8, eligible: false,
  summary: "You meet 0 of 8 criteria. O-1A requires 3 — 3 short, with 2 in reach.",
};

const letter = await draftLetter(visa, panel, evidence);
console.log(letter.slice(0, 900));
