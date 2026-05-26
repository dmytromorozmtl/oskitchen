import Link from "next/link";

import { ImportCenterUploadForm } from "@/components/dashboard/import-center/upload-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";

export const dynamic = "force-dynamic";

export default async function ProductsImportPage() {
  await getTenantActor();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import products</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload a CSV to bulk-create catalog items. Preview and validation run before anything is
          committed.
        </p>
      </div>

      <ImportCenterUploadForm defaultType="PRODUCTS" />

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Need the full import center?</CardTitle>
          <CardDescription>History, rollback, and other entity types live in Import Center.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="secondary" className="rounded-full">
            <Link href="/dashboard/import-center/upload?type=PRODUCTS">Open Import Center</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
