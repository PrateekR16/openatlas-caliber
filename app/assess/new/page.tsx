import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/AppHeader";
import { VISAS } from "@/lib/visas";

export default async function NewAssessment() {
  const session = await auth();
  if (!session) redirect("/signin");

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader email={session.user?.email} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <Link href="/assess" className="text-sm text-muted hover:text-ink">
          ← Back
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Which visa are you assessing for?
        </h1>
        <p className="mt-2 max-w-xl text-muted">
          Each uses the same engine — only the legal criteria change. Not sure?
          Start with the O-1A.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {VISAS.map((v) => (
            <Link
              key={v.id}
              href={`/assess/new/${v.id}`}
              className="group rounded-2xl border border-line bg-card p-6 transition hover:border-accent/50 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{v.name}</span>
                <span className="rounded-full bg-panel px-2.5 py-0.5 text-xs font-medium text-muted">
                  meet {v.threshold} of {v.criteria.length}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-muted">
                {v.fullName}
              </p>
              <p className="mt-3 text-sm text-muted">{v.tagline}</p>
              <span className="mt-4 inline-block text-sm font-medium text-accent">
                Start →
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
