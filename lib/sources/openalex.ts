export type OpenAlexWork = {
  title: string;
  year: number | null;
  citations: number;
  venue: string | null;
};

export type OpenAlexData = {
  authorId: string;
  name: string;
  worksCount: number;
  citedByCount: number;
  hIndex: number | null;
  topWorks: OpenAlexWork[];
};

const MAILTO = process.env.OPENALEX_MAILTO ?? "caliber@example.com";

function parseAuthorId(input: string): string | null {
  const m = input.match(/A\d{6,}/);
  return m ? m[0] : null;
}

export async function fetchOpenAlex(input: string): Promise<OpenAlexData> {
  let authorId = parseAuthorId(input);

  if (!authorId) {
    // No OpenAlex id — treat the input as a name and search for the author.
    const query = input.replace(/https?:\/\/\S+/g, "").trim() || input.trim();
    if (!query) {
      throw new Error("Paste an OpenAlex profile URL or your name");
    }
    const res = await fetch(
      `https://api.openalex.org/authors?search=${encodeURIComponent(query)}&per_page=1&mailto=${MAILTO}`,
    );
    if (!res.ok) throw new Error(`OpenAlex search failed (${res.status})`);
    const data = await res.json();
    const first = data.results?.[0];
    if (!first) throw new Error(`No OpenAlex author found for "${query}"`);
    authorId = String(first.id).split("/").pop() ?? null;
  }

  const authorRes = await fetch(
    `https://api.openalex.org/authors/${authorId}?mailto=${MAILTO}`,
  );
  if (!authorRes.ok) {
    throw new Error(`OpenAlex author not found (${authorRes.status})`);
  }
  const author = await authorRes.json();

  const worksRes = await fetch(
    `https://api.openalex.org/works?filter=author.id:${authorId}&sort=cited_by_count:desc&per_page=5&mailto=${MAILTO}`,
  );
  const works: Array<Record<string, any>> = worksRes.ok
    ? (await worksRes.json()).results ?? []
    : [];

  return {
    authorId: authorId as string,
    name: author.display_name,
    worksCount: Number(author.works_count ?? 0),
    citedByCount: Number(author.cited_by_count ?? 0),
    hIndex: author.summary_stats?.h_index ?? null,
    topWorks: works.map((w) => ({
      title: w.title ?? w.display_name ?? "Untitled",
      year: w.publication_year ?? null,
      citations: Number(w.cited_by_count ?? 0),
      venue: w.primary_location?.source?.display_name ?? null,
    })),
  };
}
