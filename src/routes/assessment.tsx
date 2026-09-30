import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Head, PortalShell } from "@/components/portal";
import { cn } from "@/lib/utils";
import { answerScale, questions, submitAssessment } from "@/lib/referral-store";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Wellbeing & safety check — Sahaay" },
      { name: "description", content: "A short, private questionnaire that generates a report and connects you to the right support." },
      { property: "og:title", content: "Wellbeing & safety check — Sahaay" },
      { property: "og:description", content: "A short, private questionnaire that generates a report and connects you to the right support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Assessment,
});

const PER_STEP = 3;
const steps = Math.ceil(questions.length / PER_STEP);

function Assessment() {
  const navigate = useNavigate();
  const [consent, setConsent] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [generating, setGenerating] = useState(false);
  const current = questions.slice(step * PER_STEP, step * PER_STEP + PER_STEP);
  const complete = current.every((q) => answers[q.id] !== undefined);

  const finish = () => {
    setGenerating(true);
    window.setTimeout(() => {
      const report = submitAssessment(answers);
      navigate({ to: "/report/$reportId", params: { reportId: report.id } });
    }, 1800);
  };

  if (generating) {
    return (
      <PortalShell title="Wellbeing & safety check">
        <section className="calm-in mx-auto max-w-xl rounded-lg border border-border bg-card p-10 text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-primary" />
          <p className="mt-4 text-base font-semibold">Generating your report...</p>
          <p className="mt-1 text-sm text-muted-foreground">Your answers are being scored and checked against referral criteria.</p>
        </section>
      </PortalShell>
    );
  }

  if (!consent) {
    return (
      <PortalShell title="Wellbeing & safety check">
        <section className="calm-in mx-auto max-w-xl rounded-lg border border-border bg-card">
          <Head eyebrow="Before you start" title="Your consent" />
          <div className="space-y-4 p-5 text-sm leading-6">
            <p>This check has {questions.length} short questions and takes about 3 minutes. There are no right or wrong answers.</p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Your answers generate a report with scores for anxiety, distress, safety risk, and legal need.</li>
              <li>Based on that report, the system may automatically refer your case to Police, Legal Aid, and/or Counselling.</li>
              <li>Only services your case is referred to can see it. The report is stored securely as a permanent record.</li>
            </ul>
            <label className="flex items-start gap-3 rounded-md border border-border bg-surface p-3">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 accent-[var(--primary)]" />
              <span>I understand and agree to take this check and to automatic referral based on my answers.</span>
            </label>
            <Button className="w-full" disabled={!agreed} onClick={() => setConsent(true)}><ShieldCheck />Start</Button>
          </div>
        </section>
      </PortalShell>
    );
  }

  return (
    <PortalShell title="Wellbeing & safety check">
      <section className="calm-in mx-auto max-w-2xl rounded-lg border border-border bg-card">
        <Head eyebrow={`Step ${step + 1} of ${steps}`} title="Over the last two weeks…" />
        <div className="px-5 pt-4">
          <div className="flex gap-1.5">{Array.from({ length: steps }).map((_, i) => <div key={i} className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-secondary")} />)}</div>
        </div>
        <div className="space-y-6 p-5">
          {current.map((q, i) => (
            <fieldset key={q.id}>
              <legend className="text-sm font-medium">{step * PER_STEP + i + 1}. {q.text}</legend>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {answerScale.map((label, v) => (
                  <button type="button" key={label} onClick={() => setAnswers({ ...answers, [q.id]: v })} className={cn("rounded-md border border-border bg-surface px-3 py-2 text-xs transition-colors hover:bg-surface-strong", answers[q.id] === v && "border-primary bg-primary/10 font-medium text-primary")}>{label}</button>
                ))}
              </div>
            </fieldset>
          ))}
          <div className="flex items-center justify-between border-t border-border pt-5">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft />Back</Button>
            {step < steps - 1 ? (
              <Button disabled={!complete} onClick={() => setStep(step + 1)}>Next<ArrowRight /></Button>
            ) : (
              <Button disabled={!complete} onClick={finish}><ShieldCheck />Submit</Button>
            )}
          </div>
        </div>
      </section>
    </PortalShell>
  );
}
