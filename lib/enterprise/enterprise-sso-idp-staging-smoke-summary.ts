/**
 * Enterprise SSO IdP staging smoke summary — Evolution Era 17 Cycle 1–2.
 *
 * PASSED / FAILED / SKIPPED WITH REASON for staging IdP login proof path.
 */

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_SUMMARY_VERSION =
  "era17-enterprise-sso-idp-staging-smoke-v1" as const;

export type EnterpriseSsoIdpStagingSmokeStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type EnterpriseSsoIdpStagingSmokeStep = {
  id: string;
  label: string;
  status: EnterpriseSsoIdpStagingSmokeStepStatus;
  reason?: string;
};

export type EnterpriseSsoIdpStagingSmokeOverall = "PASSED" | "FAILED" | "SKIPPED";

export type EnterpriseSsoIdpLoginProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_missing_operator_evidence"
  | "proof_failed";

export type EnterpriseSsoIdpOperatorProofTemplate = {
  operatorEmail: string | null;
  screenshotPath: string | null;
  auditEventRef: string | null;
  negativeTestNote: string | null;
  breakGlassDrillNote: string | null;
  stagingBaseUrl: string | null;
  workspaceId: string | null;
  idpVendor: "OKTA" | "ENTRA_ID" | "AUTH0" | null;
};

export type EnterpriseSsoIdpStagingSmokeSummary = {
  version: typeof ENTERPRISE_SSO_IDP_STAGING_SMOKE_SUMMARY_VERSION;
  runAt: string;
  overall: EnterpriseSsoIdpStagingSmokeOverall;
  wiringCertPassed: boolean;
  idpStagingPrerequisitesMet: boolean;
  loginProofStatus: EnterpriseSsoIdpLoginProofStatus;
  missingEnvVars: string[];
  operatorProof: EnterpriseSsoIdpOperatorProofTemplate;
  steps: EnterpriseSsoIdpStagingSmokeStep[];
};

export type EnterpriseSsoIdpStagingSmokePrerequisiteInput = {
  stagingBaseUrl?: string | null;
  workspaceId?: string | null;
  idpVendor?: string | null;
  allowedDomain?: string | null;
  testEmail?: string | null;
  supabaseProviderRef?: string | null;
};

export type EnterpriseSsoIdpLoginProofEvidenceInput = {
  operatorEmail?: string | null;
  screenshotPath?: string | null;
  auditEventRef?: string | null;
  negativeTestNote?: string | null;
  breakGlassDrillNote?: string | null;
  screenshotExists?: boolean;
};

const PREREQUISITE_ENV_CHECKS: readonly {
  key: string;
  label: string;
  present: (input: EnterpriseSsoIdpStagingSmokePrerequisiteInput) => boolean;
}[] = [
  {
    key: "E2E_STAGING_BASE_URL",
    label: "staging base URL",
    present: (input) => Boolean(input.stagingBaseUrl?.trim()),
  },
  {
    key: "SSO_STAGING_WORKSPACE_ID",
    label: "pilot workspace UUID",
    present: (input) => Boolean(input.workspaceId?.trim()),
  },
  {
    key: "SSO_STAGING_IDP_VENDOR",
    label: "IdP vendor (OKTA, ENTRA_ID, or AUTH0)",
    present: (input) => normalizeSsoIdpVendor(input.idpVendor) !== null,
  },
  {
    key: "SSO_STAGING_ALLOWED_DOMAIN",
    label: "allowed email domain",
    present: (input) => Boolean(input.allowedDomain?.trim()),
  },
  {
    key: "SSO_STAGING_TEST_EMAIL",
    label: "staff test email",
    present: (input) => Boolean(input.testEmail?.trim()),
  },
  {
    key: "SSO_STAGING_SUPABASE_PROVIDER_REF",
    label: "Supabase SAML provider ref",
    present: (input) => Boolean(input.supabaseProviderRef?.trim()),
  },
];

export function listMissingEnterpriseSsoIdpStagingEnvVars(
  input: EnterpriseSsoIdpStagingSmokePrerequisiteInput,
): string[] {
  return PREREQUISITE_ENV_CHECKS.filter((check) => !check.present(input)).map(
    (check) => check.key,
  );
}

export function formatMissingEnterpriseSsoIdpStagingEnvVarsReason(
  missingKeys: readonly string[],
): string {
  if (missingKeys.length === 0) {
    return "All SSO staging prerequisite env vars are set.";
  }
  return `Missing env vars: ${missingKeys.join(", ")} — configure Okta/Entra test tenant and staging secrets before IdP login proof.`;
}

