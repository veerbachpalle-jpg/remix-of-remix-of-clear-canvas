import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionLog, PortalShell, ReportView, SignInRequired } from "@/components/portal";
import { canView, downloadProof, usePortal } from "@/lib/referral-store";

export const Route = createFileRoute("/report/$reportId")({
  head: ({ params }) => ({
    meta: [
      { title: `Report ${params.reportId} — Sahaay` },
      { name: "description", content: "Generated assessment report with category scores and automatic referral decisions." },
      { property: "og:title", content: `Report ${params.reportId} — Sahaay` },
      { property: "og:description", content: "Generated assessment report with category scores and automatic referral decisions." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { reportId } = Route.useParams();
  const { reports, session } = usePortal();
  const report = reports.find((r) => r.id === reportId);

  if (!report || !canView(session, report)) {
    return <PortalShell title="Report"><SignInRequired message="This report is only visible to the person who took the test, the services it was referred to, and Admin." /></PortalShell>;
  }
  const audience = session?.role === "victim" ? "victim" : "staff";

  return (
    <PortalShell title={`Report ${report.id}`}>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm"><Link to="/dashboard/$role" params={{ role: session!.role }}>Back to dashboard</Link></Button>
        {audience === "staff" ? <Button asChild variant="outline" size="sm"><Link to="/history/$subjectId" params={{ subjectId: report.subjectId }}><History />Case history</Link></Button> : null}
        {session?.role === "admin" ? <Button size="sm" variant="outline" onClick={() => downloadProof(report)}><Download />Proof document</Button> : null}
      </div>
      <ReportView report={report} audience={audience} />
      {audience === "staff" ? <div className="mt-4 lg:mt-5"><ActionLog report={report} /></div> : null}
    </PortalShell>
  );
}
