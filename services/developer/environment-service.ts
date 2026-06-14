import {
  getEnvHealth,
  getEnvSuspicionWarnings,
  getProductionLaunchGaps,
  isResendConfigured,
  isStripeConfigured,
} from "@/lib/env";
import { normalizeEnvGroupLabel, type DeveloperEnvGroup } from "@/lib/developer/environment-groups";

export type EnvDiagnosticStatus = "ok" | "missing" | "invalid" | "insecure" | "deprecated";

export type EnvironmentDiagnosticRow = {
  key: string;
  group: DeveloperEnvGroup | "other";
  status: EnvDiagnosticStatus;
  hint?: string;
  requiredOnProduction: boolean;
};

function rowToDiagnostic(
  row: { key: string; group: string; status: "ok" | "unset" | "blocked"; hint?: string },
  suspicionKeys: Set<string>,
): EnvironmentDiagnosticRow {
  const requiredOnProduction = row.status === "blocked";
  let status: EnvDiagnosticStatus = "ok";
  if (row.status === "blocked" || row.status === "unset") {
    status = "missing";
  }
  if (suspicionKeys.has(row.key)) status = "insecure";
  return {
    key: row.key,
    group: normalizeEnvGroupLabel(row.group),
    status,
    hint: row.hint,
    requiredOnProduction,
  };
}

export function getEnvironmentDiagnostics(): {
  rows: EnvironmentDiagnosticRow[];
  productionGaps: string[];
  suspicionMessages: string[];
} {
  const health = getEnvHealth();
  const suspicions = getEnvSuspicionWarnings();
  const suspicionKeys = new Set<string>();
  for (const h of health) {
    for (const s of suspicions) {
      if (s.includes(h.key)) suspicionKeys.add(h.key);
    }
  }
  const rows = health.map((r) => rowToDiagnostic(r, suspicionKeys));
  return {
    rows,
    productionGaps: getProductionLaunchGaps(),
    suspicionMessages: suspicions,
  };
}

export function getIntegrationReadinessFlags(): {
  stripe: boolean;
  resend: boolean;
  stripePartial: boolean;
} {
  const stripeFull = isStripeConfigured();
  const p = process.env;
  const stripePartial = Boolean(
    p.STRIPE_SECRET_KEY && !stripeFull,
  );
  return {
    stripe: stripeFull,
    resend: isResendConfigured(),
    stripePartial,
  };
}
