import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpenText, Download, FileText, HeartPulse, History, LogOut, Plus, Shield, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  addAction,
  categoryLabel,
  downloadProof,
  formatDate,
  portalRoles,
  signOut,
  usePortal,
  type Category,
  type Report,
  type Service,
} from "@/lib/referral-store";

export const inputClass = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none";

export function quickExit() {
  window.location.href = "https://www.google.com/search?q=weather";
}

export function Head({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4 border-b border-border px-5 py-4">
      <div className="min-w-0">
        {eyebrow ? <p className="font-mono text-[10px] uppercase text-muted-foreground">{eyebrow}</p> : null}
        <h2 className="mt-0.5 truncate text-base font-semibold">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Badge({ tone, children }: { tone: "ok" | "warn" | "muted" | "alert" | "primary"; children: React.ReactNode }) {
  const tones = {
    ok: "border-success/30 bg-success/10 text-success",
    warn: "border-warning/30 bg-warning/10 text-warning",
    alert: "border-emergency/30 bg-emergency/10 text-emergency",
    primary: "border-primary/30 bg-primary/10 text-primary",
    muted: "border-border bg-secondary text-muted-foreground",
  };
  return <span className={cn("inline-flex rounded border px-2 py-0.5 font-mono text-[10px]", tones[tone])}>{children}</span>;
}

export const levelTone = (level: Report["level"]) => (level === "Critical" ? "alert" : level === "High" ? "warn" : level === "Moderate" ? "primary" : "ok");
export const scoreText = (s: number) => (s >= 75 ? "text-emergency" : s >= 50 ? "text-warning" : "text-success");
const scoreBar = (s: number) => (s >= 75 ? "bg-emergency" : s >= 50 ? "bg-warning" : "bg-primary");
export const serviceIcon: Record<Service, typeof Shield> = { Police: Shield, Legal: BookOpenText, Counselling: HeartPulse };
export const serviceLabel: Record<Service, string> = { Police: "Police", Legal: "Legal Aid", Counselling: "Counselling" };

export function PortalShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const { session } = usePortal();
  const navigate = useNavigate();
  const roleLabel = portalRoles.find((r) => r.id === session?.role)?.label;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b border-border bg-card/90 px-4 shadow-sm backdrop-blur lg:px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground shadow-sm">SA</div>
          <div className="hidden leading-tight sm:block">
            <p className="font-semibold text-primary">Sahaay</p>
            <p className="font-mono text-[10px] uppercase text-muted-foreground">response network</p>
          </div>
        </Link>
        <div className="ml-2 min-w-0 border-l border-border pl-4">
          <h1 className="truncate text-lg font-semibold">{title}</h1>
          <p className="hidden font-mono text-[10px] text-muted-foreground sm:block">{subtitle ?? "Protected session · identifiers masked"}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {session ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-success/25 bg-success/10 px-3 py-2 text-xs text-success md:flex"><span className="size-2 rounded-full bg-success pulse" />{roleLabel} · {session.name}</div>
              <Button variant="outline" size="sm" onClick={() => { signOut(); navigate({ to: "/login", replace: true }); }}><LogOut />Sign out</Button>
            </>
          ) : (
            <Button variant="outline" size="sm" asChild><Link to="/login">Sign in</Link></Button>
          )}
          <Button variant="emergency" onClick={quickExit}>Quick exit</Button>
        </div>
      </header>
      <div className="mx-auto max-w-[1500px] p-4 lg:p-6">{children}</div>
    </div>
  );
}

export function SignInRequired({ message }: { message: string }) {
  return (
    <section className="calm-in mx-auto max-w-md rounded-lg border border-border bg-card">
      <Head eyebrow="Access protected" title="Please sign in" />
      <div className="space-y-4 p-5 text-sm">
        <p className="text-muted-foreground">{message}</p>
        <Button asChild className="w-full"><Link to="/login"><ShieldCheck />Go to sign in</Link></Button>
      </div>
    </section>
  );
}

export function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs"><span className="text-muted-foreground">{label}</span><span className="font-mono">{value}/100</span></div>
      <div className="h-1.5 rounded-full bg-secondary"><div className={cn("h-full rounded-full", scoreBar(value))} style={{ width: `${value}%` }} /></div>
    </div>
  );
}

