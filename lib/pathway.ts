// F-1 / H-1B pathway logic — deterministic rules and published data, no LLM.

export const H1B_SOURCE = "USCIS H-1B cap season data (approximate, recent FY)";

// ponytail: approximate selection rates from recent USCIS cap seasons. Real
// odds swing year to year with registration volume; these are tunable
// constants, not a model — update from USCIS reports each cap season.
const REGULAR_RATE = 0.26;
const ADVANCED_RATE = 0.38;

export type H1bInput = { capExempt: boolean; advancedDegree: boolean };

export function h1bOdds(input: H1bInput): { pct: number; note: string } {
  if (input.capExempt) {
    return {
      pct: 100,
      note: "Cap-exempt employers (accredited universities, affiliated nonprofits, nonprofit/government research orgs) are not subject to the H-1B lottery.",
    };
  }
  const rate = input.advancedDegree ? ADVANCED_RATE : REGULAR_RATE;
  return {
    pct: Math.round(rate * 100),
    note: input.advancedDegree
      ? "Includes the extra advanced-degree (U.S. master's or higher) selection round."
      : "Standard registration, without the advanced-degree exemption.",
  };
}

// ponytail: keyword heuristic over common STEM fields. Production should match
// the beneficiary's CIP code against the official DHS STEM Designated Degree
// Program List; this covers the common cases for a self-check.
export const STEM_KEYWORDS = [
  "computer",
  "software",
  "data",
  "information technology",
  "artificial intelligence",
  "machine learning",
  "engineer",
  "mathematic",
  "statistic",
  "physic",
  "chemistry",
  "biolog",
  "electric",
  "mechanical",
  "aerospace",
  "robotic",
  "cyber",
  "neuroscience",
  "actuar",
  "astronomy",
  "geolog",
];

export function stemOpt(major: string): {
  stem: boolean;
  totalOptMonths: number;
  note: string;
} {
  const m = major.trim().toLowerCase();
  if (!m) {
    return { stem: false, totalOptMonths: 12, note: "Enter your degree or major to check." };
  }
  const stem = STEM_KEYWORDS.some((k) => m.includes(k));
  return stem
    ? {
        stem: true,
        totalOptMonths: 36,
        note: "Your field appears STEM-designated — eligible for the 24-month STEM OPT extension, up to 36 months of OPT in total.",
      }
    : {
        stem: false,
        totalOptMonths: 12,
        note: "Your field doesn't clearly match the STEM list — standard 12-month OPT. Confirm against the official DHS STEM Designated Degree Program List.",
      };
}
