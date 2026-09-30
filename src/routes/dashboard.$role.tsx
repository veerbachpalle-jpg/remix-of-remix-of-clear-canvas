import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ClipboardList, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, CaseDetail, Head, levelTone, PortalShell, ReportRow, serviceLabel, SignInRequired } from "@/components/portal";
import { cn } from "@/lib/utils";
import { downloadProof, formatDate, portalRoles, usePortal, type ReportStatus, type Service } from "@/lib/referral-store";

export const Route = createFileRoute("/dashboard/$role")({
  head: ({ params }) => {
    const label = portalRoles.find((r) => r.id === params.role)?.label ?? "Role";
    return {
      meta: [
        { title: `${label} dashboard — Sahaay` },
        { name: "description", content: `Cases referred to ${label}, generated from assessment reports.` },
        { property: "og:title", content: `${label} dashboard — Sahaay` },
        { property: "og:description", content: `Cases referred to ${label}, generated from assessment reports.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: Dashboard,
});

function Dashboard() {
  const { role } = Route.useParams();
  const { session } = usePortal();
  const meta = portalRoles.find((r) => r.id === role);
  if (!meta || !session || session.role !== role) {
    return <PortalShell title="Dashboard"><SignInRequired message={`Sign in as ${meta?.label ?? "the right role"} to see this dashboard.`} /></PortalShell>;
  }
  if (role === "victim") return <VictimDashboard />;
  if (role === "admin") return <AdminDashboard />;
  return <ServiceDashboard service={meta.service!} label={meta.label} />;
}

function VictimDashboard() {
  const { reports, session } = usePortal();
  const navigate = useNavigate();
  const mine = reports.filter((r) => r.subjectId === session!.subjectId);
  return (
    <PortalShell title="Your support space">
      <div className="calm-in grid grid-cols-12 gap-4 lg:gap-5">
        <section className="workspace-card col-span-12 rounded-lg border border-border bg-card xl:col-span-4">
          <Head eyebrow="Private and confidential" title="Wellbeing & safety check" />
          <div className="space-y-4 p-5 text-sm">
            <p className="text-muted-foreground">Answer a few short questions. Your answers generate a report, and the report decides whether to connect you with Police, Legal Aid, or Counselling.</p>
            <Button asChild className="w-full"><Link to="/assessment"><ClipboardList />Take the check</Link></Button>
          </div>
        </section>
        <section className="workspace-card col-span-12 overflow-hidden rounded-lg border border-border bg-card xl:col-span-8">
          <Head eyebrow={`${mine.length} reports`} title="Your reports" />
          <div className="divide-y divide-border">
            {mine.map((r) => <ReportRow key={r.id} report={r} onSelect={() => navigate({ to: "/report/$reportId", params: { reportId: r.id } })} />)}
            {mine.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No reports yet. Take the check to generate your first report.</p> : null}
          </div>
        </section>
      </div>
    </PortalShell>
  );
}

function ServiceDashboard({ service, label }: { service: Service; label: string }) {
  const { reports, session } = usePortal();
  const referred = reports.filter((r) => r.referrals.some((x) => x.service === service));
  const [selectedId, setSelectedId] = useState(referred[0]?.id);
  const selected = referred.find((r) => r.id === selectedId) ?? referred[0];
  return (
    <PortalShell title={`${label} dashboard`} subtitle={`Only cases the reports referred to ${serviceLabel[service]}`}>
      <div className="calm-in grid grid-cols-12 gap-4 lg:gap-5">
        <section className="workspace-card col-span-12 overflow-hidden rounded-lg border border-border bg-card xl:col-span-7">
          <Head eyebrow={`${referred.length} referred · generated from reports`} title="Referred cases" />
          <div className="divide-y divide-border">
            {referred.map((r) => <ReportRow key={r.id} report={r} selected={selected?.id === r.id} onSelect={() => setSelectedId(r.id)} />)}
            {referred.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No cases referred to {serviceLabel[service]} yet.</p> : null}
          </div>
        </section>
        <div className="col-span-12 xl:col-span-5">{selected ? <CaseDetail report={selected} service={service} author={session!.name} /> : null}</div>
      </div>
    </PortalShell>
  );
}

function AdminDashboard() {
  const { reports, session } = usePortal();
  const [type, setType] = useState<"All" | Service | "None">("All");
  const [status, setStatus] = useState<"All" | ReportStatus>("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const filtered = useMemo(() => reports.filter((r) => {
    if (type === "None" && r.referrals.length) return false;
    if (type !== "All" && type !== "None" && !r.referrals.some((x) => x.service === type)) return false;
    if (status !== "All" && r.status !== status) return false;
    const d = r.createdAt.slice(0, 10);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  }), [reports, type, status, from, to]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const selected = filtered.find((r) => r.id === selectedId) ?? filtered[0];
  const count = (s: Service) => reports.filter((r) => r.referrals.some((x) => x.service === s)).length;
  const sel = "h-8 rounded-md border border-input bg-background px-2 text-xs outline-none";

  return (
    <PortalShell title="Admin dashboard" subtitle="All tests, reports, and referrals">
      <div className="calm-in mb-4 grid grid-cols-2 gap-4 lg:mb-5 lg:grid-cols-4">
        {[["Tests & reports", reports.length], ["Police referrals", count("Police")], ["Legal Aid referrals", count("Legal")], ["Counselling referrals", count("Counselling")]].map(([l, v]) => (
          <section key={l} className="workspace-card rounded-lg border border-border bg-card p-5"><p className="font-mono text-[10px] uppercase text-muted-foreground">{l}</p><p className="mt-2 font-mono text-3xl font-semibold">{v}</p></section>
        ))}
      </div>
      <div className="calm-in grid grid-cols-12 gap-4 lg:gap-5">
        <section className="workspace-card col-span-12 overflow-hidden rounded-lg border border-border bg-card xl:col-span-7">
          <Head eyebrow={`${filtered.length} of ${reports.length}`} title="All reports" />
          <div className="flex flex-wrap gap-2 border-b border-border p-3">
            <select aria-label="Referral type" value={type} onChange={(e) => setType(e.target.value as typeof type)} className={sel}><option value="All">All referrals</option><option value="Police">Police</option><option value="Legal">Legal Aid</option><option value="Counselling">Counselling</option><option value="None">No referral</option></select>
            <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={sel}>{["All", "Open", "In progress", "Closed"].map((s) => <option key={s}>{s}</option>)}</select>
            <input aria-label="From date" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={sel} />
            <input aria-label="To date" type="date" value={to} onChange={(e) => setTo(e.target.value)} className={sel} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-border font-mono text-[10px] uppercase text-muted-foreground"><tr><th className="px-5 py-3">Report</th><th>Subject</th><th>Level</th><th>Referred to</th><th>Status</th><th /></tr></thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.id} onClick={() => setSelectedId(r.id)} className={cn("cursor-pointer hover:bg-accent", selected?.id === r.id && "bg-primary/10")}>
                    <td className="px-5 py-3"><p className="font-mono text-primary">{r.id}</p><p className="text-[11px] text-muted-foreground">{formatDate(r.createdAt)}</p></td>
                    <td><p className="font-medium">{r.subjectLabel}</p><p className="font-mono text-[11px] text-muted-foreground">{r.subjectId}</p></td>
                    <td><Badge tone={levelTone(r.level)}>{r.level} · {r.overall}</Badge></td>
                    <td><div className="flex flex-wrap gap-1">{r.referrals.length ? r.referrals.map((x) => <Badge key={x.service} tone="primary">{serviceLabel[x.service]}</Badge>) : <Badge tone="ok">None</Badge>}</div></td>
                    <td className="text-xs">{r.status}</td>
                    <td className="pr-3"><Button size="icon" variant="ghost" className="size-7" aria-label={`Download proof for ${r.id}`} onClick={(e) => { e.stopPropagation(); void downloadProof(r); }}><Download className="size-3.5" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No reports match these filters.</p> : null}
          </div>
        </section>
        <div className="col-span-12 xl:col-span-5">{selected ? <CaseDetail report={selected} service="Admin" author={session!.name} /> : null}</div>
      </div>
    </PortalShell>
  );
}
