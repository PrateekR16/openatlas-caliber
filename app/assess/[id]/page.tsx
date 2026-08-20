import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAssessmentById, listTasksForAssessment } from "@/lib/db";
import { getVisa } from "@/lib/visas";
import { AppHeader } from "@/components/AppHeader";
import { AssessmentTabs } from "./AssessmentTabs";
import { DeleteAssessmentButton } from "./DeleteAssessmentButton";
import type { PanelResult } from "@/lib/agents/panel";
import type { EvidenceItem } from "@/lib/agents/extractor";

export default async function AssessmentDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.email) redirect("/signin");

  const assessment = await getAssessmentById(params.id, session.user.email);
  if (!assessment) {
    notFound();
  }

  const tasks = await listTasksForAssessment(params.id, session.user.email);
  const visa = getVisa(assessment.visaId);
  const result = assessment.result as unknown as PanelResult;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader email={session.user.email} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                {visa?.name ?? assessment.visaId}
              </h1>
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent capitalize">
                {assessment.domain}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">
              Created {new Date(assessment.createdAt).toLocaleDateString()}
            </p>
          </div>
          <DeleteAssessmentButton id={assessment.id} />
        </div>

        <div className="mt-12">
          <AssessmentTabs
            assessmentId={assessment.id}
            initialResult={result}
            initialEvidence={((assessment as unknown as { evidence?: EvidenceItem[] }).evidence) ?? []}
            initialTasks={tasks}
          />
        </div>
      </main>
    </div>
  );
}
