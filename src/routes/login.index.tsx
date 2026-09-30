import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpenText, HeartPulse, Shield, ShieldCheck, User } from "lucide-react";
import { Head, PortalShell } from "@/components/portal";
import { portalRoles, type PortalRole } from "@/lib/referral-store";

const icons: Record<PortalRole, typeof Shield> = { victim: User, police: Shield, legal: BookOpenText, counselor: HeartPulse, admin: ShieldCheck };

export const Route = createFileRoute("/login/")({
  head: () => ({
    meta: [
      { title: "Sign in — Sahaay Response Network" },
      { name: "description", content: "Choose your sign-in: victim/user, Police, Legal Aid, Counselor, or Admin." },
      { property: "og:title", content: "Sign in — Sahaay Response Network" },
      { property: "og:description", content: "Separate secure sign-in for users, Police, Legal Aid, Counselors, and Admin." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginChooser,
});

function LoginChooser() {
  return (
    <PortalShell title="Sign in">
      <section className="calm-in mx-auto max-w-xl rounded-lg border border-border bg-card">
        <Head eyebrow="Separate access per role" title="How are you signing in?" />
        <div className="divide-y divide-border">
          {portalRoles.map((r) => {
            const Icon = icons[r.id];
            return (
              <Link key={r.id} to="/login/$role" params={{ role: r.id }} className="interactive-row flex items-center gap-4 px-5 py-4 hover:bg-accent/70">
                <div className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary"><Icon /></div>
                <div><p className="font-medium">{r.label}</p><p className="text-xs text-muted-foreground">{r.caption}</p></div>
              </Link>
            );
          })}
        </div>
      </section>
    </PortalShell>
  );
}
