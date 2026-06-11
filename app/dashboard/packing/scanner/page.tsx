import Link from "next/link";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import {
  hasPackingManagePageAccess,
  loadWorkspacePermissionPageActor,
  resolvePackingDeniedSurfaceId,
} from "@/lib/ux/permission-denied-page-access-era19";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function PackingScannerHubPage() {
  const actor = await loadWorkspacePermissionPageActor();

  if (!hasPackingManagePageAccess(actor)) {
    return (
      <PermissionDeniedSurfaceCard surfaceId={resolvePackingDeniedSurfaceId("scanner")} />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Packing scanner</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Handheld verification flows should stay fast and touch-first. Today the barcode/QR path is anchored on the
          packing verification surface — this hub is a stable URL for training and bookmarks.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verification</CardTitle>
          <CardDescription>Scan items, resolve mismatches, mark packed.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/dashboard/packing/verify">Open packing verify</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
