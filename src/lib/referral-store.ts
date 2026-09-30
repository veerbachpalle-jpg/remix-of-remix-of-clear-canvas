import { useSyncExternalStore } from "react";

export type Service = "Police" | "Legal" | "Counselling";
export type PortalRole = "victim" | "police" | "legal" | "counselor" | "admin";
export type Category = "anxiety" | "distress" | "safety" | "legal";
export type ReportStatus = "Open" | "In progress" | "Closed";

export const portalRoles: Array<{ id: PortalRole; label: string; caption: string; service?: Service }> = [
  { id: "victim", label: "Victim / User", caption: "Take the assessment, see your reports" },
  { id: "police", label: "Police", caption: "Safety liaison dashboard", service: "Police" },
  { id: "legal", label: "Legal Aid", caption: "Legal aid dashboard", service: "Legal" },
  { id: "counselor", label: "Counselor", caption: "Counselling dashboard", service: "Counselling" },
  { id: "admin", label: "Admin", caption: "Full visibility and exports" },
];

export const staffName: Record<PortalRole, string> = {
  victim: "You",
  police: "Inspector R. Mehta",
  legal: "Advocate S. Iyer",
  counselor: "Counselor A. Nair",
  admin: "Admin 01",
};

export const categoryLabel: Record<Category, string> = {
  anxiety: "Anxiety",
  distress: "Distress level",
  safety: "Safety risk",
  legal: "Legal need",
};

export type Question = { id: string; text: string; cat: Category };

export const questions: Question[] = [
  { id: "q1", text: "I feel nervous, anxious, or on edge.", cat: "anxiety" },
  { id: "q2", text: "I find it hard to stop worrying.", cat: "anxiety" },
  { id: "q3", text: "I have trouble sleeping because of what is happening.", cat: "anxiety" },
  { id: "q4", text: "I feel hopeless about the future.", cat: "distress" },
  { id: "q5", text: "I feel overwhelmed and unable to cope day to day.", cat: "distress" },
  { id: "q6", text: "I have had thoughts of harming myself.", cat: "distress" },
  { id: "q7", text: "Someone has threatened to hurt me or people close to me.", cat: "safety" },
  { id: "q8", text: "I am afraid of someone I live with or see often.", cat: "safety" },
  { id: "q9", text: "I feel I am in immediate danger right now.", cat: "safety" },
  { id: "q10", text: "I need help understanding my legal rights.", cat: "legal" },
  { id: "q11", text: "Someone is controlling my money, documents, or property.", cat: "legal" },
  { id: "q12", text: "I am worried about custody, divorce, or housing matters.", cat: "legal" },
];

export const answerScale = ["Not at all", "Sometimes", "Often", "Almost always"];

export type Referral = { service: Service; reason: string };
export type ActionEntry = { at: string; service: Service | "Admin"; author: string; action: string; note: string };

export type Report = {
  id: string;
  subjectId: string;
  subjectLabel: string;
  createdAt: string;
  answers: Record<string, number>;
  scores: Record<Category, number>;
  overall: number;
  level: "Critical" | "High" | "Moderate" | "Low";
  summary: string;
  referrals: Referral[];
  actions: ActionEntry[];
  status: ReportStatus;
};

