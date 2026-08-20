import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/AppHeader";
import { getVisa } from "@/lib/visas";
import { AssessmentForm } from "./AssessmentForm";

export default async function VisaInput({
  params,
}: {
  params: Promise<{ visa: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/signin");

  const { visa: visaId } = await params;
  const visa = getVisa(visaId);
  if (!visa) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader email={session.user?.email} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <Link href="/assess/new" className="text-sm text-muted hover:text-ink">
          ← Choose a different visa
        </Link>
        <div className="mt-3 flex items-baseline gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{visa.name}</h1>
          <span className="text-muted">{visa.fullName}</span>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_18rem]">
          <AssessmentForm
            visaId={visa.id}
            visaName={visa.name}
            visaFullName={visa.fullName}
            criteria={visa.criteria.map((c) => ({ id: c.id, label: c.label }))}
          />

          <aside className="order-first lg:order-last">
            <div className="rounded-2xl border border-line bg-card p-5">
              <p className="text-sm font-semibold">
                We'll assess you against
              </p>
              <p className="mt-1 text-xs text-muted">
                Meet {visa.threshold} of these {visa.criteria.length} to qualify.
              </p>
              <ul className="mt-3 space-y-2">
                {visa.criteria.map((c) => (
                  <li key={c.id} className="flex gap-2 text-sm text-muted">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-line" />
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
