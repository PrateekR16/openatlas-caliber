"use client";

import Link from "next/link";
import { useState } from "react";
import { h1bOdds, stemOpt, H1B_SOURCE } from "@/lib/pathway";

export function PathwayTools() {
  const [capExempt, setCapExempt] = useState(false);
  const [advancedDegree, setAdvancedDegree] = useState(false);
  const [major, setMajor] = useState("");

  const odds = h1bOdds({ capExempt, advancedDegree });
  const stem = stemOpt(major);

  return (
    <div className="space-y-6">
      {/* H-1B odds */}
      <section className="rounded-2xl border border-line bg-card p-6">
        <h2 className="text-lg font-semibold">H-1B lottery odds</h2>
        <p className="mt-1 text-sm text-muted">
          The H-1B is capped and awarded by lottery. Estimate your realistic
          selection chance.
        </p>

        <div className="mt-4 space-y-2">
          <Toggle
            checked={advancedDegree}
            onChange={setAdvancedDegree}
            label="I have a U.S. master's degree or higher"
            hint="Adds a second selection round (the advanced-degree exemption)."
          />
          <Toggle
            checked={capExempt}
            onChange={setCapExempt}
            label="My employer is cap-exempt"
            hint="Universities, affiliated nonprofits, and nonprofit/government research orgs."
          />
        </div>

        <div className="mt-5 flex items-center gap-4 rounded-xl bg-panel px-5 py-4">
          <div className="text-3xl font-semibold text-accent">{odds.pct}%</div>
          <div className="border-l border-line pl-4">
            <p className="text-sm font-medium">Estimated selection chance</p>
            <p className="text-sm text-muted">{odds.note}</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-faint">Source: {H1B_SOURCE}.</p>
      </section>

      {/* STEM OPT */}
      <section className="rounded-2xl border border-line bg-card p-6">
        <h2 className="text-lg font-semibold">F-1 STEM OPT eligibility</h2>
        <p className="mt-1 text-sm text-muted">
          A STEM-designated degree unlocks a 24-month OPT extension — critical
          for getting more H-1B lottery attempts.
        </p>

        <label className="mt-4 block text-sm font-medium">Your degree or major</label>
        <input
          type="text"
          value={major}
          onChange={(e) => setMajor(e.target.value)}
          placeholder="e.g. Computer Science, Mechanical Engineering, Economics"
          className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
        />

        {major.trim() && (
          <div
            className={`mt-4 flex items-center gap-4 rounded-xl px-5 py-4 ${
              stem.stem ? "bg-green-soft" : "bg-amber-soft"
            }`}
          >
            <div
              className={`text-2xl font-semibold ${
                stem.stem ? "text-green" : "text-amber"
              }`}
            >
              {stem.totalOptMonths} mo
            </div>
            <div className="border-l border-line pl-4">
              <p
                className={`text-sm font-medium ${
                  stem.stem ? "text-green" : "text-amber"
                }`}
              >
                {stem.stem ? "Likely STEM-designated" : "Standard OPT"}
              </p>
              <p className="text-sm text-muted">{stem.note}</p>
            </div>
          </div>
        )}
      </section>

      {/* The bridge */}
      <section className="rounded-2xl border-2 border-accent/40 bg-accent-soft p-6">
        <h2 className="text-lg font-semibold text-accent">
          The H-1B is a gamble. There's a path without one.
        </h2>
        <p className="mt-2 text-sm text-ink">
          Your H-1B odds above are {odds.pct}% — capped, lottery-based, and tied
          to an employer. The <b>O-1A</b> and <b>EB-1A</b> have{" "}
          <b>no lottery and no cap</b>. If your record is strong, you may already
          qualify — find out in 60 seconds.
        </p>
        <Link
          href="/assess/new/o1a"
          className="mt-4 inline-block rounded-lg bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent/90"
        >
          Check your O-1 eligibility →
        </Link>
      </section>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line px-3 py-2.5 transition hover:border-ink/30">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-accent"
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted">{hint}</span>
      </span>
    </label>
  );
}
