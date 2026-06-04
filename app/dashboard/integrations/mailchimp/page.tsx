import Link from "next/link";

import { MailchimpSyncPanel } from "@/components/integrations/mailchimp-sync-panel";
import { BetaBadge } from "@/components/integrations/beta-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isMailchimpSyncConfigured } from "@/services/integrations/mailchimp-sync-service";

export const dynamic = "force-dynamic";

export default async function MailchimpIntegrationPage() {
  const configured = isMailchimpSyncConfigured();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold">Mailchimp</h1>
        <BetaBadge />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connection</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          {configured ? (
            <p className="text-emerald-600">MAILCHIMP_API_KEY and MAILCHIMP_LIST_ID detected</p>
          ) : (
            <p className="text-muted-foreground">
              Set MAILCHIMP_API_KEY (with -us21 suffix) and MAILCHIMP_LIST_ID for audience sync
            </p>
          )}
          <MailchimpSyncPanel configured={configured} />
          <Link href="/dashboard/marketing/email-campaigns" className="text-xs text-primary underline">
            Email campaigns →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
