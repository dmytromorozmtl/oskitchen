"use client";

import { getActionError } from "@/lib/action-result";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { validateIngredientImportPreviewAction } from "@/actions/import-export";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function IngredientCsvPreviewForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-3"
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const r = await validateIngredientImportPreviewAction(formData);
          if (r.ok) router.push(`/dashboard/import-export/imports/${r.importJobId}`);
          else setError(getActionError(r) ?? "Something went wrong");
        });
      }}
    >
      <div className="space-y-1">
        <Label htmlFor="ingredient-csv">Ingredient CSV</Label>
        <Input
          id="ingredient-csv"
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          className="max-w-md cursor-pointer"
        />
        <p className="text-xs text-muted-foreground">Preview only — no catalog rows are inserted until a confirmed import ships.</p>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Validating…" : "Run validation preview"}
      </Button>
    </form>
  );
}
