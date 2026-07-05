import { ShieldCheck, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { AdminClient } from "./admin-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { getAllExamsAdmin, getQuestionsByExamId } from "@/lib/data-service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin CMS — YouPass English",
  description: "Create and manage exams and questions.",
};

export default async function AdminPage() {
  const exams = await getAllExamsAdmin();

  const questionsEntries = await Promise.all(
    exams.map(async (e) => [e.id, await getQuestionsByExamId(e.id)] as const),
  );
  const questions = Object.fromEntries(questionsEntries);
  const questionCount = questionsEntries.reduce(
    (sum, [, qs]) => sum + qs.length,
    0,
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <section className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge
                variant="outline"
                className="mb-3 border-primary/25 bg-secondary text-primary"
              >
                Teacher workspace TRUNGANH
              </Badge>
              <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-foreground">
                <ShieldCheck
                  className="size-6 text-primary"
                  aria-hidden="true"
                />
                Admin CMS
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Build exams, manage questions, preview practice sets, and
                publish when ready.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:min-w-[240px]">
              <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
                <p className="text-xl font-black text-foreground">
                  {exams.length}
                </p>
                <p className="text-[11px] font-semibold text-muted-foreground">
                  Exams
                </p>
              </div>
              <div className="rounded-lg border border-border bg-brand-orange-light p-3 text-center">
                <p className="text-xl font-black text-brand-orange">
                  {questionCount}
                </p>
                <p className="text-[11px] font-semibold text-brand-orange/80">
                  Questions
                </p>
              </div>
            </div>
          </div>
        </section>

        <Alert className="mb-6 border-brand-orange/30 bg-brand-orange-light text-foreground">
          <Sparkles className="size-4 text-brand-orange" aria-hidden="true" />
          <AlertTitle className="font-black text-foreground">
            Access note
          </AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            Client-side admin checks are only a UX gate. Production protection
            should live in Firebase Auth custom claims and Firestore Security
            Rules. Set{" "}
            <code className="rounded bg-white/70 px-1 font-mono">
              NEXT_PUBLIC_ADMIN_EMAILS
            </code>{" "}
            to show the Admin nav link.
          </AlertDescription>
        </Alert>

        <AdminClient initialExams={exams} initialQuestions={questions} />
      </main>
    </div>
  );
}
