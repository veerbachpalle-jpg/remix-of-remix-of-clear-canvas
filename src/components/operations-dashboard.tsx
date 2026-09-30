import { useMemo, useState } from "react";
import {
  Activity,
  Bell,
  BookOpenText,
  Bot,
  ChevronDown,
  CircleAlert,
  ClipboardList,
  FileText,
  Headphones,
  HeartPulse,
  Languages,
  LayoutDashboard,
  Menu,
  Mic,
  PhoneCall,
  Plus,
  Radio,
  Search,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminMetrics, AlertPanel, CaseTimeline, SupportStatus } from "@/components/case-support";

type Role = "Citizen" | "Operator" | "Police" | "Mental Health" | "Legal" | "Admin";
type View = "Overview" | "Intake" | "Cases" | "Routing" | "Audit" | "Health";

const roles: Array<{ name: Role; caption: string }> = [
  { name: "Citizen", caption: "Support access" },
  { name: "Operator", caption: "Call center / triage" },
  { name: "Police", caption: "Safety liaison" },
  { name: "Mental Health", caption: "Clinical support" },
  { name: "Legal", caption: "Legal aid" },
  { name: "Admin", caption: "System control" },
];

const cases = [
  { id: "SH-2841", title: "Immediate safety concern", person: "A. K••••", location: "South District", source: "Voice", score: 92, level: "Critical", department: "Police", age: "2 min" },
  { id: "SH-2838", title: "Severe emotional distress", person: "R. S••••", location: "Central District", source: "Chat", score: 81, level: "Critical", department: "Mental Health", age: "6 min" },
  { id: "SH-2832", title: "Domestic legal support", person: "M. P••••", location: "East District", source: "Web", score: 68, level: "High", department: "Legal", age: "13 min" },
  { id: "SH-2827", title: "Temporary shelter request", person: "N. D••••", location: "North District", source: "Voice", score: 54, level: "High", department: "Operator", age: "18 min" },
  { id: "SH-2820", title: "Scheme eligibility guidance", person: "S. R••••", location: "West District", source: "Web", score: 31, level: "Standard", department: "Legal", age: "27 min" },
];

const roleViews: Record<Role, View[]> = {
  Citizen: ["Overview", "Intake", "Cases"],
  Operator: ["Overview", "Intake", "Cases", "Routing"],
  Police: ["Overview", "Cases", "Routing"],
  "Mental Health": ["Overview", "Cases", "Routing"],
  Legal: ["Overview", "Cases", "Routing"],
  Admin: ["Overview", "Cases", "Audit", "Health"],
};

const viewIcons: Record<View, typeof LayoutDashboard> = {
  Overview: LayoutDashboard,
  Intake: ClipboardList,
  Cases: FileText,
  Routing: SlidersHorizontal,
  Audit: ShieldCheck,
  Health: Activity,
};

function statusTone(score: number) {
  if (score >= 80) return "text-emergency";
  if (score >= 50) return "text-warning";
  return "text-success";
}

function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
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

