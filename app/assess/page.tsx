import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/AppHeader";
import { getProfile } from "@/lib/profile";

export default async function Assess() {
  const session = await auth();
  if (!session) redirect("/signin");

  const user = session.user;

  // First sign-in (no profile row yet) → send to onboarding. A DB error must
  // never block the dashboard, so failures fall through silently.
  if (user?.email) {
    let needsOnboarding = false;
    try {
      needsOnboarding = (await getProfile(user.email)) === null;
    } catch {
      needsOnboarding = false;
    }
    if (needsOnboarding) redirect("/profile?welcome=1");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader email={user?.email} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <p className="text-sm font-medium text-accent">
          Signed in{user?.name ? ` as ${user.name}` : ""}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Your assessments
        </h1>
        <p className="mt-2 max-w-xl text-muted">
          Start a new eligibility assessment for an achievement-based visa. Your
          results will be saved here.
        </p>

        <div className="mt-8 rounded-2xl border border-dashed border-line bg-card p-10 text-center">
          <p className="text-muted">
            No assessments yet. Start one to see where you stand.
          </p>
          <Link
            href="/assess/new"
            className="mt-4 inline-block rounded-lg bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent/90"
          >
            New assessment
          </Link>
        </div>
      </main>
    </div>
  );
}
