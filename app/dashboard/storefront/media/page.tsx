import Link from "next/link";

import { MediaLibrary } from "@/components/storefront/media/media-library";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { isStorefrontMediaUploadConfigured } from "@/lib/storefront-builder/media-config";
import { prisma } from "@/lib/prisma";
import { listStorefrontMediaForOwner } from "@/services/storefront-builder/media-service";

export default async function StorefrontMediaPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const sf = await findAdminStorefront(user.id, { id: true });
  if (!sf) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">Media</h1>
        <Card>
          <CardHeader>
            <CardTitle>Not set up yet</CardTitle>
            <CardDescription>Configure the storefront overview first.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/storefront">Open overview</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const assets = await listStorefrontMediaForOwner(dataUserId, sf.id);
  const uploadConfigured = isStorefrontMediaUploadConfigured();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Media library</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Central list of <code className="font-mono">storefront_assets</code>. Uploads activate only when storage is configured
            server-side — no simulated uploads.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full" size="sm">
          <Link href="/dashboard/storefront/theme">Theme URLs</Link>
        </Button>
      </div>
      <MediaLibrary assets={assets} uploadConfigured={uploadConfigured} />
    </div>
  );
}
