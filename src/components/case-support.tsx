import { useState } from "react";
import { Check, Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Role = "Citizen" | "Operator" | "Police" | "Mental Health" | "Legal" | "Admin";
type Scope = "Police" | "Legal" | "Health" | "All";
type AlertStatus = "Open" | "Reviewed" | "Actioned";

const reviewerName: Record<Role, string> = {
  Citizen: "Citizen",
  Operator: "Case Worker 07",
  Police: "Inspector R. Mehta",
  "Mental Health": "Counselor A. Nair",
  Legal: "Advocate S. Iyer",
  Admin: "Admin 01",
};

const roleScope: Record<Role, Scope[]> = {
  Citizen: ["All"],
  Operator: ["All"],
  Police: ["Police", "All"],
  "Mental Health": ["Health", "All"],
  Legal: ["Legal", "All"],
  Admin: ["Police", "Legal", "Health", "All"],
};

const inputClass = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none";

function Head({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
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

function Badge({ tone, children }: { tone: "ok" | "warn" | "muted" | "alert"; children: React.ReactNode }) {
  const tones = {
    ok: "border-success/30 bg-success/10 text-success",
    warn: "border-warning/30 bg-warning/10 text-warning",
    alert: "border-emergency/30 bg-emergency/10 text-emergency",
    muted: "border-border bg-secondary text-muted-foreground",
  };
  return <span className={cn("inline-flex rounded border px-2 py-0.5 font-mono text-[10px]", tones[tone])}>{children}</span>;
}

/* ---------------- Alert panel ---------------- */

type AlertState = { status: AlertStatus; finding?: string; action?: string; reviewer?: string };

export function AlertPanel({ caseId, score, role, notify }: { caseId: string; score: number; role: Role; notify: (m: string) => void }) {
  const [alerts, setAlerts] = useState<Record<string, AlertState>>({ "SH-2832": { status: "Actioned", finding: "Client confirmed need for protection order filing.", action: "Legal aid appointment booked", reviewer: "Advocate S. Iyer" } });
  const [open, setOpen] = useState(false);
  const [finding, setFinding] = useState("");
  const [action, setAction] = useState("Follow-up call scheduled");
  const current = alerts[caseId] ?? { status: "Open" as AlertStatus };
  const factors = [
    { label: "Immediate safety", weight: Math.min(95, score + 4) },
    { label: "Emotional distress", weight: Math.max(20, score - 8) },
    { label: "Available support", weight: Math.max(15, 100 - score) },
  ];
  const canReview = role !== "Citizen";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finding.trim()) return;
    setAlerts({ ...alerts, [caseId]: { status: action === "No action required" ? "Reviewed" : "Actioned", finding: finding.trim(), action, reviewer: reviewerName[role] } });
    setOpen(false);
    setFinding("");
    notify(`Alert for ${caseId} reviewed by ${reviewerName[role]}`);
  };

  return (
    <div className="mt-5 rounded-md border border-primary/25 bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase text-primary">Alert for review</p>
        <Badge tone={current.status === "Open" ? "warn" : "ok"}>{current.status}</Badge>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Score {score} · decision rests with the assigned professional</p>
      <div className="mt-3 space-y-2.5">
        {factors.map((f) => (
          <div key={f.label}>
            <div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">{f.label}</span><span className="font-mono">{f.weight}</span></div>
            <div className="h-1.5 rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${f.weight}%` }} /></div>
          </div>
        ))}
      </div>
      {current.finding ? (
        <div className="mt-4 rounded-md border border-border bg-card p-3 text-xs">
          <p className="font-mono text-[10px] uppercase text-muted-foreground">Reviewed by {current.reviewer}</p>
          <p className="mt-1.5 leading-5">{current.finding}</p>
          <p className="mt-1.5 text-muted-foreground">Action: {current.action}</p>
        </div>
      ) : null}
      {canReview && !open ? <Button className="mt-4 w-full" variant={current.status === "Open" ? "default" : "outline"} onClick={() => setOpen(true)}><Check />{current.status === "Open" ? "Mark as reviewed" : "Update review"}</Button> : null}
      {open ? (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block"><span className="text-xs text-muted-foreground">Reviewer finding</span><textarea required value={finding} onChange={(e) => setFinding(e.target.value)} rows={3} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none" /></label>
          <label className="block"><span className="text-xs text-muted-foreground">Action taken</span>
            <select value={action} onChange={(e) => setAction(e.target.value)} className={cn(inputClass, "mt-1.5")}>
              {["Follow-up call scheduled", "Police visit requested", "Counselling referral made", "Legal aid appointment booked", "Shelter arranged", "No action required"].map((a) => <option key={a}>{a}</option>)}
            </select>
          </label>
          <div className="flex gap-2"><Button type="submit" className="flex-1">Save review</Button><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button></div>
        </form>
      ) : null}
    </div>
  );
}

/* ---------------- Victim support status ---------------- */

type SupportItem = { key: string; label: string; status: string; options: string[]; detail?: string; days?: number };

const initialSupport = (): SupportItem[] => [
  { key: "legal", label: "Legal aid", status: "Provided", options: ["Provided", "Pending"], days: 3 },
  { key: "relief", label: "Relief", status: "Pending", options: ["Provided", "Pending"], detail: "" },
  { key: "rehab", label: "Rehabilitation", status: "No", options: ["Yes", "No"], detail: "" },
  { key: "medical", label: "Medical assistance", status: "Yes", options: ["Yes", "No"], detail: "14 Sep 2026", days: 1 },
  { key: "travel", label: "Travel / maintenance", status: "Not applicable", options: ["Provided", "Pending", "Not applicable"] },
  { key: "c-ref", label: "Counselling referred", status: "Yes", options: ["Yes", "No"], detail: "12 Sep 2026", days: 0 },
  { key: "c-rec", label: "Counselling received", status: "No", options: ["Yes", "No"], detail: "" },
  { key: "protect", label: "Protection measures", status: "Pending", options: ["Provided", "Pending", "Not applicable"] },
];

function tone(status: string): "ok" | "warn" | "muted" {
  if (["Provided", "Yes"].includes(status)) return "ok";
  if (status === "Not applicable") return "muted";
  return "warn";
}

export function SupportStatus({ caseId, role, notify }: { caseId: string; role: Role; notify: (m: string) => void }) {
  const [data, setData] = useState<Record<string, SupportItem[]>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<SupportItem | null>(null);
  const items = data[caseId] ?? initialSupport();
  const canEdit = role === "Operator" || role === "Admin";

  const save = () => {
    if (!draft) return;
    setData({ ...data, [caseId]: items.map((i) => (i.key === draft.key ? draft : i)) });
    setEditing(null);
    notify(`${draft.label} updated for ${caseId}`);
  };

  return (
    <section className="workspace-card rounded-lg border border-border bg-card">
      <Head eyebrow={`${caseId} · support delivered`} title="Victim support status" />
      <div className="divide-y divide-border">
        {items.map((item) => (
          <div key={item.key} className="px-5 py-3 text-sm">
            {editing === item.key && draft ? (
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_90px_auto] sm:items-center">
                <span className="font-medium">{item.label}</span>
                <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className={inputClass}>{item.options.map((o) => <option key={o}>{o}</option>)}</select>
                <input value={draft.detail ?? ""} onChange={(e) => setDraft({ ...draft, detail: e.target.value })} placeholder={item.key === "relief" ? "Amount" : "Date"} className={inputClass} />
                <div className="flex gap-1"><Button size="icon" onClick={save} aria-label="Save"><Check /></Button><Button size="icon" variant="outline" onClick={() => setEditing(null)} aria-label="Cancel"><X /></Button></div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.detail ? <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{item.detail}</span> : null}
                <span className="w-16 text-right font-mono text-xs text-muted-foreground">{item.days !== undefined ? `${item.days}d` : "—"}</span>
                <Badge tone={tone(item.status)}>{item.status}</Badge>
                {canEdit ? <Button size="icon" variant="ghost" className="size-7" onClick={() => { setEditing(item.key); setDraft({ ...item }); }} aria-label={`Edit ${item.label}`}><Pencil className="size-3.5" /></Button> : null}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Timeline ---------------- */

type Entry = { time: string; author: string; role: Role; scope: Scope; text: string };

const seedTimeline: Entry[] = [
  { time: "12 Sep 09:14", author: "Case Worker 07", role: "Operator", scope: "All", text: "Intake completed by voice. Identity masked." },
  { time: "12 Sep 09:20", author: "Alert engine", role: "Admin", scope: "All", text: "Alert sent for review." },
  { time: "12 Sep 11:02", author: "Inspector R. Mehta", role: "Police", scope: "Police", text: "Site visit completed, protection request noted." },
  { time: "13 Sep 15:40", author: "Counselor A. Nair", role: "Mental Health", scope: "Health", text: "First counselling session scheduled." },
  { time: "14 Sep 10:05", author: "Advocate S. Iyer", role: "Legal", scope: "Legal", text: "Legal aid application filed." },
];

export function CaseTimeline({ caseId, role, notify }: { caseId: string; role: Role; notify: (m: string) => void }) {
  const [entries, setEntries] = useState<Entry[]>(seedTimeline);
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [scope, setScope] = useState<Scope>("All");
  const visible = entries.filter((e) => roleScope[role].includes(e.scope));
  const canAdd = role !== "Citizen";

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const now = new Date();
    setEntries([...entries, { time: now.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).replace(",", ""), author: reviewerName[role], role, scope, text: text.trim() }]);
    setText("");
    setAdding(false);
    notify(`Timeline entry added to ${caseId}`);
  };

  return (
    <section className="workspace-card rounded-lg border border-border bg-card">
      <Head eyebrow={`${caseId} · ${visible.length} visible entries`} title="Case timeline" action={canAdd && !adding ? <Button size="sm" variant="outline" onClick={() => setAdding(true)}><Plus />Add entry</Button> : null} />
      {adding ? (
        <form onSubmit={add} className="grid gap-2 border-b border-border p-4 sm:grid-cols-[1fr_130px_auto]">
          <input required value={text} onChange={(e) => setText(e.target.value)} placeholder="What happened" className={inputClass} />
          <select value={scope} onChange={(e) => setScope(e.target.value as Scope)} className={inputClass} aria-label="Visibility">
            {(role === "Admin" || role === "Operator" ? ["All", "Police", "Legal", "Health"] : roleScope[role]).map((s) => <option key={s}>{s}</option>)}
          </select>
          <div className="flex gap-2"><Button type="submit">Add</Button><Button type="button" variant="outline" onClick={() => setAdding(false)}>Cancel</Button></div>
        </form>
      ) : null}
      <ol className="p-5">
        {visible.map((e, i) => (
          <li key={i} className="relative border-l border-border pb-5 pl-5 last:pb-0">
            <span className="absolute -left-[4px] top-1.5 size-2 rounded-full bg-primary" />
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] text-muted-foreground">{e.time}</span>
              <span className="text-xs font-medium">{e.author}</span>
              {e.scope !== "All" ? <Badge tone="muted">{e.scope} only</Badge> : null}
            </div>
            <p className="mt-1 text-sm">{e.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------------- Admin metrics ---------------- */

const regions = ["All regions", "North District", "South District", "East District", "West District", "Central District"];
const periods = ["Last 30 days", "Last 90 days", "Last 12 months"];

function Pair({ label, a, b, aLabel, bLabel, highlight }: { label: string; a: number; b: number; aLabel: string; bLabel: string; highlight?: boolean }) {
  const max = Math.max(a, b, 1);
  return (
    <div className={cn("rounded-md border border-border p-4", highlight && "border-warning/40 bg-warning/5")}>
      <div className="flex items-center justify-between text-sm"><span className="font-medium">{label}</span>{highlight ? <Badge tone="warn">Gap {a - b}</Badge> : null}</div>
      {[[aLabel, a, "bg-primary"], [bLabel, b, highlight ? "bg-warning" : "bg-subtle"]].map(([l, v, c]) => (
        <div key={l as string} className="mt-3">
          <div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">{l}</span><span className="font-mono">{v}</span></div>
          <div className="h-2 rounded-full bg-secondary"><div className={cn("h-full rounded-full", c as string)} style={{ width: `${((v as number) / max) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

export function AdminMetrics() {
  const [region, setRegion] = useState<string>("All regions");
  const [period, setPeriod] = useState<string>("Last 30 days");
  const f = (regions.indexOf(region) === 0 ? 1 : 0.22 + regions.indexOf(region) * 0.03) * (periods.indexOf(period) + 1) * (periods.indexOf(period) === 2 ? 3 : 1);
  const n = (v: number) => Math.round(v * f);
  const volume = [42, 51, 47, 63, 58, 71, 66].map(n);
  const vmax = Math.max(...volume, 1);

  return (
    <div className="calm-in grid gap-4 lg:gap-5 xl:grid-cols-[1.4fr_1fr]">
      <section className="workspace-card rounded-lg border border-border bg-card">
        <Head eyebrow="Based on registered cases" title="Victim support metrics" action={
          <div className="flex gap-2">
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none" aria-label="Region">{regions.map((r) => <option key={r}>{r}</option>)}</select>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none" aria-label="Period">{periods.map((p) => <option key={p}>{p}</option>)}</select>
          </div>
        } />
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          <Pair label="Counselling" a={n(184)} b={n(97)} aLabel="Referred" bLabel="Received" highlight />
          <Pair label="Legal aid" a={n(142)} b={n(38)} aLabel="Provided" bLabel="Pending" />
          <Pair label="Relief" a={n(96)} b={n(61)} aLabel="Provided" bLabel="Pending" />
          <div className="rounded-md border border-border p-4">
            <p className="text-sm font-medium">Rehabilitation completion</p>
            <p className="mt-3 font-mono text-3xl font-semibold">58%</p>
            <div className="mt-3 h-2 rounded-full bg-secondary"><div className="h-full w-[58%] rounded-full bg-success" /></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-border p-5 text-xs sm:grid-cols-4">
          {[["Legal aid", "3.2d"], ["Relief", "9.6d"], ["Medical", "0.8d"], ["Counselling", "6.4d"]].map(([l, v]) => (
            <div key={l}><p className="font-mono text-[9px] uppercase text-muted-foreground">Avg time · {l}</p><p className="mt-1 font-mono text-lg">{v}</p></div>
          ))}
        </div>
      </section>

      <section className="workspace-card rounded-lg border border-border bg-card">
        <Head eyebrow="Human review of alerts" title="Alert effectiveness" />
        <div className="p-5">
          <p className="font-mono text-[10px] uppercase text-muted-foreground">Alert volume · weekly</p>
          <div className="mt-3 flex h-32 items-end gap-2">
            {volume.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t bg-primary/70 transition-all hover:bg-primary" style={{ height: `${(v / vmax) * 100}%` }} title={`${v} alerts`} />
                <span className="font-mono text-[9px] text-muted-foreground">W{i + 1}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-4">
            {[["Reviewed", 87, "bg-primary"], ["Actioned", 64, "bg-success"], ["Open over 24h", 6, "bg-warning"]].map(([l, v, c]) => (
              <div key={l as string}>
                <div className="mb-1.5 flex justify-between text-xs"><span className="text-muted-foreground">{l}</span><span className="font-mono">{v}%</span></div>
                <div className="h-1.5 rounded-full bg-secondary"><div className={cn("h-full rounded-full", c as string)} style={{ width: `${v}%` }} /></div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-muted-foreground">Check-in data covers victims with active check-in participation.</p>
        </div>
      </section>
    </div>
  );
}
