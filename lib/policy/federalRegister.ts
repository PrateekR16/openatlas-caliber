export type RawRule = {
  docNumber: string;
  title: string;
  abstract: string;
  date: string;
  url: string;
  type: string;
};

// Immigration agencies only — keeps results relevant without a keyword filter.
const AGENCIES = [
  "u-s-citizenship-and-immigration-services",
  "u-s-immigration-and-customs-enforcement",
];

// Surface substantive changes (Rules, Proposed Rules) above routine Notices.
const TYPE_RANK: Record<string, number> = {
  Rule: 0,
  "Presidential Document": 1,
  "Proposed Rule": 1,
  Notice: 2,
};

export async function fetchRecentRules(sinceDays = 240): Promise<RawRule[]> {
  const since = new Date(Date.now() - sinceDays * 86400000)
    .toISOString()
    .slice(0, 10);

  const p = new URLSearchParams();
  p.set("per_page", "50");
  p.set("order", "newest");
  p.set("conditions[publication_date][gte]", since);
  AGENCIES.forEach((a) => p.append("conditions[agencies][]", a));
  ["title", "abstract", "publication_date", "html_url", "type", "document_number"].forEach(
    (f) => p.append("fields[]", f),
  );

  const res = await fetch(
    `https://www.federalregister.gov/api/v1/documents.json?${p.toString()}`,
  );
  if (!res.ok) throw new Error(`Federal Register ${res.status}`);
  const data = await res.json();

  const rules: RawRule[] = (data.results ?? []).map(
    (r: Record<string, string | null>) => ({
      docNumber: String(r.document_number),
      title: String(r.title),
      abstract: r.abstract ?? "",
      date: String(r.publication_date),
      url: String(r.html_url),
      type: String(r.type),
    }),
  );

  rules.sort(
    (a, b) =>
      (TYPE_RANK[a.type] ?? 3) - (TYPE_RANK[b.type] ?? 3) ||
      b.date.localeCompare(a.date),
  );
  return rules;
}