export function scoreAnswers(answers: Record<string, number>) {
  const cats: Category[] = ["anxiety", "distress", "safety", "legal"];
  const scores = Object.fromEntries(
    cats.map((cat) => {
      const qs = questions.filter((q) => q.cat === cat);
      const sum = qs.reduce((t, q) => t + (answers[q.id] ?? 0), 0);
      return [cat, Math.round((sum / (qs.length * 3)) * 100)];
    }),
  ) as Record<Category, number>;
  const overall = Math.round(scores.safety * 0.35 + scores.distress * 0.3 + scores.anxiety * 0.2 + scores.legal * 0.15);
  const level: Report["level"] = overall >= 75 ? "Critical" : overall >= 50 ? "High" : overall >= 25 ? "Moderate" : "Low";

  const referrals: Referral[] = [];
  if (scores.safety >= 50 || (answers["q9"] ?? 0) >= 2) {
    referrals.push({ service: "Police", reason: `Responses indicate threats or fear for physical safety (safety risk ${scores.safety}/100${(answers["q9"] ?? 0) >= 2 ? ", immediate danger reported" : ""}).` });
  }
  if (scores.legal >= 50) {
    referrals.push({ service: "Legal", reason: `Responses show a need for legal guidance on rights, property, or family matters (legal need ${scores.legal}/100).` });
  }
  if (scores.distress >= 50 || scores.anxiety >= 60 || (answers["q6"] ?? 0) >= 1) {
    referrals.push({ service: "Counselling", reason: `Responses show elevated emotional strain (distress ${scores.distress}/100, anxiety ${scores.anxiety}/100${(answers["q6"] ?? 0) >= 1 ? ", thoughts of self-harm reported" : ""}).` });
  }
  const top = [...cats].sort((a, b) => scores[b] - scores[a])[0]!;
  const summary = `Overall score ${overall}/100 (${level}). Highest area: ${categoryLabel[top]} at ${scores[top]}/100. ${referrals.length ? `Automatically referred to ${referrals.map((r) => r.service).join(", ")}.` : "No referral threshold was met."}`;
  return { scores, overall, level, referrals, summary };
}

function makeReport(id: string, subjectId: string, subjectLabel: string, createdAt: string, answers: Record<string, number>, actions: ActionEntry[] = [], status: ReportStatus = "Open"): Report {
  return { id, subjectId, subjectLabel, createdAt, answers, ...scoreAnswers(answers), actions, status };
}

const fill = (vals: number[]) => Object.fromEntries(questions.map((q, i) => [q.id, vals[i] ?? 0]));

const seed = (): Report[] => [
  makeReport("RP-1042", "U-7781", "A. K••••", "2026-09-02T09:14:00Z", fill([1, 1, 2, 1, 1, 0, 1, 2, 0, 1, 1, 0])),
  makeReport("RP-1067", "U-7781", "A. K••••", "2026-09-18T11:40:00Z", fill([2, 2, 3, 2, 2, 0, 3, 3, 2, 2, 2, 1]), [
    { at: "2026-09-18T13:05:00Z", service: "Police", author: "Inspector R. Mehta", action: "Site visit completed", note: "Protection request noted, patrol scheduled." },
    { at: "2026-09-19T10:20:00Z", service: "Counselling", author: "Counselor A. Nair", action: "Session scheduled", note: "First session booked for 21 Sep." },
  ], "In progress"),
  makeReport("RP-1071", "U-8120", "R. S••••", "2026-09-21T08:02:00Z", fill([3, 3, 3, 3, 3, 1, 0, 1, 0, 0, 0, 1])),
  makeReport("RP-1075", "U-8233", "M. P••••", "2026-09-24T15:30:00Z", fill([1, 1, 1, 1, 1, 0, 1, 1, 0, 3, 3, 3]), [
    { at: "2026-09-25T09:00:00Z", service: "Legal", author: "Advocate S. Iyer", action: "Legal aid appointment booked", note: "Protection order filing discussed." },
  ], "In progress"),
  makeReport("RP-1080", "U-8301", "S. R••••", "2026-09-27T12:10:00Z", fill([1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0])),
  makeReport("RP-1084", "U-8233", "M. P••••", "2026-09-29T10:45:00Z", fill([2, 2, 1, 2, 1, 0, 2, 2, 1, 3, 2, 3])),
];

type Session = { role: PortalRole; name: string; subjectId?: string } | null;
type State = { reports: Report[]; session: Session };

const KEY = "sahaay-portal-v1";
const serverState: State = { reports: seed(), session: null };
let state: State | null = null;
const listeners = new Set<() => void>();

