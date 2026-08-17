import { getPolicyWatch } from "../lib/policy/watch.ts";

const items = await getPolicyWatch();
console.log(`${items.length} items\n`);
for (const it of items.slice(0, 6)) {
  console.log(`[${it.impact.toUpperCase()}] ${it.type} · ${it.date} · ${it.visas.join(", ")}`);
  console.log(`  ${it.title.slice(0, 90)}`);
  console.log(`  → ${it.summary}\n`);
}
