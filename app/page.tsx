import Link from "next/link";

const CRITERIA = [
  { label: "Scholarly articles", note: "14 papers · 380 citations", state: "met" },
  { label: "Original contributions", note: "OSS project · 4.2k stars", state: "met" },
  { label: "Judging others' work", note: "Reviewer, 2 conferences", state: "partial" },
  { label: "High salary", note: "Top 10% for role", state: "met" },
  { label: "Press coverage", note: "No qualifying media found", state: "gap" },
] as const;

const STEPS = [
  {
    n: "01",
    title: "Paste your profile",
    body: "Your CV, publications, GitHub, a few press links. No forms to fill by hand.",
  },
  {
    n: "02",
    title: "The panel deliberates",
    body: "For each legal criterion, one agent argues you meet it, one argues an officer would reject it, a third decides — grounded in the real USCIS standard.",
  },
  {
    n: "03",
    title: "Get your scorecard",
    body: "Which criteria you meet and why, where your gaps are and how to close them, and a first-draft petition letter to download.",
  },
];

const WEDGES = [
  {
    title: "Grounded, not guessed",
    body: "Every verdict cites the exact USCIS Policy Manual passage it reasoned from. No invented law.",
  },
  {
    title: "It argues both sides",
    body: "An Examiner agent predicts how an officer would push back — your likely RFE, before you ever file.",
  },
  {
    title: "A plan, not a yes/no",
    body: "Short a criterion? You get a concrete runway on what evidence would close the gap in your field.",
  },
];

const VISAS = ["O-1A", "EB-1A", "O-1B", "EB-1B", "EB-2 NIW"];

function StateDot({ state }: { state: "met" | "partial" | "gap" }) {
  const map = {
    met: "bg-green",
    partial: "bg-amber",
    gap: "bg-faint",
  };
  return <span className={`inline-block h-2 w-2 rounded-full ${map[state]}`} />;
}

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-line/70 bg-paper/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-sm font-bold text-white">
              C
            </div>
            <span className="text-[17px] font-semibold tracking-tight">Caliber</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#how" className="hidden text-muted hover:text-ink sm:inline">
              How it works
            </a>
            <a href="#visas" className="hidden text-muted hover:text-ink sm:inline">
              Visas
            </a>
            <Link
              href="/signin"
              className="rounded-lg border border-line bg-card px-4 py-2 font-medium text-ink transition hover:border-ink/30"
            >
              Sign in
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
            For extraordinary talent
          </span>
          <h1 className="mt-6 text-[40px] font-semibold leading-[1.05] tracking-tight sm:text-[52px]">
            Do you qualify for a US{" "}
            <span className="text-accent">extraordinary-ability</span> visa?
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Caliber reads your real achievements the way a USCIS officer would —
            and tells you which criteria you meet, why, and how to close the
            gaps. The $2,000, week-long lawyer assessment, done transparently in
            60 seconds.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/assess"
              className="rounded-lg bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent/90"
            >
              Check your eligibility
            </Link>
            <a
              href="#how"
              className="rounded-lg border border-line bg-card px-6 py-3 font-medium text-ink transition hover:border-ink/30"
            >
              See how it works
            </a>
          </div>
          <p className="mt-4 text-sm text-faint">
            Free · No legal fees · Shows its work against the real standard
          </p>
        </div>

        {/* Scorecard teaser */}
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-muted">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-accent-soft text-xs font-bold text-accent">
                C
              </span>
              O-1A readiness
            </div>
            <span className="text-xs text-faint">CV · Scholar · GitHub</span>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-xl bg-green-soft px-4 py-3">
            <div className="text-2xl font-semibold text-green">4 / 8</div>
            <div className="border-l border-line pl-3">
              <p className="text-sm font-semibold text-green">Likely eligible</p>
              <p className="text-xs text-muted">
                Needs 3 criteria met. You meet 4, with 2 more in reach.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {CRITERIA.map((c) => (
              <div
                key={c.label}
                className="flex items-center justify-between rounded-lg border border-line/70 px-3 py-2"
              >
                <div className="flex items-center gap-2.5">
                  <StateDot state={c.state} />
                  <span className="text-sm font-medium">{c.label}</span>
                </div>
                <span className="text-xs text-faint">{c.note}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-[11px] text-faint">
            Not legal advice · every score links to the USCIS standard it used
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-line bg-panel/50">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-2 max-w-xl text-muted">
            Three steps. The AI does the judgment work; deterministic code holds
            the legal rules and renders the verdict.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-xl border border-line bg-card p-6">
                <div className="text-sm font-bold text-accent">{s.n}</div>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visas */}
      <section id="visas" className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <h2 className="text-3xl font-semibold tracking-tight">
          One engine, a whole family of visas
        </h2>
        <p className="mt-2 max-w-xl text-muted">
          The same adversarial engine assesses every achievement-based visa —
          only the rule set changes.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {VISAS.map((v) => (
            <span
              key={v}
              className="rounded-lg border border-line bg-card px-4 py-2 font-medium"
            >
              {v}
            </span>
          ))}
          <span className="rounded-lg border border-dashed border-line px-4 py-2 text-muted">
            F-1 / H-1B pathway →
          </span>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {WEDGES.map((w) => (
            <div key={w.title} className="rounded-xl border border-line bg-card p-6">
              <h3 className="text-lg font-semibold">{w.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line bg-accent">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">
              Find out where you stand.
            </h2>
            <p className="mt-2 text-white/80">
              No legal fees. No sales call. Just your evidence against the real
              standard.
            </p>
          </div>
          <Link
            href="/assess"
            className="rounded-lg bg-white px-6 py-3 font-medium text-accent transition hover:bg-white/90"
          >
            Check your eligibility
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-col items-start justify-between gap-4 border-t border-line pt-8 text-sm text-faint sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid h-6 w-6 place-items-center rounded-md bg-accent text-xs font-bold text-white">
              C
            </div>
            <span className="font-medium text-muted">Caliber</span>
          </div>
          <p className="max-w-md">
            Caliber provides informational self-assessment only and is not a
            substitute for a licensed immigration attorney.
          </p>
        </div>
      </footer>
    </div>
  );
}