export function normalizeSsoIdpVendor(
  raw: string | null | undefined,
): "OKTA" | "ENTRA_ID" | "AUTH0" | null {
  const value = raw?.trim().toUpperCase();
  if (value === "OKTA") return "OKTA";
  if (value === "ENTRA_ID" || value === "ENTRA" || value === "AZURE" || value === "MICROSOFT") {
    return "ENTRA_ID";
  }
  if (value === "AUTH0" || value === "AUTH_0") return "AUTH0";
  return null;
}

export function evaluateEnterpriseSsoIdpStagingSmokePrerequisites(
  input: EnterpriseSsoIdpStagingSmokePrerequisiteInput,
): { ok: true; idpVendor: "OKTA" | "ENTRA_ID" | "AUTH0" } | { ok: false; reason: string } {
  if (!input.stagingBaseUrl?.trim()) {
    return {
      ok: false,
      reason: formatMissingEnterpriseSsoIdpStagingEnvVarsReason(
        listMissingEnterpriseSsoIdpStagingEnvVars(input),
      ),
    };
  }
  if (!input.workspaceId?.trim()) {
    return {
      ok: false,
      reason: formatMissingEnterpriseSsoIdpStagingEnvVarsReason(
        listMissingEnterpriseSsoIdpStagingEnvVars(input),
      ),
    };
  }
  const idpVendor = normalizeSsoIdpVendor(input.idpVendor);
  if (!idpVendor) {
    return {
      ok: false,
      reason: formatMissingEnterpriseSsoIdpStagingEnvVarsReason(
        listMissingEnterpriseSsoIdpStagingEnvVars(input),
      ),
    };
  }
  if (!input.allowedDomain?.trim()) {
    return {
      ok: false,
      reason: formatMissingEnterpriseSsoIdpStagingEnvVarsReason(
        listMissingEnterpriseSsoIdpStagingEnvVars(input),
      ),
    };
  }
  if (!input.testEmail?.trim()) {
    return {
      ok: false,
      reason: formatMissingEnterpriseSsoIdpStagingEnvVarsReason(
        listMissingEnterpriseSsoIdpStagingEnvVars(input),
      ),
    };
  }
  if (!input.supabaseProviderRef?.trim()) {
    return {
      ok: false,
      reason: formatMissingEnterpriseSsoIdpStagingEnvVarsReason(
        listMissingEnterpriseSsoIdpStagingEnvVars(input),
      ),
    };
  }
  return { ok: true, idpVendor };
}

export function evaluateEnterpriseSsoIdpLoginProofEvidence(
  input: EnterpriseSsoIdpLoginProofEvidenceInput,
): { ok: true } | { ok: false; reason: string; missing: string[] } {
  const missing: string[] = [];
  if (!input.operatorEmail?.trim()) missing.push("SSO_STAGING_OPERATOR_EMAIL");
  if (!input.screenshotPath?.trim()) missing.push("SSO_STAGING_LOGIN_SCREENSHOT_PATH");
  if (!input.auditEventRef?.trim()) missing.push("SSO_STAGING_AUDIT_EVENT_REF");
  if (!input.negativeTestNote?.trim()) missing.push("SSO_STAGING_NEGATIVE_TEST_NOTE");

  if (missing.length > 0) {
    return {
      ok: false,
      reason: `Missing operator proof env vars: ${missing.join(", ")} — complete manual IdP login on staging first.`,
      missing,
    };
  }

  if (input.screenshotExists === false) {
    return {
      ok: false,
      reason: `SSO_STAGING_LOGIN_SCREENSHOT_PATH file not found: ${input.screenshotPath?.trim()}`,
      missing: [],
    };
  }

  const auditRef = input.auditEventRef!.trim().toLowerCase();
  if (!auditRef.includes("sso.login_success")) {
    return {
      ok: false,
      reason:
        "SSO_STAGING_AUDIT_EVENT_REF must reference sso.login_success audit action.",
      missing: [],
    };
  }

  return { ok: true };
}

export function buildEnterpriseSsoIdpOperatorProofTemplate(input: {
  stagingBaseUrl?: string | null;
  workspaceId?: string | null;
  idpVendor?: "OKTA" | "ENTRA_ID" | "AUTH0" | null;
  operatorEmail?: string | null;
  screenshotPath?: string | null;
  auditEventRef?: string | null;
  negativeTestNote?: string | null;
  breakGlassDrillNote?: string | null;
}): EnterpriseSsoIdpOperatorProofTemplate {
  return {
    operatorEmail: input.operatorEmail?.trim() || null,
    screenshotPath: input.screenshotPath?.trim() || null,
    auditEventRef: input.auditEventRef?.trim() || null,
    negativeTestNote: input.negativeTestNote?.trim() || null,
    breakGlassDrillNote: input.breakGlassDrillNote?.trim() || null,
    stagingBaseUrl: input.stagingBaseUrl?.trim() || null,
    workspaceId: input.workspaceId?.trim() || null,
    idpVendor: input.idpVendor ?? null,
  };
}

