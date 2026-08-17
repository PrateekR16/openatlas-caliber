// The deterministic skeleton: each visa is a config pack the whole engine
// reasons against. Criteria and thresholds come straight from the regulations
// (8 CFR 214.2(o) / 204.5). The agent panel judges each criterion; code counts
// the results and applies `threshold`.

export type Criterion = {
  id: string;
  label: string;
  hint: string;
};

export type Visa = {
  id: string;
  name: string;
  fullName: string;
  category: string;
  tagline: string;
  threshold: number; // how many criteria must be met
  criteria: Criterion[];
};

const OUTSTANDING: Criterion[] = [
  { id: "awards", label: "Nationally/internationally recognized awards", hint: "Prizes or awards for excellence in your field" },
  { id: "membership", label: "Membership requiring outstanding achievement", hint: "Associations that admit only top achievers" },
  { id: "press", label: "Published material about you", hint: "Media coverage in professional or major trade press" },
  { id: "judging", label: "Judging the work of others", hint: "Peer review, program committees, panels, competition judging" },
  { id: "original", label: "Original contributions of major significance", hint: "Work that measurably influenced your field" },
  { id: "scholarly", label: "Scholarly articles", hint: "Authorship in professional journals or major media" },
];

export const VISAS: Visa[] = [
  {
    id: "o1a",
    name: "O-1A",
    fullName: "Extraordinary ability — sciences, business, athletics",
    category: "Temporary work visa",
    tagline: "The flagship extraordinary-ability visa. No lottery, no cap.",
    threshold: 3,
    criteria: [
      ...OUTSTANDING,
      { id: "critical-role", label: "Critical role for distinguished organizations", hint: "A leading or essential role at a respected org" },
      { id: "salary", label: "High salary or remuneration", hint: "Pay in the top tier for your role and region" },
    ],
  },
  {
    id: "eb1a",
    name: "EB-1A",
    fullName: "Extraordinary ability — green card",
    category: "Permanent residence",
    tagline: "The green-card sibling of the O-1A. Self-petition, no employer needed.",
    threshold: 3,
    criteria: [
      ...OUTSTANDING,
      { id: "exhibitions", label: "Display of work at artistic exhibitions", hint: "Showcases of your work at exhibitions or showcases" },
      { id: "critical-role", label: "Leading or critical role for distinguished organizations", hint: "A leading role at an org with a distinguished reputation" },
      { id: "salary", label: "High salary or remuneration", hint: "Pay in the top tier for your role and region" },
      { id: "commercial", label: "Commercial success in the performing arts", hint: "Box office or sales figures showing commercial success" },
    ],
  },
  {
    id: "o1b",
    name: "O-1B",
    fullName: "Extraordinary ability — arts",
    category: "Temporary work visa",
    tagline: "For distinction in the arts, film, or television.",
    threshold: 3,
    criteria: [
      { id: "lead-role", label: "Lead or starring role in productions", hint: "Leading roles in distinguished productions or events" },
      { id: "recognition", label: "National or international recognition", hint: "Critical reviews or press attesting to recognition" },
      { id: "lead-org", label: "Lead role for distinguished organizations", hint: "Leading role for orgs with a distinguished reputation" },
      { id: "success", label: "Record of major commercial or critical success", hint: "Ratings, box office, sales, or standing" },
      { id: "recognition-experts", label: "Significant recognition from experts", hint: "Testimonials from recognized experts in the field" },
      { id: "salary", label: "High salary or remuneration", hint: "Pay high relative to others in the field" },
    ],
  },
  {
    id: "eb1b",
    name: "EB-1B",
    fullName: "Outstanding professor or researcher",
    category: "Permanent residence",
    tagline: "Employer-sponsored green card for top researchers.",
    threshold: 2,
    criteria: OUTSTANDING,
  },
  {
    id: "niw",
    name: "EB-2 NIW",
    fullName: "National interest waiver",
    category: "Permanent residence",
    tagline: "A green card that waives the job offer — for work in the national interest.",
    threshold: 3,
    criteria: [
      { id: "merit", label: "Substantial merit and national importance", hint: "Your endeavor has substantial merit and national importance" },
      { id: "positioned", label: "Well positioned to advance the endeavor", hint: "Your record shows you can advance the work" },
      { id: "benefit", label: "On balance, beneficial to waive the job offer", hint: "It benefits the US to waive the labor-certification requirement" },
    ],
  },
];

export function getVisa(id: string): Visa | undefined {
  return VISAS.find((v) => v.id === id);
}
