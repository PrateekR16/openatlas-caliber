import { fetchRecentRules, type RawRule } from "./federalRegister";
import { classifyRules, type Impact } from "@/lib/agents/policyClassifier";

export type WatchItem = RawRule & {
  summary: string;
  visas: string[];
  impact: Impact;
};

// ponytail: in-memory cache so navigating to the page doesn't re-hit Groq every
// load. Resets on server restart — fine for a demo; swap for a real cache/store
// if this ever runs at scale.
const TTL = 6 * 60 * 60 * 1000;
let cache: { at: number; items: WatchItem[] } | null = null;

const IMPACT_RANK: Record<Impact, number> = { high: 0, medium: 1, low: 2 };

export async function getPolicyWatch(): Promise<WatchItem[]> {
  if (cache && Date.now() - cache.at < TTL) return cache.items;

  const rules = (await fetchRecentRules(240)).slice(0, 8);
  const classified = await classifyRules(rules);
  const byDoc = new Map(classified.map((c) => [c.docNumber, c]));

  const items: WatchItem[] = rules.map((r) => {
    const c = byDoc.get(r.docNumber);
    return {
      ...r,
      summary: c?.summary ?? r.abstract.slice(0, 160),
      visas: c?.visas?.length ? c.visas : ["General"],
      impact: c?.impact ?? "low",
    };
  });

  items.sort(
    (a, b) =>
      IMPACT_RANK[a.impact] - IMPACT_RANK[b.impact] ||
      b.date.localeCompare(a.date),
  );

  cache = { at: Date.now(), items };
  return items;
}
