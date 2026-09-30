import { createFileRoute } from "@tanstack/react-router";
import { OperationsDashboard } from "@/components/operations-dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Command Center — Sahaay Operations" },
      { name: "description", content: "Professional emergency intake, distress scoring, and agency routing command center." },
      { property: "og:title", content: "Command Center — Sahaay Operations" },
      { property: "og:description", content: "Professional emergency intake, distress scoring, and agency routing command center." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <OperationsDashboard />;
}