export function OperationsDashboard() {
  const [role, setRole] = useState<Role>("Operator");
  const [view, setView] = useState<View>("Overview");
  const [selectedId, setSelectedId] = useState(cases[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("English");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const visibleCases = useMemo(() => {
    const roleFiltered = ["Operator", "Admin", "Citizen"].includes(role)
      ? cases
      : cases.filter((item) => item.department === role);
    const query = search.toLowerCase();
    return roleFiltered.filter((item) => `${item.id} ${item.title} ${item.location}`.toLowerCase().includes(query));
  }, [role, search]);
  const selected = cases.find((item) => item.id === selectedId) ?? cases[0];

  if (!selected) return null;

  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2600);
  };

  const switchRole = (nextRole: Role) => {
    setRole(nextRole);
    setView("Overview");
    setRolesOpen(false);
    setMobileOpen(false);
  };

  const changeView = (nextView: View) => {
    setView(nextView);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {notice ? (
        <div role="status" className="fixed right-4 top-4 z-50 flex max-w-sm items-center gap-2 rounded-md border border-primary/30 bg-popover px-4 py-3 text-sm shadow-xl">
          <ShieldCheck className="text-success" /> {notice}
        </div>
      ) : null}

      <div className="flex min-h-screen">
        <aside data-open={mobileOpen} className="mobile-sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:sticky">
          <div className="flex h-16 items-center gap-3 border-b border-border px-4">
            <div className="grid size-9 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground shadow-sm">SA</div>
            <div className="leading-tight">
              <p className="font-semibold text-primary">Sahaay</p>
              <p className="font-mono text-[10px] uppercase text-muted-foreground">response network</p>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X /></Button>
          </div>

          <div className="p-3">
            <button onClick={() => setRolesOpen(!rolesOpen)} className="flex w-full items-center gap-3 rounded-md border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:bg-surface-strong" aria-expanded={rolesOpen}>
              <div className="grid size-8 place-items-center rounded bg-primary/15 text-primary"><Users className="size-4" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase text-muted-foreground">Active role</p>
                <p className="truncate text-sm font-medium">{role}</p>
              </div>
              <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", rolesOpen && "rotate-180")} />
            </button>
            {rolesOpen ? (
              <div className="mt-2 rounded-md border border-border bg-popover p-1 shadow-xl">
                {roles.map((item) => (
                  <button key={item.name} onClick={() => switchRole(item.name)} className={cn("flex w-full items-center justify-between rounded px-3 py-2 text-left hover:bg-accent", item.name === role && "bg-primary/10 text-primary")}>
                    <span className="text-sm">{item.name}</span><span className="text-[10px] text-muted-foreground">{item.caption}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <nav className="flex-1 space-y-1 px-3" aria-label="Workspace">
            <p className="mb-2 px-3 font-mono text-[10px] uppercase text-muted-foreground">Workspace</p>
            {roleViews[role].map((item) => {
              const Icon = viewIcons[item];
              return <button key={item} onClick={() => changeView(item)} className={cn("flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground", view === item && "bg-primary/10 font-medium text-primary")}><Icon className="size-4" />{item}{item === "Cases" ? <span className="ml-auto rounded bg-secondary px-1.5 font-mono text-[10px]">{visibleCases.length}</span> : null}</button>;
            })}
          </nav>

          <div className="border-t border-border p-3">
              <div className="mb-3 rounded-md border border-border bg-card/75 p-3">
              <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Privacy controls</span><span className="text-success">Enforced</span></div>
              <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">Sensitive fields masked</p>
            </div>
          </div>
        </aside>

        {mobileOpen ? <button className="fixed inset-0 z-30 bg-background/80 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" /> : null}

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b border-border bg-card/90 px-4 shadow-sm backdrop-blur lg:px-6">
            <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu /></Button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold">{view === "Overview" ? `${role} command center` : view}</h1>
              <p className="hidden font-mono text-[10px] text-muted-foreground sm:block">Protected session · identifiers masked</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
               <div className="hidden items-center gap-2 rounded-full border border-success/25 bg-success/10 px-3 py-2 text-xs text-success md:flex"><span className="size-2 rounded-full bg-success pulse" />Services online</div>
              <label className="relative hidden sm:block">
                <Languages className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <select value={language} onChange={(event) => setLanguage(event.target.value)} className="h-9 appearance-none rounded-md border border-input bg-card pl-8 pr-7 text-xs outline-none">
                  {["English", "हिन्दी", "বাংলা", "தமிழ்", "తెలుగు", "मराठी", "ಕನ್ನಡ"].map((item) => <option key={item}>{item}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-2.5 size-4 text-muted-foreground" />
              </label>
              <Button variant="outline" size="sm" asChild><Link to="/login">Sign in</Link></Button>
              <Button variant="outline" size="icon" aria-label="Notifications" onClick={() => notify("No unreviewed alerts")} className="relative"><Bell /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-warning" /></Button>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] p-4 lg:p-6">
            {view === "Overview" && role === "Admin" && <div className="mb-5"><AdminMetrics /></div>}
            {view === "Overview" && <Overview role={role} cases={visibleCases} selected={selected} setSelectedId={setSelectedId} search={search} setSearch={setSearch} notify={notify} />}
            {view === "Intake" && <IntakeView notify={notify} language={language} />}
            {view === "Cases" && <CasesView cases={visibleCases} search={search} setSearch={setSearch} selectedId={selectedId} setSelectedId={setSelectedId} />}
            {view === "Routing" && <RoutingView selected={selected} notify={notify} />}
            {view === "Audit" && <AuditView />}
            {view === "Health" && <HealthView />}
          </div>
        </main>
      </div>
    </div>
  );
}

function Overview({ role, cases: items, selected, setSelectedId, search, setSearch, notify }: { role: Role; cases: typeof cases; selected: (typeof cases)[number]; setSelectedId: (id: string) => void; search: string; setSearch: (value: string) => void; notify: (message: string) => void }) {
  return (
    <div className="calm-in grid grid-cols-12 gap-4 lg:gap-5">
      <section className="workspace-card col-span-12 overflow-hidden rounded-lg border border-border bg-card xl:col-span-8">
        <SectionTitle eyebrow={`${items.length} active · priority order`} title={role === "Citizen" ? "Your support requests" : "Case queue"} action={<Button size="sm" onClick={() => notify("New intake workspace ready")}><Plus />New case</Button>} />
        <div className="border-b border-border p-3">
          <label className="relative block"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search case, concern, or district" className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none" /></label>
        </div>
        <div className="divide-y divide-border">
          {items.map((item) => (
            <button key={item.id} onClick={() => setSelectedId(item.id)} className={cn("interactive-row group grid w-full grid-cols-[1fr_auto] gap-4 border-l-[3px] border-l-transparent px-5 py-4 text-left hover:bg-accent/70 md:grid-cols-[1.4fr_.8fr_.8fr_auto]", selected.id === item.id && "border-l-primary bg-primary/10 shadow-[inset_3px_0_0_var(--primary)]")}>
              <div className="min-w-0"><div className="flex items-center gap-2"><span className="font-mono text-xs text-primary">{item.id}</span><span className={cn("size-1.5 rounded-full", item.score >= 80 ? "bg-emergency" : item.score >= 50 ? "bg-warning" : "bg-success")} /></div><p className="mt-1 truncate text-sm font-medium">{item.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{item.person} · {item.location}</p></div>
              <div className="hidden self-center md:block"><p className={cn("font-mono text-lg font-semibold", statusTone(item.score))}>{item.score}</p><p className="text-[10px] text-muted-foreground">DISTRESS</p></div>
              <div className="hidden self-center md:block"><p className="text-xs font-medium">{item.department}</p><p className="text-[10px] text-muted-foreground">{item.source} · {item.age}</p></div>
              <span className={cn("self-center rounded border px-2 py-1 font-mono text-[10px]", item.score >= 80 ? "border-emergency/30 bg-emergency/10 text-emergency" : item.score >= 50 ? "border-warning/30 bg-warning/10 text-warning" : "border-success/30 bg-success/10 text-success")}>{item.level}</span>
            </button>
          ))}
          {items.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No cases match this role or search.</p> : null}
        </div>
      </section>

      <aside className="col-span-12 space-y-4 xl:col-span-4">
         <section className="workspace-card rounded-lg border border-border bg-card">
          <SectionTitle eyebrow={`Selected · ${selected.id}`} title="Case intelligence" />
          <div className="p-5">
            <div className="flex items-start justify-between"><div><p className="text-sm font-semibold">{selected.person}</p><p className="mt-1 text-xs text-muted-foreground">Contact: +91 ••••• ••{selected.id.slice(-2)}</p></div><div className="text-right"><p className={cn("font-mono text-3xl font-semibold", statusTone(selected.score))}>{selected.score}</p><p className="font-mono text-[9px] text-muted-foreground">OF 100</p></div></div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary"><div className={cn("h-full", selected.score >= 80 ? "bg-emergency" : selected.score >= 50 ? "bg-warning" : "bg-success")} style={{ width: `${selected.score}%` }} /></div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs"><Info label="Location" value={selected.location} /><Info label="Intake" value={selected.source} /><Info label="Language" value="Hindi / English" /><Info label="Safety" value="Identity masked" /></div>
             {role !== "Citizen" ? <AlertPanel caseId={selected.id} score={selected.score} role={role} notify={notify} /> : null}
          </div>
        </section>
        <SystemStatus compact />
      </aside>
      {role !== "Citizen" ? (
        <div className="col-span-12 grid gap-4 lg:gap-5 xl:grid-cols-2">
          <SupportStatus caseId={selected.id} role={role} notify={notify} />
          <CaseTimeline caseId={selected.id} role={role} notify={notify} />
        </div>
      ) : null}
    </div>
  );
}

function IntakeView({ notify, language }: { notify: (message: string) => void; language: string }) {
  const [listening, setListening] = useState(false);
  return <div className="calm-in grid grid-cols-12 gap-5"><section className="col-span-12 rounded-md border border-border bg-card xl:col-span-7"><SectionTitle eyebrow="Secure intake" title="Register a new case" action={<span className="rounded bg-primary/10 px-2 py-1 font-mono text-[10px] text-primary">DRAFT</span>} /><form className="grid gap-4 p-5 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); notify("Case registered and queued for scoring"); }}><Field label="Case title" placeholder="Brief concern summary" /><Field label="Category" placeholder="Safety / legal / wellbeing" /><Field label="Victim name" placeholder="Stored securely" /><Field label="Contact number" placeholder="Masked after registration" /><label className="sm:col-span-2"><span className="text-xs text-muted-foreground">Description</span><textarea required className="mt-1.5 min-h-28 w-full resize-none rounded-md border border-input bg-background p-3 text-sm outline-none" placeholder="Record only details needed for support" /></label><Field label="Location" placeholder="District or safe landmark" /><Field label="Preferred language" placeholder={language} /><div className="flex flex-wrap items-center gap-2 sm:col-span-2"><Button type="submit"><ShieldCheck />Register case</Button><Button type="button" variant="outline" onClick={() => notify("Draft saved in this session")}>Save draft</Button><Button type="button" variant={listening ? "secondary" : "outline"} onClick={() => setListening(!listening)}><Mic />{listening ? "Listening" : "Voice intake"}</Button></div></form></section><DistressPanel /></div>;
}

function Field({ label, placeholder }: { label: string; placeholder: string }) { return <label><span className="text-xs text-muted-foreground">{label}</span><input required placeholder={placeholder} className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none" /></label>; }

function DistressPanel() { return <section className="col-span-12 rounded-md border border-border bg-card xl:col-span-5"><SectionTitle eyebrow="Live estimate" title="Distress score" /><div className="p-5"><div className="flex items-end gap-2"><span className="font-mono text-5xl font-semibold">62</span><span className="mb-1 text-sm text-muted-foreground">/ 100 · High</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full w-[62%] bg-warning" /></div><div className="mt-6 space-y-4"><Metric label="Immediate safety" value="Elevated" width="74%" tone="bg-emergency" /><Metric label="Emotional distress" value="High" width="81%" tone="bg-warning" /><Metric label="Available support" value="Limited" width="42%" tone="bg-primary" /></div><div className="mt-6 border-t border-border pt-5"><p className="font-mono text-[10px] uppercase text-muted-foreground">Relevant for review</p><div className="mt-3 flex flex-wrap gap-2"><Tag>Police</Tag><Tag>Mental Health</Tag><Tag>Legal Aid</Tag></div></div></div></section>; }

function CasesView({ cases: items, search, setSearch, selectedId, setSelectedId }: { cases: typeof cases; search: string; setSearch: (v: string) => void; selectedId: string; setSelectedId: (v: string) => void }) { return <section className="calm-in rounded-md border border-border bg-card"><SectionTitle eyebrow="Protected records" title="Active cases" /><div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none" placeholder="Search active cases" /></label><Button variant="outline"><SlidersHorizontal />Filters</Button></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-border font-mono text-[10px] uppercase text-muted-foreground"><tr><th className="px-5 py-3">Case</th><th>Subject</th><th>Distress</th><th>Department</th><th>Received</th></tr></thead><tbody className="divide-y divide-border">{items.map((item) => <tr key={item.id} onClick={() => setSelectedId(item.id)} className={cn("cursor-pointer hover:bg-accent", selectedId === item.id && "bg-primary/10")}><td className="px-5 py-4 font-mono text-primary">{item.id}</td><td><p className="font-medium">{item.person}</p><p className="text-xs text-muted-foreground">{item.title}</p></td><td className={cn("font-mono font-semibold", statusTone(item.score))}>{item.score}</td><td>{item.department}</td><td className="text-muted-foreground">{item.age} ago</td></tr>)}</tbody></table></div></section>; }

function RoutingView({ selected, notify }: { selected: (typeof cases)[number]; notify: (v: string) => void }) { const departments = [{ name: "Police", status: "Ready", eta: "4 min", icon: Shield }, { name: "Mental Health", status: "Ready", eta: "7 min", icon: HeartPulse }, { name: "Legal Aid", status: "Available", eta: "12 min", icon: BookOpenText }]; return <div className="calm-in grid gap-5 lg:grid-cols-[1fr_360px]"><section className="rounded-md border border-border bg-card"><SectionTitle eyebrow={`Suggested for ${selected.id} · professional decides`} title="Referral review" /><div className="divide-y divide-border">{departments.map((item) => <div key={item.name} className="flex items-center gap-4 p-5"><div className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary"><item.icon /></div><div><p className="font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.status} · estimated response {item.eta}</p></div><Button className="ml-auto" variant={item.name === selected.department ? "default" : "outline"} onClick={() => notify(`${selected.id} referred to ${item.name} for review`)}>Refer</Button></div>)}</div></section><section className="rounded-md border border-border bg-card"><SectionTitle eyebrow="Eligibility confirmed by staff" title="Possible schemes" /><div className="space-y-3 p-5"><Scheme title="One Stop Centre Scheme" note="Integrated support and temporary shelter" /><Scheme title="Free Legal Aid" note="Eligible under Section 12, LSA Act" /><Scheme title="Emergency Response Support" note="Coordinated safety response" /></div></section></div>; }

function AuditView() { return <section className="calm-in rounded-md border border-border bg-card"><SectionTitle eyebrow="Tamper-evident activity" title="Audit trail" /><div className="divide-y divide-border">{[["12:46:08","Operator 07","Viewed masked case","SH-2841"],["12:44:31","Alert engine","Alert sent for review","SH-2838"],["12:41:55","Police Liaison","Accepted assignment","SH-2832"],["12:38:02","Masking Service","Protected contact fields","SH-2827"]].map((row) => <div key={row.join()} className="grid gap-2 px-5 py-4 text-sm sm:grid-cols-[100px_1fr_1.5fr_100px]"><span className="font-mono text-xs text-muted-foreground">{row[0]}</span><span>{row[1]}</span><span>{row[2]}</span><span className="font-mono text-primary">{row[3]}</span></div>)}</div></section>; }

function HealthView() { return <div className="calm-in grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{name:"Core API",value:"99.98%",latency:"41 ms"},{name:"ML Engine",value:"99.91%",latency:"86 ms"},{name:"Audit Store",value:"100%",latency:"24 ms"},{name:"Voice Service",value:"99.42%",latency:"180 ms"}].map((item, index) => <section key={item.name} className="rounded-md border border-border bg-card p-5"><div className="flex items-center justify-between"><Radio className={index === 3 ? "text-warning" : "text-success"} /><span className={cn("size-2 rounded-full", index === 3 ? "bg-warning" : "bg-success")} /></div><h2 className="mt-5 font-semibold">{item.name}</h2><p className="mt-1 font-mono text-2xl">{item.value}</p><p className="mt-3 text-xs text-muted-foreground">Latency {item.latency}</p></section>)}</div>; }

function SystemStatus({ compact = false }: { compact?: boolean }) { return <section className="rounded-md border border-border bg-card"><SectionTitle title="System status" /><div className={cn("grid gap-3 p-5", !compact && "sm:grid-cols-2")}>{[["Case API","Operational"],["Alert scoring","Operational"],["Voice engine","Degraded"],["Privacy controls","Enforced"]].map(([name,status]) => <div key={name} className="flex items-center justify-between text-xs"><span>{name}</span><span className={status === "Degraded" ? "text-warning" : "text-success"}>{status}</span></div>)}</div></section>; }
function Info({ label, value }: { label: string; value: string }) { return <div><p className="font-mono text-[9px] uppercase text-muted-foreground">{label}</p><p className="mt-1 truncate font-medium">{value}</p></div>; }
function Metric({ label, value, width, tone }: { label: string; value: string; width: string; tone: string }) { return <div><div className="mb-1.5 flex justify-between text-xs"><span className="text-muted-foreground">{label}</span><span>{value}</span></div><div className="h-1.5 rounded-full bg-secondary"><div className={cn("h-full rounded-full", tone)} style={{ width }} /></div></div>; }
function Tag({ children }: { children: React.ReactNode }) { return <span className="rounded border border-border bg-secondary px-2.5 py-1 text-xs">{children}</span>; }
function Scheme({ title, note }: { title: string; note: string }) { return <div className="rounded-md border border-border bg-surface p-3"><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{note}</p></div>; }