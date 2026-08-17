import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/AppHeader";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/signin");

  const welcome = (await searchParams).welcome === "1";

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader email={session.user?.email} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <p className="text-sm font-medium text-accent">
          {welcome ? "Welcome to Caliber" : "Profile"}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {welcome ? "Set up your profile" : "Your profile"}
        </h1>
        <p className="mt-2 max-w-xl text-muted">
          {welcome
            ? "Save your details once and every assessment prefills automatically. It's optional — you can skip and do this later."
            : "Optional — save your details once and every new assessment fills in automatically. Nothing here is required to run an assessment."}
        </p>

        <div className="mt-8">
          <ProfileForm welcome={welcome} />
        </div>
      </main>
    </div>
  );
}
