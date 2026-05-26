import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StorefrontNotificationsAdminPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Notifications</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Storefront order emails use the same Resend pipeline as the rest of KitchenOS. Configure provider keys and
          templates in workspace settings — nothing here is required for checkout to succeed.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Email provider</CardTitle>
          <CardDescription>
            Set <span className="font-mono">RESEND_API_KEY</span> and a verified sender domain in production. Diagnostics
            live under Settings → Notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" className="rounded-full">
            <Link href="/dashboard/settings/notifications">Workspace notifications</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/notifications/provider">Provider status</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Storefront-specific routing</CardTitle>
          <CardDescription>
            Per-form notification targets (<span className="font-mono">StorefrontForm.notificationEmail</span>) are stored
            in the database — wire them in the form builder when you connect structured forms to Resend.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Until then, contact and catering submissions continue to land in Settings → recent submissions.
        </CardContent>
      </Card>
    </div>
  );
}