function load(): State {
  if (state) return state;
  try {
    const raw = window.localStorage.getItem(KEY);
    state = raw ? (JSON.parse(raw) as State) : { reports: seed(), session: null };
  } catch {
    state = { reports: seed(), session: null };
  }
  return state;
}

function set(next: State) {
  state = next;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
  listeners.forEach((l) => l());
}

export function usePortal() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    load,
    () => serverState,
  );
}

export function signIn(role: PortalRole, name?: string) {
  const s = load();
  const subjectId = role === "victim" ? s.session?.subjectId ?? `U-${Math.floor(9000 + Math.random() * 900)}` : undefined;
  set({ ...s, session: { role, name: name?.trim() || staffName[role], subjectId } });
}

export function signOut() {
  set({ ...load(), session: null });
}

export function submitAssessment(answers: Record<string, number>): Report {
  const s = load();
  const session: { role: PortalRole; name: string; subjectId: string } = s.session?.role === "victim" && s.session.subjectId ? { ...s.session, subjectId: s.session.subjectId } : { role: "victim" as const, name: "Anonymous", subjectId: `U-${Math.floor(9000 + Math.random() * 900)}` };
  const label = session.name === "Anonymous" ? "Anonymous" : `${session.name.slice(0, 1).toUpperCase()}. ${"••••"}`;
  const id = `RP-${1100 + s.reports.length}`;
  const report = makeReport(id, session.subjectId, label, new Date().toISOString(), answers);
  set({ reports: [report, ...s.reports], session });
  return report;
}

export function addAction(reportId: string, entry: Omit<ActionEntry, "at">) {
  const s = load();
  set({
    ...s,
    reports: s.reports.map((r) => (r.id === reportId ? { ...r, actions: [...r.actions, { ...entry, at: new Date().toISOString() }], status: r.status === "Open" ? "In progress" : r.status } : r)),
  });
}

export function setStatus(reportId: string, status: ReportStatus) {
  const s = load();
  set({ ...s, reports: s.reports.map((r) => (r.id === reportId ? { ...r, status } : r)) });
}

export function canView(session: Session, report: Report) {
  if (!session) return false;
  if (session.role === "admin") return true;
  if (session.role === "victim") return session.subjectId === report.subjectId;
  const service = portalRoles.find((r) => r.id === session.role)?.service;
  return report.referrals.some((r) => r.service === service);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export async function downloadProof(report: Report) {
  const body = [
    "SAHAAY RESPONSE NETWORK — CASE PROOF DOCUMENT",
    "==============================================",
    `Report ID:      ${report.id}`,
    `Subject ID:     ${report.subjectId} (${report.subjectLabel})`,
    `Generated:      ${formatDate(report.createdAt)}`,
    `Status:         ${report.status}`,
    "",
    "SYSTEM-GENERATED SUMMARY",
    report.summary,
    "",
    "CATEGORY SCORES",
    ...(Object.keys(report.scores) as Category[]).map((c) => `  ${categoryLabel[c].padEnd(16)} ${report.scores[c]}/100`),
    `  ${"Overall".padEnd(16)} ${report.overall}/100 (${report.level})`,
    "",
    "AUTOMATIC REFERRALS (decided by the report, not by a person)",
    ...(report.referrals.length ? report.referrals.map((r) => `  - ${r.service}: ${r.reason}`) : ["  None — no referral threshold met."]),
    "",
    "RESPONSES",
    ...questions.map((q) => `  ${q.id.toUpperCase().padEnd(4)} ${q.text} → ${answerScale[report.answers[q.id] ?? 0]}`),
    "",
    "ACTION LOG",
    ...(report.actions.length ? report.actions.map((a) => `  ${formatDate(a.at)} · ${a.service} · ${a.author} · ${a.action} — ${a.note}`) : ["  No actions logged yet."]),
  ].join("\n");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body));
  const hash = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const blob = new Blob([`${body}\n\nINTEGRITY (SHA-256 of the content above)\n${hash}\n`], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${report.id}-proof.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
