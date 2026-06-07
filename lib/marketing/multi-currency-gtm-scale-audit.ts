import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { MULTI_CURRENCY_SETTINGS_ROUTE } from "@/lib/finance/multi-currency-policy";
import {
  MULTI_CURRENCY_GTM_SCALE_DOC_PATH,
  MULTI_CURRENCY_GTM_SCALE_HONESTY_MARKERS,
  MULTI_CURRENCY_GTM_SCALE_WIRING_PATHS,
} from "@/lib/marketing/multi-currency-gtm-scale-absolute-final-policy";

export type MultiCurrencyGtmScaleAudit = {
  ok: boolean;
  failures: string[];
};

export function auditMultiCurrencyGtmScaleWiring(root = process.cwd()): MultiCurrencyGtmScaleAudit {
  const failures: string[] = [];

  for (const rel of MULTI_CURRENCY_GTM_SCALE_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const docSource = readFileSync(join(root, MULTI_CURRENCY_GTM_SCALE_DOC_PATH), "utf8");

  for (const marker of MULTI_CURRENCY_GTM_SCALE_HONESTY_MARKERS) {
    if (!docSource.includes(marker)) {
      failures.push(`doc missing honesty marker: ${marker}`);
    }
  }

  if (!docSource.includes(MULTI_CURRENCY_SETTINGS_ROUTE)) {
    failures.push("doc missing currency settings route");
  }

  if (!docSource.includes("multi-currency-gtm-scale-absolute-final-v1")) {
    failures.push("doc missing policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
