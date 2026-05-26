"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MIGRATION_SOURCES,
  previewMigrationMapping,
  type MigrationSource,
} from "@/services/import/migration-service";

function parseCsvPreview(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0]!.split(",").map((h) => h.trim());
  return lines.slice(1, 6).map((line) => {
    const cells = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h, (cells[i] ?? "").trim()]));
  });
}

export function MigrationWizardClient() {
  const [source, setSource] = useState<MigrationSource>("toast");
  const [csvText, setCsvText] = useState("");
  const [step, setStep] = useState<"pick" | "preview" | "done">("pick");
  const [rollbackSnapshot, setRollbackSnapshot] = useState<string | null>(null);

  const preview = useMemo(() => {
    if (!csvText.trim()) return null;
    return previewMigrationMapping(source, parseCsvPreview(csvText));
  }, [source, csvText]);

  const def = MIGRATION_SOURCES.find((s) => s.id === source);

  function handlePreview() {
    if (!csvText.trim()) {
      toast.error("Paste a few CSV rows to preview mapping");
      return;
    }
    setRollbackSnapshot(csvText);
    setStep("preview");
  }

  function handleRollback() {
    if (rollbackSnapshot) setCsvText(rollbackSnapshot);
    setStep("pick");
    toast.info("Reverted to previous CSV draft");
  }

  return (
    <div className="space-y-6">
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: step === "pick" ? "33%" : step === "preview" ? "66%" : "100%" }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MIGRATION_SOURCES.map((src) => (
          <Card
            key={src.id}
            className={source === src.id ? "ring-2 ring-primary" : ""}
            onClick={() => setSource(src.id)}
          >
            <CardHeader>
              <CardTitle className="text-base">{src.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-muted-foreground">{Object.keys(src.fieldMap).length} field mappings</p>
              <button
                type="button"
                className="text-primary underline text-xs"
                onClick={() => setSource(src.id)}
              >
                Select source
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">CSV preview — {def?.label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Paste header + up to 5 sample rows…"
            className="w-full min-h-[120px] rounded-xl border px-3 py-2 text-sm font-mono"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePreview}
              className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"
            >
              Preview mapping
            </button>
            {step === "preview" ? (
              <button type="button" onClick={handleRollback} className="rounded-xl border px-4 py-2 text-sm">
                Rollback draft
              </button>
            ) : null}
            <Link href="/dashboard/import-center/upload" className="rounded-xl border px-4 py-2 text-sm">
              Continue to upload →
            </Link>
          </div>

          {step === "preview" && preview ? (
            <div className="rounded-lg border p-3 text-xs space-y-2 overflow-x-auto">
              {preview.rows.length === 0 ? (
                <p className="text-muted-foreground">No rows parsed — check CSV format.</p>
              ) : (
                preview.rows.map((row, i) => (
                  <pre key={i} className="whitespace-pre-wrap">
                    {JSON.stringify(row.mapped, null, 2)}
                  </pre>
                ))
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
