import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/AppHeader";
import { PathwayTools } from "./PathwayTools";

export default async function Pathway() {
  const session = await auth();
  if (!session) redirect("/signin");

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader email={session.user?.email} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <p className="text-sm font-medium text-accent">F-1 / H-1B pathway</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Know your odds. See your options.
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          The student-to-worker path runs on lotteries and deadlines. Estimate
          your H-1B odds, check your STEM OPT eligibility, and see the
          no-lottery alternative.
        </p>

        <div className="mt-8">
          <PathwayTools />
        </div>
      </main>
    </div>
  );
}
