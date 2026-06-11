import Link from "next/link";

import { MailchimpLivePanel } from "@/components/integrations/mailchimp-live-panel";
import { LiveBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getMailchimpLiveDashboard } from "@/services/integrations/mailchimp/mailchimp-live-service";

export const metadata = {
  title: "Mailchimp LIVE — Integrations",
  description: "OAuth, email list sync, and campaign automation for Mailchimp.",
};

export default async function MailchimpLivePage() {
  const { userId } = await getTenantActor();
  const dashboard = await getMailchimpLiveDashboard(userId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {dashboard.mode === "placeholder" ? (
        <PlaceholderBanner
          feature="Mailchimp LIVE"
          detail="Set MAILCHIMP_CLIENT_ID, MAILCHIMP_CLIENT_SECRET, and MAILCHIMP_LIST_ID."
        />
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Mailchimp LIVE</h1>
            <LiveBadge />
          </div>
          <p className="text-sm text-muted-foreground">
            OAuth, email list sync, and campaign automation.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/mailchimp">← Integration settings</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live controls</CardTitle>
        </CardHeader>
        <CardContent>
          <MailchimpLivePanel dashboard={dashboard} />
        </CardContent>
      </Card>
    </div>
  );
}
