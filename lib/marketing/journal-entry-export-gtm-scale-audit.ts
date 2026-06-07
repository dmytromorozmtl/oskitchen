import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { CHART_OF_ACCOUNTS_MAPPING_ROUTE } from "@/lib/accounting/chart-of-accounts-mapping-absolute-final-policy";
import {
  JOURNAL_ENTRY_EXPORT_ABSOLUTE_FINAL_POLICY_ID,
  JOURNAL_ENTRY_EXPORT_COMPONENT_PATH,
  JOURNAL_ENTRY_EXPORT_ROUTE,
} from "@/lib/accounting/journal-entry-export-absolute-final-policy";
import { GL_DEPTH_ACCOUNTING_ROUTE } from "@/lib/accounting/gl-depth-accounting-policy";
import {
  JOURNAL_ENTRY_EXPORT_GTM_SCALE_DOC_PATH,
  JOURNAL_ENTRY_EXPORT_GTM_SCALE_HONESTY_MARKERS,
  JOURNAL_ENTRY_EXPORT_GTM_SCALE_WIRING_PATHS,
} from "@/lib/marketing/journal-entry-export-gtm-scale-absolute-final-policy";

export type JournalEntryExportGtmScaleAudit = {
  ok: boolean;
  failures: string[];
};

export function auditJournalEntryExportGtmScaleWiring(
  root = process.cwd(),
): JournalEntryExportGtmScaleAudit {
  const failures: string[] = [];

  for (const rel of JOURNAL_ENTRY_EXPORT_GTM_SCALE_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const docSource = readFileSync(join(root, JOURNAL_ENTRY_EXPORT_GTM_SCALE_DOC_PATH), "utf8");
  const componentSource = readFileSync(join(root, JOURNAL_ENTRY_EXPORT_COMPONENT_PATH), "utf8");

  for (const marker of JOURNAL_ENTRY_EXPORT_GTM_SCALE_HONESTY_MARKERS) {
    if (!docSource.includes(marker)) {
      failures.push(`doc missing honesty marker: ${marker}`);
    }
  }

  if (!docSource.includes(JOURNAL_ENTRY_EXPORT_COMPONENT_PATH)) {
    failures.push("doc missing feature component path");
  }

  if (!docSource.includes(JOURNAL_ENTRY_EXPORT_ROUTE)) {
    failures.push("doc missing journal entry export route");
  }

  if (!docSource.includes(CHART_OF_ACCOUNTS_MAPPING_ROUTE)) {
    failures.push("doc missing chart of accounts mapping cross-link");
  }

  if (!docSource.includes(GL_DEPTH_ACCOUNTING_ROUTE)) {
    failures.push("doc missing GL-depth sync cross-link");
  }

  if (
    !componentSource.includes("journal-entry-export-absolute-final-v1") &&
    !componentSource.includes(JOURNAL_ENTRY_EXPORT_ABSOLUTE_FINAL_POLICY_ID)
  ) {
    failures.push("component missing feature policy id");
  }

  if (!docSource.includes("journal-entry-export-gtm-scale-absolute-final-v1")) {
    failures.push("doc missing GTM policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
