"use client";

import { useState } from "react";
import Link from "next/link";

export function NutritionLabelPreview({
  productId,
  productTitle,
  canExport = false,
}: {
  productId: string;
  productTitle: string;
  canExport?: boolean;
}) {
  const [format, setFormat] = useState<"FDA" | "EU">("FDA");
  const [open, setOpen] = useState(false);

  const exportUrl = `/api/export/nutrition-label?productId=${productId}&format=${format}`;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-muted-foreground">{productTitle}:</span>
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value as "FDA" | "EU")}
        className="h-7 rounded border px-2 text-xs"
      >
        <option value="FDA">FDA template</option>
        <option value="EU">EU template</option>
      </select>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-primary underline"
      >
        Preview
      </button>
      {canExport ? (
        <Link href={exportUrl} className="text-primary underline" target="_blank" rel="noreferrer">
          Print {format}
        </Link>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-w-md w-full rounded-2xl bg-card border p-4 shadow-lg">
            <p className="font-medium text-sm">Label preview ({format})</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Opens the generated label in a new tab. Verify allergens and serving size before printing.
            </p>
            <div className="mt-4 flex gap-2">
              {canExport ? (
                <Link
                  href={exportUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-primary px-3 py-1.5 text-xs text-primary-foreground"
                >
                  Open preview
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border px-3 py-1.5 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
