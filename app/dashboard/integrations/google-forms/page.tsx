import Link from "next/link";

import { GoogleFormsSyncPanel } from "@/components/integrations/google-forms-sync-panel";
import { BetaBadge } from "@/components/integrations/beta-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isGoogleFormsSyncConfigured } from "@/services/integrations/google-forms-sync-service";

export const dynamic = "force-dynamic";

export default async function GoogleFormsIntegrationPage() {
  const configured = isGoogleFormsSyncConfigured();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold">Google Forms</h1>
        <BetaBadge />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sheet-linked intake</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {configured ? (
            <p className="text-emerald-600">
              GOOGLE_FORMS_SHEET_ACCESS_TOKEN and GOOGLE_FORMS_SHEET_ID detected
            </p>
          ) : (
            <p className="text-muted-foreground">
              Set GOOGLE_FORMS_SHEET_ACCESS_TOKEN and GOOGLE_FORMS_SHEET_ID. Link your form to a
              Google Sheet (default tab: Form Responses 1). Optional: GOOGLE_FORMS_SHEET_RANGE.
            </p>
          )}
          <GoogleFormsSyncPanel configured={configured} />
          <Link href="/dashboard/import-center" className="text-xs text-primary underline">
            Import center →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
