"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  DESIGN_POLISH_BADGE_ROW_CLASS,
  DESIGN_POLISH_CARD_CLASS,
  DESIGN_POLISH_HERO_BANNER_CLASS,
  DESIGN_POLISH_ROW_SURFACE_CLASS,
} from "@/lib/design/absolute-final-design-polish-tokens";
import {
  DATA_MIGRATION_ENTITIES,
  DATA_MIGRATION_POS_SOURCES,
  DATA_MIGRATION_UPLOAD_ROUTE,
  DATA_MIGRATION_WIZARD_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/import/data-migration-wizard-absolute-final-policy";
import type {
  DataMigrationEntity,
  DataMigrationPosSource,
} from "@/lib/import/data-migration-wizard-absolute-final-policy";
import { getDataMigrationProfile } from "@/lib/import/data-migration-profiles";
import {
  buildMigrationUploadQuery,
  previewPosMigrationMapping,
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

const ENTITY_LABELS: Record<DataMigrationEntity, string> = {
  menu: "Menu / catalog",
  customers: "Customers",
  orders: "Order history",
};

export function MigrationWizardClient() {
  const [source, setSource] = useState<DataMigrationPosSource>("toast");
  const [entity, setEntity] = useState<DataMigrationEntity>("menu");
  const [csvText, setCsvText] = useState("");
  const [step, setStep] = useState<"pick" | "preview" | "upload">("pick");
  const [rollbackSnapshot, setRollbackSnapshot] = useState<string | null>(null);

  const profile = getDataMigrationProfile(source, entity);

  const preview = useMemo(() => {
    if (!csvText.trim()) return null;
    return previewPosMigrationMapping(source, entity, parseCsvPreview(csvText));
  }, [source, entity, csvText]);

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

  const progressPct = step === "pick" ? 33 : step === "preview" ? 66 : 100;

  return (
    <div className="space-y-6" data-testid="data-migration-wizard">
      <div className={DESIGN_POLISH_HERO_BANNER_CLASS} role="note">
        <p className="font-medium text-foreground">Data migration wizard (Beta)</p>
        <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground/90">
          <strong className="text-foreground">CSV export path — not live API.</strong> Export from
          Toast, Square, or Lightspeed, paste sample rows here, then continue to Import Center upload
          for <strong className="text-foreground">manual review</strong>. Live POS API migration
          remains <Badge variant="secondary">BETA</Badge>.
        </p>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted dark:bg-muted/50">
        <div
          className="h-full bg-primary transition-all duration-300 dark:bg-primary/90"
          style={{ width: `${progressPct}%` }}
          data-testid="data-migration-wizard-progress"
        />
      </div>

      <div className={DESIGN_POLISH_BADGE_ROW_CLASS}>
        {DATA_MIGRATION_ENTITIES.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => {
              setEntity(e);
              setStep("pick");
            }}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              entity === e
                ? "border-primary bg-primary/10 text-primary dark:border-primary/70 dark:bg-primary/15"
                : "text-muted-foreground dark:border-border/60 dark:hover:bg-muted/20"
            }`}
            data-testid={`data-migration-entity-${e}`}
          >
            {ENTITY_LABELS[e]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {DATA_MIGRATION_POS_SOURCES.map((src) => (
          <Card
            key={src}
            className={`cursor-pointer ${DESIGN_POLISH_CARD_CLASS} ${
              source === src ? "ring-2 ring-primary dark:ring-primary/70" : ""
            }`}
            onClick={() => {
              setSource(src);
              setStep("pick");
            }}
            data-testid={`data-migration-source-${src}`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base capitalize">{src}</CardTitle>
              <CardDescription>{getDataMigrationProfile(src, entity)?.label}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground dark:text-muted-foreground/90">
              {Object.keys(getDataMigrationProfile(src, entity)?.fieldMap ?? {}).length} field
              mappings
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className={DESIGN_POLISH_CARD_CLASS}>
        <CardHeader>
          <CardTitle className="text-base">{profile?.label ?? "Migration preview"}</CardTitle>
          <CardDescription>{profile?.exportHint}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Paste CSV header + up to 5 sample rows from your export…"
            className="min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 font-mono text-sm dark:border-border/60 dark:bg-background/95"
            data-testid="data-migration-csv-input"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePreview}
              className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground dark:bg-primary/90"
            >
              Preview mapping
            </button>
            {step === "preview" ? (
              <button
                type="button"
                onClick={handleRollback}
                className="rounded-xl border px-4 py-2 text-sm dark:border-border/60"
              >
                Rollback draft
              </button>
            ) : null}
            <Link
              href={`${DATA_MIGRATION_UPLOAD_ROUTE}${buildMigrationUploadQuery(source, entity)}`}
              className="rounded-xl border px-4 py-2 text-sm dark:border-border/60"
              onClick={() => setStep("upload")}
              data-testid="data-migration-continue-upload"
            >
              Continue to upload →
            </Link>
          </div>

          {step === "preview" && preview ? (
            <div
              className={`space-y-3 overflow-x-auto p-3 text-xs ${DESIGN_POLISH_ROW_SURFACE_CLASS}`}
            >
              {preview.unmappedColumns.length > 0 ? (
                <p className="text-amber-700 dark:text-amber-300">
                  Unmapped columns (manual review): {preview.unmappedColumns.join(", ")}
                </p>
              ) : null}
              {preview.rows.length === 0 ? (
                <p className="text-muted-foreground dark:text-muted-foreground/90">
                  No rows parsed — check CSV format.
                </p>
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

      <p className="font-mono text-[10px] text-muted-foreground dark:text-muted-foreground/90">
        Policy {DATA_MIGRATION_WIZARD_ABSOLUTE_FINAL_POLICY_ID}
      </p>
      <p className="sr-only">{DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID}</p>
    </div>
  );
}
