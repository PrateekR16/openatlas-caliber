"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function ProfileForm({ welcome = false }: { welcome?: boolean }) {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [github, setGithub] = useState("");
  const [publications, setPublications] = useState("");
  const [field, setField] = useState("");
  const [salary, setSalary] = useState("");
  const [press, setPress] = useState<string[]>([""]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [savedResumeChars, setSavedResumeChars] = useState(0);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        const p = data.profile;
        if (p) {
          setGithub(p.github ?? "");
          setPublications(p.publications ?? "");
          setField(p.field ?? "");
          setSalary(p.salary ?? "");
          setPress(p.press?.length ? p.press : [""]);
          setSavedResumeChars(p.resumeText?.length ?? 0);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Load failed"))
      .finally(() => setLoaded(true));
  }, []);

  const setPressAt = (i: number, v: string) =>
    setPress((p) => p.map((x, idx) => (idx === i ? v : x)));
  const addPress = () => setPress((p) => [...p, ""]);
  const removePress = (i: number) =>
    setPress((p) => (p.length === 1 ? [""] : p.filter((_, idx) => idx !== i)));

  async function save() {
    setError(null);
    setStatus(null);
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("github", github.trim());
      fd.set("publications", publications.trim());
      fd.set("field", field.trim());
      fd.set("salary", salary.trim());
      press
        .map((p) => p.trim())
        .filter(Boolean)
        .forEach((p) => fd.append("press", p));
      if (resumeFile) fd.set("resume", resumeFile);

      const res = await fetch("/api/profile", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Failed (${res.status})`);
      if (welcome) {
        router.push("/assess");
        return;
      }
      setStatus("Saved. New assessments will prefill from this.");
      if (resumeFile) setSavedResumeChars(-1); // unknown length; just mark present
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function skip() {
    setSaving(true);
    try {
      // Save an empty profile so onboarding doesn't prompt again next visit.
      await fetch("/api/profile", { method: "POST", body: new FormData() });
    } catch {
      // ignore — worst case they see onboarding once more
    }
    router.push("/assess");
  }

  if (!loaded) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <div className="space-y-5">
        <Field label="GitHub" value={github} onChange={setGithub} placeholder="github.com/yourhandle" />
        <Field
          label="Publications"
          value={publications}
          onChange={setPublications}
          placeholder="openalex.org/A… or your full name"
        />

        <div>
          <label className="text-sm font-medium">Press / media links</label>
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
            {savedResumeChars > 0 || savedResumeChars === -1
              ? "A résumé is saved. Upload a new PDF to replace it."
              : "PDF — parsed and stored as text."}
          </p>
          <label className="mt-2 flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-line px-3 py-2.5 text-sm transition hover:border-accent">
            <span className={resumeFile ? "text-ink" : "text-muted"}>
              {resumeFile?.name ?? "Choose a PDF…"}
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
          <Field label="Your field" value={field} onChange={setField} placeholder="e.g. Machine learning" />
          <Field label="Annual salary" value={salary} onChange={setSalary} placeholder="e.g. $180,000" />
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {status && <p className="mt-4 text-sm text-green">{status}</p>}

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent/90 disabled:opacity-60"
        >
          {saving ? "Saving…" : welcome ? "Save and continue" : "Save profile"}
        </button>
        {welcome && (
          <button
            onClick={skip}
            disabled={saving}
            className="rounded-lg border border-line px-6 py-3 font-medium text-muted transition hover:text-ink disabled:opacity-60"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
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
