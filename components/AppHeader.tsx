import Link from "next/link";
import { signOut } from "@/auth";

export function AppHeader({ email }: { email?: string | null }) {
  const initial = (email ?? "?").charAt(0).toUpperCase();
  return (
    <header className="border-b border-line bg-paper/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/assess" className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-sm font-bold text-white">
              C
            </div>
            <span className="text-[17px] font-semibold tracking-tight">
              Caliber
            </span>
          </Link>
          <nav className="hidden gap-5 text-sm text-muted sm:flex">
            <Link href="/assess" className="hover:text-ink">
              Assessments
            </Link>
            <Link href="/pathway" className="hover:text-ink">
              F-1 / H-1B
            </Link>
            <Link href="/policy-watch" className="hover:text-ink">
              Policy Watch
            </Link>
            <Link href="/profile" className="hover:text-ink">
              Profile
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
              {initial}
            </div>
            <span className="hidden text-muted sm:inline">{email}</span>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="rounded-lg border border-line bg-card px-3 py-1.5 text-sm font-medium transition hover:border-ink/30"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
