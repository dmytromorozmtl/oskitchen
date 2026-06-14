import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeveloperApiRateLimitsPanel } from "@/components/developer/developer-api-rate-limits-panel";
import { requireDeveloperCenterAccess } from "@/lib/developer/developer-permissions";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "Authentication",
    body: "Dashboard sessions use Supabase Auth. Enterprise API access uses hashed API keys on /api/public/v1 — never commit keys to source control.",
  },
  {
    title: "API reference",
    body: "Public REST surface is versioned under /api/public/v1. All writes should be idempotent where possible and include workspace context headers when required.",
  },
  {
    title: "Webhooks",
    body: "Inbound webhooks are verified with provider secrets, persisted as WebhookEvent rows, and processed asynchronously. Replay tooling must stay owner-gated and audited.",
  },
  {
    title: "Imports",
    body: "Channel CSV imports and Import Center jobs emit structured statuses — monitor Developer → Queues & jobs for backlog signals.",
  },
  {
    title: "Environment setup",
    body: "Follow docs/ENVIRONMENT_VARIABLES.md. Developer Center diagnostics are presence-only and safe to share in screenshots.",
  },
  {
    title: "Deployment checklist",
    body: "Run prisma migrate deploy, verify Stripe live/test alignment, configure CRON_SECRET for scheduled routes, and confirm ENCRYPTION_KEY for integration credential storage.",
  },
  {
    title: "Troubleshooting",
    body: "Start at Platform health, then Webhook monitor, then Audit logs. Use incidents to document customer-impacting events.",
  },
];

export default async function DeveloperDocsPage() {
  await requireDeveloperCenterAccess();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">SDK & documentation hub</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Curated operational guidance for platform engineers. OpenAPI spec at{" "}
          <code className="rounded bg-muted px-1 text-xs">/api/openapi.json</code> — per-key rate
          limits, sandbox keys, and TypeScript snippets below.
        </p>
      </div>

      <DeveloperApiRateLimitsPanel />

      <div className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <Card key={s.title}>
            <CardHeader>
              <CardTitle className="text-base">{s.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{s.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>TypeScript snippet</CardTitle>
          <CardDescription>Enterprise key usage sketch</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">
            {`const res = await fetch(process.env.NEXT_PUBLIC_APP_URL + "/api/public/v1/health", {
  headers: { Authorization: \`Bearer \${process.env.KITCHEN_OS_API_KEY}\` },
});
if (!res.ok) throw new Error("API health check failed");`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
