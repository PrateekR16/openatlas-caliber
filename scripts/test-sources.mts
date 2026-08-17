import { fetchGithub } from "../lib/sources/github.ts";
import { fetchOpenAlex } from "../lib/sources/openalex.ts";

const gh = await fetchGithub("github.com/torvalds");
console.log("GITHUB:", {
  name: gh.name,
  followers: gh.followers,
  totalStars: gh.totalStars,
  top: gh.topRepos.slice(0, 3).map((r) => `${r.name} (${r.stars}★)`),
});

const oa = await fetchOpenAlex("Yoshua Bengio");
console.log("OPENALEX:", {
  name: oa.name,
  works: oa.worksCount,
  citations: oa.citedByCount,
  hIndex: oa.hIndex,
  top: oa.topWorks.slice(0, 2).map((w) => `${w.title} (${w.citations})`),
});