export function resolveEnterpriseSsoIdpLoginProofStatus(input: {
  prerequisitesMet: boolean;
  idpBrowserLoginStep?: EnterpriseSsoIdpStagingSmokeStep;
}): EnterpriseSsoIdpLoginProofStatus {
  if (!input.prerequisitesMet) return "proof_skipped_missing_prerequisites";
  if (!input.idpBrowserLoginStep) return "proof_skipped_missing_operator_evidence";
  if (input.idpBrowserLoginStep.status === "PASSED") return "proof_passed";
  if (input.idpBrowserLoginStep.status === "FAILED") return "proof_failed";
  return "proof_skipped_missing_operator_evidence";
}

export function formatEnterpriseSsoIdpStagingSmokeStepLine(
  step: EnterpriseSsoIdpStagingSmokeStep,
): string {
  if (step.status === "SKIPPED") {
    return `[SKIPPED WITH REASON] ${step.label}: ${step.reason ?? "skipped"}`;
  }
  if (step.status === "FAILED") {
    return `[FAILED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
  }
  return `[PASSED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
}

export function resolveEnterpriseSsoIdpStagingSmokeOverall(
  steps: readonly EnterpriseSsoIdpStagingSmokeStep[],
): EnterpriseSsoIdpStagingSmokeOverall {
  if (steps.some((step) => step.status === "FAILED")) return "FAILED";
  const actionable = steps.filter((step) => step.status !== "SKIPPED");
  if (actionable.length === 0) return "SKIPPED";
  if (actionable.every((step) => step.status === "PASSED")) return "PASSED";
  return "FAILED";
}

export function buildEnterpriseSsoIdpStagingSmokeSummary(
  steps: readonly EnterpriseSsoIdpStagingSmokeStep[],
  input?: {
    missingEnvVars?: readonly string[];
    operatorProof?: EnterpriseSsoIdpOperatorProofTemplate;
  },
): EnterpriseSsoIdpStagingSmokeSummary {
  const wiringCertPassed = steps.some(
    (step) => step.id === "wiring_cert" && step.status === "PASSED",
  );
  const idpStagingPrerequisitesMet = steps.some(
    (step) => step.id === "idp_staging_prerequisites" && step.status === "PASSED",
  );
  const idpBrowserLoginStep = steps.find((step) => step.id === "idp_browser_login");
  const loginProofStatus = resolveEnterpriseSsoIdpLoginProofStatus({
    prerequisitesMet: idpStagingPrerequisitesMet,
    idpBrowserLoginStep,
  });

  let overall = resolveEnterpriseSsoIdpStagingSmokeOverall(steps);
  if (loginProofStatus !== "proof_passed" && overall === "PASSED") {
    overall = loginProofStatus === "proof_failed" ? "FAILED" : "SKIPPED";
  }

  return {
    version: ENTERPRISE_SSO_IDP_STAGING_SMOKE_SUMMARY_VERSION,
    runAt: new Date().toISOString(),
    overall,
    wiringCertPassed,
    idpStagingPrerequisitesMet,
    loginProofStatus,
    missingEnvVars: [...(input?.missingEnvVars ?? [])],
    operatorProof:
      input?.operatorProof ??
      buildEnterpriseSsoIdpOperatorProofTemplate({}),
    steps: [...steps],
  };
}

export function formatEnterpriseSsoIdpStagingSmokeReportLines(
  summary: EnterpriseSsoIdpStagingSmokeSummary,
): string[] {
  return [
    `Enterprise SSO IdP staging smoke (${summary.version}) — overall: ${summary.overall}`,
    `Run at: ${summary.runAt}`,
    `Wiring cert: ${summary.wiringCertPassed ? "passed" : "not passed"}`,
    `IdP staging prerequisites: ${summary.idpStagingPrerequisitesMet ? "met" : "missing or skipped"}`,
    `Login proof status: ${summary.loginProofStatus}`,
    summary.missingEnvVars.length > 0
      ? `Missing env vars: ${summary.missingEnvVars.join(", ")}`
      : "Missing env vars: none",
    "",
    ...summary.steps.map((step) => formatEnterpriseSsoIdpStagingSmokeStepLine(step)),
  ];
}