export function ReferralNotice({ report, audience }: { report: Report; audience: "victim" | "staff" }) {
  if (!report.referrals.length) {
    return (
      <div className="rounded-md border border-success/30 bg-success/10 p-4">
        <p className="font-mono text-[10px] uppercase text-success">No immediate referral needed</p>
        <p className="mt-1.5 text-sm">{audience === "victim" ? "Based on your responses, no referral threshold was met. Support is still here whenever you need it." : "The report did not meet any referral threshold."}</p>
      </div>
    );
  }
  return (
    <div className="rounded-md border border-primary/25 bg-surface p-4">
      <p className="font-mono text-[10px] uppercase text-primary">Referral generated by the report</p>
      <p className="mt-1.5 text-sm font-medium">
        {audience === "victim" ? "Based on your responses, this case has been referred to: " : "Based on the responses, this case was automatically referred to: "}
        {report.referrals.map((r) => serviceLabel[r.service]).join(", ")}
      </p>
      <div className="mt-3 space-y-2">
        {report.referrals.map((r) => {
          const Icon = serviceIcon[r.service];
          return (
            <div key={r.service} className="flex gap-3 rounded-md border border-border bg-card p-3">
              <div className="grid size-8 shrink-0 place-items-center rounded bg-primary/10 text-primary"><Icon className="size-4" /></div>
              <div><p className="text-sm font-medium">{serviceLabel[r.service]}</p><p className="mt-0.5 text-xs leading-5 text-muted-foreground">{r.reason}</p></div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">This decision was made automatically from the test answers, not by a person. A professional from each service will review it.</p>
    </div>
  );
}

const resources = [
  { title: "Women Helpline 181", note: "24×7 confidential support and guidance" },
  { title: "One Stop Centre Scheme", note: "Integrated support and temporary shelter" },
  { title: "Tele-MANAS 14416", note: "Free mental health support in your language" },
  { title: "Free Legal Aid", note: "Eligible under Section 12, LSA Act" },
];

export function ReportView({ report, audience }: { report: Report; audience: "victim" | "staff" }) {
  const cats = Object.keys(report.scores) as Category[];
  return (
    <div className="calm-in grid grid-cols-12 gap-4 lg:gap-5">
      <section className="workspace-card col-span-12 rounded-lg border border-border bg-card xl:col-span-7">
        <Head eyebrow={`${report.id} · generated ${formatDate(report.createdAt)}`} title={audience === "victim" ? "Your report" : `Report for ${report.subjectLabel}`} action={<Badge tone={levelTone(report.level)}>{report.level}</Badge>} />
        <div className="p-5">
          <div className="flex items-end gap-2"><span className={cn("font-mono text-5xl font-semibold", scoreText(report.overall))}>{report.overall}</span><span className="mb-1 text-sm text-muted-foreground">/ 100 · overall</span></div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary"><div className={cn("h-full", scoreBar(report.overall))} style={{ width: `${report.overall}%` }} /></div>
          <p className="mt-5 text-sm leading-6">{report.summary}</p>
          <div className="mt-6 space-y-4">{cats.map((c) => <Metric key={c} label={categoryLabel[c]} value={report.scores[c]} />)}</div>
        </div>
      </section>
      <aside className="col-span-12 space-y-4 xl:col-span-5">
        <section className="workspace-card rounded-lg border border-border bg-card">
          <Head eyebrow="Automatic decision" title="Referrals" />
          <div className="p-5"><ReferralNotice report={report} audience={audience} /></div>
        </section>
        {audience === "victim" ? (
          <section className="workspace-card rounded-lg border border-border bg-card">
            <Head eyebrow="Available any time" title="Self-help resources" />
            <div className="space-y-3 p-5">{resources.map((r) => <div key={r.title} className="rounded-md border border-border bg-surface p-3"><p className="text-sm font-medium">{r.title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{r.note}</p></div>)}</div>
          </section>
        ) : null}
      </aside>
    </div>
  );
}

export function ActionLog({ report, service, author }: { report: Report; service?: Service | "Admin"; author?: string }) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState("Follow-up call scheduled");
  const [note, setNote] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !author || !note.trim()) return;
    addAction(report.id, { service, author, action, note: note.trim() });
    setNote("");
    setOpen(false);
  };
  return (
    <section className="workspace-card rounded-lg border border-border bg-card">
      <Head eyebrow={`${report.actions.length} entries · report itself is read-only`} title="Action log" action={service && !open ? <Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus />Log action</Button> : null} />
      {open ? (
        <form onSubmit={submit} className="space-y-3 border-b border-border p-4">
          <label className="block"><span className="text-xs text-muted-foreground">Action taken</span>
            <select value={action} onChange={(e) => setAction(e.target.value)} className={cn(inputClass, "mt-1.5")}>
              {["Follow-up call scheduled", "Site visit completed", "FIR / complaint registered", "Session scheduled", "Counselling session held", "Legal aid appointment booked", "Shelter arranged", "No action required"].map((a) => <option key={a}>{a}</option>)}
            </select>
          </label>
          <label className="block"><span className="text-xs text-muted-foreground">Notes</span><textarea required value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none" placeholder="Record only details needed for the case" /></label>
          <div className="flex gap-2"><Button type="submit" className="flex-1">Save entry</Button><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button></div>
        </form>
      ) : null}
      <ol className="p-5">
        {report.actions.map((a, i) => (
          <li key={i} className="relative border-l border-border pb-5 pl-5 last:pb-0">
            <span className="absolute -left-[4px] top-1.5 size-2 rounded-full bg-primary" />
            <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[11px] text-muted-foreground">{formatDate(a.at)}</span><span className="text-xs font-medium">{a.author}</span><Badge tone="muted">{a.service}</Badge></div>
            <p className="mt-1 text-sm font-medium">{a.action}</p>
            <p className="text-sm text-muted-foreground">{a.note}</p>
          </li>
        ))}
        {report.actions.length === 0 ? <p className="text-center text-sm text-muted-foreground">No actions logged yet.</p> : null}
      </ol>
    </section>
  );
}

export function ReportRow({ report, selected, onSelect }: { report: Report; selected?: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className={cn("interactive-row grid w-full grid-cols-[1fr_auto] gap-4 border-l-[3px] border-l-transparent px-5 py-4 text-left hover:bg-accent/70 md:grid-cols-[1.4fr_.6fr_1fr_auto]", selected && "border-l-primary bg-primary/10")}>
      <div className="min-w-0"><div className="flex items-center gap-2"><span className="font-mono text-xs text-primary">{report.id}</span><span className="font-mono text-[10px] text-muted-foreground">{report.subjectId}</span></div><p className="mt-1 truncate text-sm font-medium">{report.subjectLabel}</p><p className="mt-0.5 text-xs text-muted-foreground">{formatDate(report.createdAt)}</p></div>
      <div className="hidden self-center md:block"><p className={cn("font-mono text-lg font-semibold", scoreText(report.overall))}>{report.overall}</p><p className="text-[10px] text-muted-foreground">OVERALL</p></div>
      <div className="hidden flex-wrap gap-1 self-center md:flex">{report.referrals.length ? report.referrals.map((r) => <Badge key={r.service} tone="primary">{serviceLabel[r.service]}</Badge>) : <Badge tone="ok">No referral</Badge>}</div>
      <div className="flex flex-col items-end gap-1 self-center"><Badge tone={levelTone(report.level)}>{report.level}</Badge><span className="text-[10px] text-muted-foreground">{report.status}</span></div>
    </button>
  );
}

export function CaseDetail({ report, service, author }: { report: Report; service?: Service | "Admin"; author?: string }) {
  const mine = service && service !== "Admin" ? report.referrals.find((r) => r.service === service) : undefined;
  return (
    <div className="space-y-4">
      <section className="workspace-card rounded-lg border border-border bg-card">
        <Head eyebrow={`Selected · ${report.id}`} title="Report summary" action={<Badge tone={levelTone(report.level)}>{report.level}</Badge>} />
        <div className="space-y-4 p-5">
          <p className="text-sm leading-6">{report.summary}</p>
          {mine ? <div className="rounded-md border border-primary/25 bg-surface p-3"><p className="font-mono text-[10px] uppercase text-primary">Why this was referred to you</p><p className="mt-1.5 text-xs leading-5">{mine.reason}</p></div> : <ReferralNotice report={report} audience="staff" />}
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm"><Link to="/report/$reportId" params={{ reportId: report.id }}><FileText />Full report</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to="/history/$subjectId" params={{ subjectId: report.subjectId }}><History />Case history</Link></Button>
            {service === "Admin" ? <Button size="sm" variant="outline" onClick={() => downloadProof(report)}><Download />Proof document</Button> : null}
          </div>
        </div>
      </section>
      <ActionLog report={report} service={service} author={author} />
    </div>
  );
}
