# Caliber

**Do you qualify for a US extraordinary-ability visa? Find out in 60 seconds — transparently, against the real USCIS standard.**

Caliber reads your real achievements the way a US immigration officer would, tells you which visa criteria you meet and *why*, shows how to close the gaps, and drafts a petition argument — turning a $1,000–$2,000, week-long lawyer assessment into a free, self-serve one. Built for the Open Atlas *AI for Social Good* Hackathon (Immigration & Mobility track).

> **Not legal advice.** Caliber provides an informational self-assessment only and is not a substitute for a licensed immigration attorney.

---

## The problem

The O-1 and EB-1A are US pathways for people of *extraordinary ability* — no lottery, no cap. But eligibility hinges on meeting a set of dense legal criteria most people can't map to their own résumé, and finding out costs a lawyer's fee and a week of back-and-forth. Meanwhile F-1 students and H-1B workers navigate lotteries and deadlines with no clear map. Caliber makes the assessment free, instant, and — critically — *transparent*.

## What it does

- **Eligibility assessment** — paste your GitHub, publications, press links, and résumé → get a scorecard: which criteria you meet, the argument for and against each, where the gaps are, and how to close them.
- **Draft petition letter** — a grounded cover-letter argument generated from your met criteria (honest when you're not yet eligible).
- **PDF export** — the full report (verdict + reasoning + runway + letter) as a downloadable packet.
- **Multiple visas** — O-1A, EB-1A, O-1B, EB-1B, EB-2 NIW. Same engine, different rule pack per visa.
- **F-1 / H-1B pathway** — H-1B lottery-odds estimator, F-1 STEM-OPT eligibility check, and a bridge into the no-lottery O-1/EB-1A path.
- **Policy Watch** — a live feed of recent US immigration rule changes (Federal Register), AI-summarized and tagged by visa, including F-1 and H-1B.
- **Optional profile** — save your details once (tied to your account) and every assessment prefills automatically.

## How it works — the AI architecture

Caliber's core principle is **AI proposes, code disposes**: the LLM extracts evidence and argues each criterion; deterministic code holds the legal rules, does all counting, and renders the verdict. This is what keeps it accurate enough to trust.

**Adversarial multi-agent panel.** US visa adjudication is inherently adversarial — a lawyer files the strongest case, an officer looks for reasons to deny (a Request for Evidence). Caliber mirrors that with a three-role panel, judged against a calibrated *standard of review* (it grades like a skeptical officer, not a supportive mentor):

- **Advocate** — argues the evidence *meets* each criterion, citing concrete facts.
- **Examiner** — argues how USCIS would push back — the likely RFE.
- **Adjudicator** — weighs both and returns a verdict (met / partial / gap) with confidence and reasoning.

> **Implementation note (honest):** the panel is currently a **single structured LLM call** that produces all three role outputs per criterion, rather than three independent model calls. This is a deliberate choice to stay within free-tier rate limits while preserving the adversarial framing and per-criterion Advocate/Examiner/Adjudicator output. Running the roles as *fully independent* calls on borderline criteria is a documented next step.

**The pipeline:** `sign in → pick visa → ingest sources → Extractor agent (structures evidence) → adversarial panel (judges each criterion) → deterministic count applies the N-of-M rule → scorecard + gap runway → draft letter → PDF`.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| UI | Tailwind CSS v4 |
| Auth | Auth.js (NextAuth v5) — Google OAuth |
| LLM | Groq (`llama-3.3-70b-versatile`) via its OpenAI-compatible API, JSON mode |
| Database | Postgres (Neon / Supabase) via `postgres.js` |
| PDF | Browser print-to-PDF (`@media print`) — no library |
| Deploy | Vercel-ready |

**Data sources (all free, online):** GitHub REST API, OpenAlex API (publications/citations), the Federal Register API (rule changes), résumé PDF parsing (`unpdf`), and published USCIS/DHS data for H-1B odds and STEM-OPT. LinkedIn was intentionally dropped — no usable API.

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

### Environment variables (`.env.local`)

| Variable | Where to get it |
|---|---|
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google Cloud Console → OAuth client (redirect URI `http://localhost:3000/api/auth/callback/google`) |
| `GROQ_API_KEY` | [console.groq.com/keys](https://console.groq.com/keys) (free) |
| `DATABASE_URL` | A free Postgres DB at [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com) |

The database schema is created automatically on first use — no migration step.

## Project structure

```
app/                     routes (landing, /assess, /policy-watch, /pathway, /profile) + API routes
components/AppHeader.tsx  shared header/nav
lib/
  agents/                extractor, panel (adversarial), letter, policy classifier, llm (Groq client)
  sources/               github, openalex, résumé parsing
  policy/                Federal Register fetch + Policy Watch
  visas.ts               the visa rule packs (criteria + thresholds)
  pathway.ts             H-1B odds + STEM-OPT logic (deterministic)
  db.ts, profile.ts      Postgres + profile store
scripts/                 standalone smoke tests (run with `npx tsx scripts/test-*.mts`)
```

## What's next

- Fully independent Advocate/Examiner/Adjudicator calls on borderline criteria.
- Saved assessment history and personalized Policy Watch alerts (the DB is already in place).
- Per-visa calibration for O-1B (arts) and EB-2 NIW (the Dhanasar test).
- Real BLS wage integration for the salary criterion.
