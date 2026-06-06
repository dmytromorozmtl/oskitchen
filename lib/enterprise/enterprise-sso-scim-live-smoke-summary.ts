/**
 * Enterprise SSO + SCIM smoke summary — wiring audit (Era 139).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ENTERPRISE_SSO_SCIM_LIVE_ERA139_CAPABILITIES,
  ENTERPRISE_SSO_SCIM_LIVE_ERA139_POLICY_ID,
  ENTERPRISE_SSO_SCIM_LIVE_ERA139_ROUTE,
  ENTERPRISE_SSO_SCIM_LIVE_ERA139_SERVICE,
  ENTERPRISE_SSO_SCIM_LIVE_ERA139_WIRING_PATHS,
} from "@/lib/enterprise/enterprise-sso-scim-live-era139-policy";

export const ENTERPRISE_SSO_SCIM_LIVE_SMOKE_SUMMARY_VERSION =
  ENTERPRISE_SSO_SCIM_LIVE_ERA139_POLICY_ID;

export type EnterpriseSsoScimLiveSmokeEra139Overall = "PASSED" | "FAILED" | "SKIPPED";

export type EnterpriseSsoScimLiveSmokeEra139ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type EnterpriseSsoScimLiveSmokeEra139Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type EnterpriseSsoScimLiveSmokeEra139Summary = {
  version: typeof ENTERPRISE_SSO_SCIM_LIVE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: EnterpriseSsoScimLiveSmokeEra139Overall;
  proofStatus: EnterpriseSsoScimLiveSmokeEra139ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  capabilities: readonly string[];
  steps: EnterpriseSsoScimLiveSmokeEra139Step[];
  honestyNote: string;
};

export function auditEnterpriseSsoScimLiveSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of ENTERPRISE_SSO_SCIM_LIVE_ERA139_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === ENTERPRISE_SSO_SCIM_LIVE_ERA139_SERVICE) {
      if (!src.includes("loadEnterpriseSsoScimLiveDashboard")) {
        failures.push("enterprise-sso-scim-live-service.ts missing loadEnterpriseSsoScimLiveDashboard");
      }
      if (!src.includes("getWorkspaceSsoAdminView")) {
        failures.push("enterprise-sso-scim-live-service.ts missing getWorkspaceSsoAdminView");
      }
      if (!src.includes("getWorkspaceScimAdminView")) {
        failures.push("enterprise-sso-scim-live-service.ts missing getWorkspaceScimAdminView");
      }
      if (!src.includes("buildEnterpriseSsoScimLiveDashboard")) {
        failures.push("enterprise-sso-scim-live-service.ts missing buildEnterpriseSsoScimLiveDashboard");
      }
    }

    if (rel === "lib/enterprise/enterprise-sso-scim-live-builders.ts") {
      if (!src.includes("buildEnterpriseSsoScimLiveDashboard")) {
        failures.push("enterprise-sso-scim-live-builders.ts missing buildEnterpriseSsoScimLiveDashboard");
      }
      if (!src.includes("buildEnterpriseIdpLiveCards")) {
        failures.push("enterprise-sso-scim-live-builders.ts missing buildEnterpriseIdpLiveCards");
      }
      if (!src.includes("buildEnterpriseScimLiveStatus")) {
        failures.push("enterprise-sso-scim-live-builders.ts missing buildEnterpriseScimLiveStatus");
      }
      if (!src.includes("ENTERPRISE_SSO_LIVE_IDPS")) {
        failures.push("enterprise-sso-scim-live-builders.ts missing ENTERPRISE_SSO_LIVE_IDPS");
      }
    }

    if (rel === "lib/enterprise/enterprise-sso-scim-live-policy.ts") {
      if (!src.includes("ENTERPRISE_SSO_SCIM_LIVE_POLICY_ID")) {
        failures.push("enterprise-sso-scim-live-policy.ts missing policy id");
      }
      if (!src.includes("ENTERPRISE_SSO_SCIM_LIVE_PATH")) {
        failures.push("enterprise-sso-scim-live-policy.ts missing route path");
      }
      if (!src.includes("ENTERPRISE_SSO_LIVE_IDPS")) {
        failures.push("enterprise-sso-scim-live-policy.ts missing LIVE IdPs");
      }
      if (!src.includes("SCIM_API_BASE_PATH")) {
        failures.push("enterprise-sso-scim-live-policy.ts missing SCIM API base path");
      }
      if (!src.includes("ENTERPRISE_SSO_DELIVERY_STATUS_LIVE")) {
        failures.push("enterprise-sso-scim-live-policy.ts missing SSO LIVE status");
      }
      if (!src.includes("ENTERPRISE_SCIM_DELIVERY_STATUS_LIVE")) {
        failures.push("enterprise-sso-scim-live-policy.ts missing SCIM LIVE status");
      }
    }

    if (rel === "app/dashboard/enterprise/sso-scim/page.tsx") {
      if (!src.includes("loadEnterpriseSsoScimLiveDashboard")) {
        failures.push("sso-scim page missing loadEnterpriseSsoScimLiveDashboard");
      }
      if (!src.includes("EnterpriseSsoScimLivePanel")) {
        failures.push("sso-scim page missing EnterpriseSsoScimLivePanel");
      }
      if (
        !src.includes(
          "LIVE SAML SSO for Okta, Microsoft Entra ID, and Google Workspace",
        )
      ) {
        failures.push("sso-scim page missing LIVE IdP copy");
      }
    }

    if (rel === "components/enterprise/enterprise-sso-scim-live-panel.tsx") {
      if (!src.includes("enterprise-sso-scim-live-panel")) {
        failures.push("enterprise-sso-scim-live-panel.tsx missing root test id");
      }
      if (!src.includes("SSO LIVE")) {
        failures.push("enterprise-sso-scim-live-panel.tsx missing SSO LIVE badge");
      }
      if (!src.includes("SCIM LIVE")) {
        failures.push("enterprise-sso-scim-live-panel.tsx missing SCIM LIVE badge");
      }
      if (!src.includes("Okta")) {
        failures.push("enterprise-sso-scim-live-panel.tsx missing Okta IdP card");
      }
      if (!src.includes("SCIM 2.0 provisioning")) {
        failures.push("enterprise-sso-scim-live-panel.tsx missing SCIM provisioning section");
      }
      if (!src.includes("idp-card-")) {
        failures.push("enterprise-sso-scim-live-panel.tsx missing IdP card test ids");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveEnterpriseSsoScimLiveSmokeEra139ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): EnterpriseSsoScimLiveSmokeEra139ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildEnterpriseSsoScimLiveSmokeEra139Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): EnterpriseSsoScimLiveSmokeEra139Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveEnterpriseSsoScimLiveSmokeEra139ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: EnterpriseSsoScimLiveSmokeEra139Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: EnterpriseSsoScimLiveSmokeEra139Step[] = [
    {
      id: "wiring_audit",
      label: "Okta · Entra · Google SSO → RFC 7644 SCIM",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 139 Enterprise SSO + SCIM cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: ENTERPRISE_SSO_SCIM_LIVE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: ENTERPRISE_SSO_SCIM_LIVE_ERA139_ROUTE,
    capabilities: ENTERPRISE_SSO_SCIM_LIVE_ERA139_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires IdP tenant and SCIM bearer token activation.",
  };
}

export function formatEnterpriseSsoScimLiveSmokeEra139ReportLines(
  summary: EnterpriseSsoScimLiveSmokeEra139Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
