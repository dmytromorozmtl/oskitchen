import Link from "next/link";

import { ImportCenterUploadForm } from "@/components/dashboard/import-center/upload-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireImportCenterUploadPageAccess } from "@/lib/import-center/import-center-page-access";

const STEPS = [
  "Choose import type",
  "Download template",
  "Upload CSV",
  "Column mapping",
  "Validation preview",
  "Review actions",
  "Confirm commit",
  "Results & rollback",
] as const;

type SearchParams = { type?: string };

export default async function ImportCenterUploadPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const access = await requireImportCenterUploadPageAccess();
  if (!access.ok) return access.deny;
  const params = (await searchParams) ?? {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Upload CSV</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          The upload step parses your CSV and runs row-by-row validation. No production records
          are written until you explicitly commit the preview.
        </p>
      </div>

      <ol className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, idx) => (
          <li key={step} className="rounded-lg border border-border/80 bg-muted/40 px-3 py-2">
            <span className="font-mono text-xs text-muted-foreground">{idx + 1}.</span> {step}
          </li>
        ))}
      </ol>

      <ImportCenterUploadForm defaultType={params.type} />

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Tips</CardTitle>
          <CardDescription>
            Use templates so column headers match KitchenOS field names automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Start from a{" "}
          <Link href="/dashboard/import-center/templates" className="font-medium text-primary underline underline-offset-4">
            template
          </Link>{" "}
          to avoid mapping errors. Once uploaded, the validation preview shows you exactly what will be
          created, updated, skipped, or rejected.
        </CardContent>
      </Card>
    </div>
  );
}
