"use client";

import { useEffect, useState } from "react";
import type { GithubData } from "@/lib/sources/github";
import type { OpenAlexData } from "@/lib/sources/openalex";
import type { EvidenceItem } from "@/lib/agents/extractor";
import type { PanelResult } from "@/lib/agents/panel";
import { Scorecard } from "./Scorecard";
import { ReportPrint } from "./ReportPrint";

type SourceErr = { error: string };
type Bundle = {
  field: string;
  salary: string;
  press: string[];
  github: GithubData | SourceErr | null;
  openalex: OpenAlexData | SourceErr | null;
  resume: { chars: number; text: string } | SourceErr | null;
};

const hasErr = (v: unknown): v is SourceErr =>
  !!v && typeof v === "object" && "error" in v;

export function AssessmentForm({
  visaId,
  visaName,
  visaFullName,
  criteria,
}: {
  visaId: string;
  visaName: string;
  visaFullName: string;
  criteria: { id: string; label: string }[];
}) {
  const labelOf = (id: string) =>
    criteria.find((c) => c.id === id)?.label ?? id;
  const [github, setGithub] = useState("");
  const [publications, setPublications] = useState("");
  const [field, setField] = useState("");
  const [salary, setSalary] = useState("");
  const [press, setPress] = useState<string[]>([""]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [profileResumeText, setProfileResumeText] = useState("");
  const [prefilled, setPrefilled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Optional: prefill from the user's saved profile.
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        const p = data.profile;
        if (!p) return;
        setGithub(p.github ?? "");
        setPublications(p.publications ?? "");
        setField(p.field ?? "");
        setSalary(p.salary ?? "");
        if (p.press?.length) setPress(p.press);
        if (p.resumeText) setProfileResumeText(p.resumeText);
        if (
          p.github ||
          p.publications ||
          p.field ||
          p.salary ||
          p.resumeText ||
          p.press?.length
        ) {
          setPrefilled(true);
        }
      })
      .catch(() => {});
  }, []);
  const [result, setResult] = useState<Bundle | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [evidence, setEvidence] = useState<EvidenceItem[] | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [paneling, setPaneling] = useState(false);
  const [panel, setPanel] = useState<PanelResult | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [letter, setLetter] = useState<string | null>(null);
  const [letterError, setLetterError] = useState<string | null>(null);

  async function runDraftLetter() {
    if (!panel || !evidence) return;
    setLetterError(null);
    setDrafting(true);
    try {
      const res = await fetch("/api/letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidence, panel, visaId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setLetter(data.letter ?? "");
    } catch (err) {
      setLetterError(err instanceof Error ? err.message : "Draft failed");
    } finally {
      setDrafting(false);
    }
  }

  async function runPanelStep() {
    if (!evidence) return;
    setPanelError(null);
    setPaneling(true);
    try {
      const res = await fetch("/api/panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidence, visaId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setPanel(data);
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "Panel failed");
    } finally {
      setPaneling(false);
    }
  }

  function startOver() {
    setPanel(null);
    setEvidence(null);
    setResult(null);
  }

  async function runExtract() {
    if (!result) return;
    setExtractError(null);
    setExtracting(true);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundle: result, visaId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setEvidence(data.items ?? []);
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  }

  const setPressAt = (i: number, val: string) =>
    setPress((p) => p.map((x, idx) => (idx === i ? val : x)));
  const addPress = () => setPress((p) => [...p, ""]);
  const removePress = (i: number) =>
    setPress((p) => (p.length === 1 ? [""] : p.filter((_, idx) => idx !== i)));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pressLinks = press.map((p) => p.trim()).filter(Boolean);
    if (
      !github.trim() &&
      !publications.trim() &&
      !resumeFile &&
      !profileResumeText &&
      !pressLinks.length
    ) {
      setError(
        "Add at least one source — a GitHub or publications link, a résumé, or a press link.",
      );
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("github", github.trim());
      fd.set("publications", publications.trim());
      fd.set("field", field.trim());
      fd.set("salary", salary.trim());
      pressLinks.forEach((p) => fd.append("press", p));
      if (resumeFile) fd.set("resume", resumeFile);
      else if (profileResumeText) fd.set("resumeText", profileResumeText);

      const res = await fetch("/api/fetch-sources", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-line bg-card p-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-green-soft px-3 py-1 text-sm font-medium text-green">
          Evidence gathered
        </div>
        <h2 className="mt-4 text-xl font-semibold">
          Here's what we pulled for {visaName}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Real data from your sources — this is what the agent panel will reason
          over next.
        </p>

        <div className="mt-5 space-y-4">
          <EvidenceCard title="GitHub" data={result.github} empty="No GitHub link">
            {!hasErr(result.github) && result.github && (
              <GithubView data={result.github} />
            )}
          </EvidenceCard>

          <EvidenceCard title="Publications" data={result.openalex} empty="No publications link">
            {!hasErr(result.openalex) && result.openalex && (
              <OpenAlexView data={result.openalex} />
            )}
          </EvidenceCard>

          <EvidenceCard title="Résumé" data={result.resume} empty="No résumé uploaded">
            {!hasErr(result.resume) && result.resume && (
              <div className="text-sm text-muted">
                <span className="font-medium text-ink">
                  {result.resume.chars.toLocaleString()} characters
                </span>{" "}
                extracted.
                <p className="mt-2 line-clamp-3 rounded-lg bg-panel px-3 py-2 text-xs">
                  {result.resume.text.slice(0, 300)}…
                </p>
              </div>
            )}
          </EvidenceCard>

          {result.press.length > 0 && (
            <div className="rounded-xl border border-line p-4">
              <p className="text-sm font-semibold">
                Press links ({result.press.length})
              </p>
              <ul className="mt-2 space-y-1">
                {result.press.map((p) => (
                  <li key={p} className="truncate text-sm text-accent">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(result.field || result.salary) && (
            <div className="flex flex-wrap gap-2">
              {result.field && <Chip>Field: {result.field}</Chip>}
              {result.salary && <Chip>Salary: {result.salary}</Chip>}
            </div>
          )}
        </div>

        {!evidence && (
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={runExtract}
              disabled={extracting}
              className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent/90 disabled:opacity-60"
            >
              {extracting ? "Structuring with AI…" : "Structure evidence"}
            </button>
            <button
              onClick={() => setResult(null)}
              className="rounded-lg border border-line px-5 py-2.5 font-medium transition hover:border-ink/30"
            >
              Edit inputs
            </button>
          </div>
        )}
        {extractError && (
          <p className="mt-4 text-sm text-red-600">{extractError}</p>
        )}

        {evidence && (
          <div className="mt-8 border-t border-line pt-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent">
              Structured by AI
            </div>
            <h3 className="mt-3 text-lg font-semibold">
              {evidence.length} evidence item{evidence.length === 1 ? "" : "s"}
            </h3>
            <p className="mt-1 text-sm text-muted">
              Each item mapped to the criteria it could support. The agent panel
              judges these next.
            </p>
            <ul className="mt-4 space-y-3">
              {evidence.map((it, i) => (
                <li key={i} className="rounded-xl border border-line p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold">{it.title}</p>
                    <span className="shrink-0 rounded-md bg-panel px-2 py-0.5 text-xs text-muted">
                      {it.source}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{it.detail}</p>
                  {it.relatedCriteria.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {it.relatedCriteria.map((id) => (
                        <span
                          key={id}
                          className="rounded-md bg-green-soft px-2 py-0.5 text-xs font-medium text-green"
                        >
                          {labelOf(id)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-faint">
                      No criterion match — context only
                    </p>
                  )}
                </li>
              ))}
            </ul>
            {!panel && (
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={runPanelStep}
                  disabled={paneling}
                  className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent/90 disabled:opacity-60"
                >
                  {paneling
                    ? "Panel deliberating…"
                    : "Run the adversarial panel"}
                </button>
                <button
                  onClick={startOver}
                  className="rounded-lg border border-line px-5 py-2.5 font-medium transition hover:border-ink/30"
                >
                  Start over
                </button>
              </div>
            )}
            {panelError && (
              <p className="mt-4 text-sm text-red-600">{panelError}</p>
            )}
          </div>
        )}

        {panel && (
          <div className="mt-8 border-t border-line pt-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent">
              Adversarial panel · verdict
            </div>
            <Scorecard result={panel} />

            {letter && (
              <div className="mt-6">
                <p className="text-xs font-medium uppercase tracking-wide text-faint">
                  Draft petition argument
                </p>
                <div className="mt-2 whitespace-pre-wrap rounded-xl border border-line bg-card p-5 text-sm leading-relaxed text-ink">
                  {letter}
                </div>
                <p className="mt-2 text-xs text-faint">
                  A starting draft, grounded in your met criteria — have a
                  licensed attorney review before filing.
                </p>
              </div>
            )}
            {letterError && (
              <p className="mt-4 text-sm text-red-600">{letterError}</p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {!letter && (
                <button
                  onClick={runDraftLetter}
                  disabled={drafting}
                  className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent/90 disabled:opacity-60"
                >
                  {drafting ? "Drafting…" : "Draft petition letter"}
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="rounded-lg border border-line px-5 py-2.5 font-medium transition hover:border-ink/30"
              >
                Download PDF
              </button>
              <button
                onClick={startOver}
                className="rounded-lg border border-line px-5 py-2.5 font-medium transition hover:border-ink/30"
              >
                Start over
              </button>
            </div>
          </div>
        )}

        {panel && (
          <ReportPrint
            visaName={visaName}
            visaFullName={visaFullName}
            panel={panel}
            letter={letter}
          />
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-card p-6">
      <p className="text-sm font-semibold">Your evidence</p>
      <p className="mt-1 text-xs text-muted">
        Paste what you have. The more sources, the sharper the assessment.
      </p>
      {prefilled && (
        <p className="mt-2 inline-block rounded-md bg-green-soft px-2 py-1 text-xs font-medium text-green">
          Prefilled from your profile
        </p>
      )}

      <div className="mt-5 space-y-5">
        <TextField
          label="GitHub"
          hint="We read public repos, stars, and adoption."
          placeholder="github.com/yourhandle"
          value={github}
          onChange={setGithub}
        />
        <TextField
          label="Publications"
          hint="OpenAlex profile URL, or just your name — we pull papers and citations."
          placeholder="openalex.org/A… or your full name"
          value={publications}
          onChange={setPublications}
        />

        <div>
          <label className="text-sm font-medium">Press / media links</label>
          <p className="mt-0.5 text-xs text-muted">
            Articles or coverage about you and your work.
          </p>
          <div className="mt-2 space-y-2">
            {press.map((p, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="url"
                  value={p}
                  onChange={(e) => setPressAt(i, e.target.value)}
                  placeholder="https://…"
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => removePress(i)}
                  className="rounded-lg border border-line px-3 text-muted transition hover:border-ink/30"
                  aria-label="Remove link"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addPress}
            className="mt-2 text-sm font-medium text-accent hover:underline"
          >
            + Add another link
          </button>
        </div>

        <div>
          <label className="text-sm font-medium">Résumé / CV</label>
          <p className="mt-0.5 text-xs text-muted">
            {profileResumeText && !resumeFile
              ? "Using the résumé saved in your profile — upload to replace."
              : "PDF. We extract structured evidence from it."}
          </p>
          <label className="mt-2 flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-line px-3 py-2.5 text-sm transition hover:border-accent">
            <span
              className={
                resumeFile
                  ? "text-ink"
                  : profileResumeText
                    ? "text-green"
                    : "text-muted"
              }
            >
              {resumeFile?.name ??
                (profileResumeText ? "Résumé from profile ✓" : "Choose a PDF…")}
            </span>
            <span className="rounded-md bg-panel px-2 py-1 text-xs font-medium text-muted">
              Browse
            </span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Your field"
            placeholder="e.g. Machine learning"
            value={field}
            onChange={setField}
          />
          <div>
            <label className="text-sm font-medium">Annual salary (optional)</label>
            <input
              type="text"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="e.g. $180,000"
              className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 rounded-lg bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent/90 disabled:opacity-60"
      >
        {loading ? "Gathering evidence…" : "Gather evidence"}
      </button>
    </form>
  );
}

function EvidenceCard({
  title,
  data,
  empty,
  children,
}: {
  title: string;
  data: unknown;
  empty: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="text-sm font-semibold">{title}</p>
      {data === null ? (
        <p className="mt-1 text-sm text-faint">{empty}</p>
      ) : hasErr(data) ? (
        <p className="mt-1 text-sm text-amber">Couldn&apos;t fetch: {data.error}</p>
      ) : (
        <div className="mt-2">{children}</div>
      )}
    </div>
  );
}

function GithubView({ data }: { data: GithubData }) {
  return (
    <div className="text-sm">
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-muted">
        <span>
          <b className="text-ink">{data.name ?? data.handle}</b>
        </span>
        <span>{data.followers.toLocaleString()} followers</span>
        <span>{data.totalStars.toLocaleString()} ★ total</span>
        <span>{data.publicRepos} repos</span>
      </div>
      <ul className="mt-2 space-y-1">
        {data.topRepos.map((r) => (
          <li key={r.name} className="flex justify-between gap-3">
            <span className="truncate">
              {r.name}
              {r.language ? (
                <span className="text-faint"> · {r.language}</span>
              ) : null}
            </span>
            <span className="shrink-0 text-muted">
              {r.stars.toLocaleString()} ★
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OpenAlexView({ data }: { data: OpenAlexData }) {
  return (
    <div className="text-sm">
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-muted">
        <span>
          <b className="text-ink">{data.name}</b>
        </span>
        <span>{data.worksCount.toLocaleString()} works</span>
        <span>{data.citedByCount.toLocaleString()} citations</span>
        {data.hIndex != null && <span>h-index {data.hIndex}</span>}
      </div>
      <ul className="mt-2 space-y-1">
        {data.topWorks.map((w, i) => (
          <li key={`${w.title}-${i}`} className="flex justify-between gap-3">
            <span className="truncate">
              {w.title}
              {w.year ? <span className="text-faint"> · {w.year}</span> : null}
            </span>
            <span className="shrink-0 text-muted">
              {w.citations.toLocaleString()} cited
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg bg-panel px-3 py-1.5 text-sm text-muted">
      {children}
    </span>
  );
}

function TextField({
  label,
  placeholder,
  hint,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}
