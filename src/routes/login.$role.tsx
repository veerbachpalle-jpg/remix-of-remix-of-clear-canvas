import { useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Head, inputClass, PortalShell } from "@/components/portal";
import { portalRoles, signIn, type PortalRole } from "@/lib/referral-store";

export const Route = createFileRoute("/login/$role")({
  loader: ({ params }) => {
    const role = portalRoles.find((r) => r.id === params.role);
    if (!role) throw notFound();
    return { role };
  },
  head: ({ loaderData }) => {
    const label = loaderData?.role.label ?? "Staff";
    return {
      meta: [
        { title: `${label} sign in — Sahaay` },
        { name: "description", content: `Secure ${label} sign-in for the Sahaay response network.` },
        { property: "og:title", content: `${label} sign in — Sahaay` },
        { property: "og:description", content: `Secure ${label} sign-in for the Sahaay response network.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  notFoundComponent: () => <PortalShell title="Sign in"><p className="text-center text-sm text-muted-foreground">Unknown sign-in type. <Link to="/login" className="text-primary">Choose again</Link></p></PortalShell>,
  component: RoleLogin,
});

function RoleLogin() {
  const { role } = Route.useLoaderData();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const isVictim = role.id === "victim";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn(role.id as PortalRole, isVictim ? name || "Anonymous" : undefined);
    navigate({ to: "/dashboard/$role", params: { role: role.id } });
  };

  return (
    <PortalShell title={`${role.label} sign in`}>
      <section className="calm-in mx-auto max-w-md rounded-lg border border-border bg-card">
        <Head eyebrow={role.caption} title={`Sign in as ${role.label}`} />
        <form onSubmit={submit} className="space-y-4 p-5">
          {isVictim ? (
            <>
              <label className="block"><span className="text-xs text-muted-foreground">Name or alias (optional)</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="You can stay anonymous" className={`${inputClass} mt-1.5 h-10`} /></label>
              <label className="block"><span className="text-xs text-muted-foreground">Phone number (optional)</span><input placeholder="Masked after sign in" className={`${inputClass} mt-1.5 h-10`} /></label>
            </>
          ) : (
            <>
              <label className="block"><span className="text-xs text-muted-foreground">Staff ID</span><input required placeholder={`${role.id.toUpperCase()}-0000`} className={`${inputClass} mt-1.5 h-10`} /></label>
              <label className="block"><span className="text-xs text-muted-foreground">Password</span><input required type="password" className={`${inputClass} mt-1.5 h-10`} /></label>
            </>
          )}
          <Button type="submit" className="w-full"><ShieldCheck />Sign in</Button>
          <p className="text-center font-mono text-[10px] text-muted-foreground">Demo sign-in · any details work</p>
          <p className="text-center text-xs"><Link to="/login" className="text-primary">Choose a different role</Link></p>
        </form>
      </section>
    </PortalShell>
  );
}
