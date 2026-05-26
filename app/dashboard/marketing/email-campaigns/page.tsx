import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { listEmailCampaignFlows } from "@/services/marketing/email-marketing-service";

export default async function EmailCampaignsPage() {
  const flows = await listEmailCampaignFlows();

  return (
    <PageShell>
      <h1 className="text-2xl font-semibold tracking-tight">Email campaigns</h1>
      <p className="mt-2 text-sm text-muted-foreground">Klaviyo-triggered flows (welcome, cart, post-purchase, win-back).</p>
      <ul className="mt-6 space-y-2">
        {flows.map((f) => (
          <li key={f.id} className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm">
            <span>{f.label}</span>
            <span className={f.configured ? "text-green-600" : "text-amber-600"}>
              {f.configured ? "Ready" : "Set KLAVIYO_API_KEY"}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm">
        <Link href="/dashboard/marketing" className="text-primary underline-offset-4 hover:underline">
          ← Marketing
        </Link>
      </p>
    </PageShell>
  );
}
