export type GithubRepo = {
  name: string;
  stars: number;
  language: string | null;
  description: string | null;
  url: string;
};

export type GithubData = {
  handle: string;
  name: string | null;
  followers: number;
  publicRepos: number;
  totalStars: number;
  topRepos: GithubRepo[];
};

function parseHandle(input: string): string {
  const s = input.trim().replace(/\/+$/, "");
  const m = s.match(/github\.com\/([^/?#]+)/i);
  return (m ? m[1] : s).replace(/^@/, "");
}

export async function fetchGithub(input: string): Promise<GithubData> {
  const handle = parseHandle(input);
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "caliber",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const userRes = await fetch(`https://api.github.com/users/${handle}`, { headers });
  if (!userRes.ok) {
    throw new Error(`GitHub user "${handle}" not found (${userRes.status})`);
  }
  const user = await userRes.json();

  const reposRes = await fetch(
    `https://api.github.com/users/${handle}/repos?per_page=100&sort=pushed`,
    { headers },
  );
  const repos: Array<Record<string, unknown>> = reposRes.ok
    ? await reposRes.json()
    : [];

  const stars = (r: Record<string, unknown>) =>
    Number(r.stargazers_count ?? 0);
  const sorted = [...repos].sort((a, b) => stars(b) - stars(a));
  // ponytail: totalStars sums the first 100 repos (API page cap). Good enough
  // as an impact signal; paginate if a user has >100 repos and it matters.
  const totalStars = repos.reduce((s, r) => s + stars(r), 0);

  return {
    handle,
    name: (user.name as string) ?? null,
    followers: Number(user.followers ?? 0),
    publicRepos: Number(user.public_repos ?? 0),
    totalStars,
    topRepos: sorted.slice(0, 5).map((r) => ({
      name: String(r.name),
      stars: stars(r),
      language: (r.language as string) ?? null,
      description: (r.description as string) ?? null,
      url: String(r.html_url),
    })),
  };
}
