"use client";

import { useState, useTransition } from "react";

import { uploadImportCsvAction } from "@/actions/import-center";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IMPORT_COMMIT_MODES,
  IMPORT_COMMIT_MODE_LABEL,
  IMPORT_TYPES,
  IMPORT_TYPE_LABEL,
} from "@/lib/import-center/import-types";

export function ImportCenterUploadForm({ defaultType }: { defaultType?: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload CSV</CardTitle>
        <CardDescription>
          Pick an import type and commit mode, then upload a CSV. The file is parsed and validated;
          nothing is committed until you approve the preview.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 md:grid-cols-2"
          action={(formData) =>
            startTransition(async () => {
              setError(null);
              try {
                await uploadImportCsvAction(formData);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Upload failed");
              }
            })
          }
          encType="multipart/form-data"
        >
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Import type</span>
            <select
              name="type"
              required
              defaultValue={defaultType ?? "PRODUCTS"}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              {IMPORT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {IMPORT_TYPE_LABEL[type]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Commit mode</span>
            <select
              name="mode"
              defaultValue="CREATE_ONLY"
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              {IMPORT_COMMIT_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {IMPORT_COMMIT_MODE_LABEL[mode]}
                </option>
              ))}
            </select>
          </label>
          <label className="md:col-span-2 grid gap-1 text-sm">
            <span className="font-medium">CSV file</span>
            <input
              type="file"
              name="file"
              accept=".csv,text/csv"
              required
              className="rounded-md border px-3 py-2 text-sm"
            />
            <span className="text-xs text-muted-foreground">
              The file is parsed in memory. Caps: 8 MB, 10,000 rows. Up to 800 preview rows are
              persisted for review.
            </span>
          </label>
          <div className="md:col-span-2 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Upload runs validation only — explicit commit is required afterwards.
            </p>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Validating…" : "Upload & validate"}
            </Button>
          </div>
          {error ? (
            <p className="md:col-span-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
