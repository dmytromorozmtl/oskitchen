"use client";

import { Button } from "@/components/ui/button";

export function DemandCsvDownload({ csv, disabled }: { csv: string; disabled: boolean }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="rounded-full"
      disabled={disabled}
      onClick={() => {
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "kitchenos-ingredient-demand.csv";
        a.click();
        URL.revokeObjectURL(url);
      }}
    >
      Download CSV
    </Button>
  );
}
