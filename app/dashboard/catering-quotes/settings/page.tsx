import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Catering quote module preferences. Per-quote settings live inside each detail page.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Where to go next</CardTitle>
          <CardDescription>Catering quote settings reuse the existing platform settings pages.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <Link className="text-primary hover:underline" href="/dashboard/customers">
            Customer CRM →
          </Link>
          <Link className="text-primary hover:underline" href="/dashboard/brand-settings">
            Brand settings (logo on proposals) →
          </Link>
          <Link className="text-primary hover:underline" href="/dashboard/team">
            Team &amp; roles →
          </Link>
          <Link className="text-primary hover:underline" href="/dashboard/catering-quotes/templates">
            Quote templates →
          </Link>
        </CardContent>
      </Card>

      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">Public proposal disclosure</CardTitle>
          <CardDescription>
            Public proposal links never expose internal notes, cost estimates, or margins. They show only
            client-facing fields. Use the “Revoke” action on a quote to invalidate an existing link and
            rotate to a new one.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
