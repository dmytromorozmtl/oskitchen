import Link from "next/link";

import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const RUNBOOKS = [
  { path: "docs/runbooks/WEBHOOK_FAILURE_RUNBOOK.md", title: "Webhook failures" },
  { path: "docs/runbooks/IMPORT_FAILURE_RUNBOOK.md", title: "Import failures" },
  { path: "docs/runbooks/EMAIL_FAILURE_RUNBOOK.md", title: "Email / Resend failures" },
  { path: "docs/runbooks/POS_CHECKOUT_ISSUE_RUNBOOK.md", title: "POS checkout issues" },
  { path: "docs/runbooks/STOREFRONT_OUTAGE_RUNBOOK.md", title: "Storefront outage" },
  { path: "docs/runbooks/DATABASE_MIGRATION_RUNBOOK.md", title: "Database migrations" },
  { path: "docs/runbooks/SUPPORT_ESCALATION_RUNBOOK.md", title: "Support escalation" },
] as const;

export default async function PlatformRunbooksPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:access");

  return (
    <div className="space-y-6 text-zinc-200">
      <div>
        <h1 className="text-2xl font-semibold text-white">Runbooks</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
          Markdown runbooks live in the repository under <code className="text-zinc-300">docs/runbooks/</code>. Open the
          file in your editor or Git host — they are not rendered as HTML here to avoid duplicating sensitive procedures
          in the public bundle.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {RUNBOOKS.map((r) => (
          <Card key={r.path} className="border-zinc-800 bg-zinc-900/60">
            <CardHeader>
              <CardTitle className="text-base text-white">{r.title}</CardTitle>
              <CardDescription className="font-mono text-xs text-zinc-500">{r.path}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-500">
                Follow the checklist in-repo. Link below opens the marketing trust area for customer-facing messaging
                only.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Link href="/trust/status" className="text-sm text-amber-200 underline">
        Public status snapshot
      </Link>
    </div>
  );
}
