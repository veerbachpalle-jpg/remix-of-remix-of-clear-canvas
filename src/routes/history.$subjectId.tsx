import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge, Head, levelTone, PortalShell, scoreText, serviceLabel, SignInRequired } from "@/components/portal";
import { cn } from "@/lib/utils";
import { canView, formatDate, usePortal } from "@/lib/referral-store";

export const Route = createFileRoute("/history/$subjectId")({
  head: ({ params }) => ({
    meta: [
      { title: `Case history ${params.subjectId} — Sahaay` },
      { name: "description", content: "Timeline of tests, reports, referrals, and actions for one case." },
      { property: "og:title", content: `Case history ${params.subjectId} — Sahaay` },
      { property: "og:description", content: "Timeline of tests, reports, referrals, and actions for one case." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HistoryPage,
});

type Event = { at: string; kind: "Test" | "Report" | "Referral" | "Action"; title: string; detail: string; reportId: string; tone: "primary" | "warn" | "ok" | "muted" | "alert" };

function HistoryPage() {
  const { subjectId } = Route.useParams();
  const { reports, session } = usePortal();
  const visible = reports.filter((r) => r.subjectId === subjectId && canView(session, r));
  if (!visible.length) return <PortalShell title="Case history"><SignInRequired message="Case history is only visible to Admin and services this case was referred to." /></PortalShell>;

  const events: Event[] = visible.flatMap((r) => [
    { at: r.createdAt, kind: "Test" as const, title: "Assessment completed", detail: "12 questions answered with consent.", reportId: r.id, tone: "muted" as const },
    { at: r.createdAt, kind: "Report" as const, title: `Report ${r.id} generated · ${r.overall}/100`, detail: r.summary, reportId: r.id, tone: levelTone(r.level) },
    ...r.referrals.map((ref) => ({ at: r.createdAt, kind: "Referral" as const, title: `Automatically referred to ${serviceLabel[ref.service]}`, detail: ref.reason, reportId: r.id, tone: "primary" as const })),
    ...r.actions.map((a) => ({ at: a.at, kind: "Action" as const, title: `${a.author} · ${a.action}`, detail: a.note, reportId: r.id, tone: "ok" as const })),
  ]);
  const order = { Test: 0, Report: 1, Referral: 2, Action: 3 };
  events.sort((a, b) => a.at.localeCompare(b.at) || order[a.kind] - order[b.kind]);

  return (
    <PortalShell title={`Case history · ${subjectId}`}>
      <div className="mb-4"><Link to="/dashboard/$role" params={{ role: session!.role }} className="text-sm text-primary">← Back to dashboard</Link></div>
      <div className="calm-in grid grid-cols-12 gap-4 lg:gap-5">
        <section className="workspace-card col-span-12 rounded-lg border border-border bg-card xl:col-span-8">
          <Head eyebrow={`${visible[0]!.subjectLabel} · ${visible.length} tests`} title="Tests → Reports → Referrals" />
          <ol className="p-5">
            {events.map((e, i) => (
              <li key={i} className="relative border-l border-border pb-5 pl-5 last:pb-0">
                <span className={cn("absolute -left-[4px] top-1.5 size-2 rounded-full", e.kind === "Referral" ? "bg-warning" : e.kind === "Action" ? "bg-success" : "bg-primary")} />
                <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[11px] text-muted-foreground">{formatDate(e.at)}</span><Badge tone={e.tone}>{e.kind}</Badge><Link to="/report/$reportId" params={{ reportId: e.reportId }} className="font-mono text-[11px] text-primary">{e.reportId}</Link></div>
                <p className="mt-1 text-sm font-medium">{e.title}</p>
                <p className="text-sm text-muted-foreground">{e.detail}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="workspace-card col-span-12 rounded-lg border border-border bg-card xl:col-span-4">
          <Head eyebrow="Score trend" title="Overall over time" />
          <div className="space-y-3 p-5">
            {[...visible].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((r) => (
              <div key={r.id}>
                <div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">{formatDate(r.createdAt)}</span><span className={cn("font-mono", scoreText(r.overall))}>{r.overall}</span></div>
                <div className="h-1.5 rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${r.overall}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PortalShell>
  );
}
