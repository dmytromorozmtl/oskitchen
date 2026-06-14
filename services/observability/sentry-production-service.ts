import {
  SENTRY_PRODUCTION_ERA70_ACTIVATION_SCRIPT,
  SENTRY_PRODUCTION_ERA70_DEVELOPER_PATH,
  SENTRY_PRODUCTION_ERA70_OPS_DOC,
  SENTRY_PRODUCTION_ERA70_POLICY_ID,
  SENTRY_PRODUCTION_ERA70_RECOMMENDED_ENV_VARS,
  SENTRY_PRODUCTION_ERA70_REQUIRED_ENV_VARS,
  SENTRY_PRODUCTION_ERA70_SUMMARY_ARTIFACT,
} from "@/lib/observability/sentry-production-era70-policy";
import {
  auditSentryProductionWiring,
  listMissingSentryProductionEnvVars,
  type SentryProductionSmokeSummary,
} from "@/lib/observability/sentry-production-summary";
import { loadExtendedHealthSnapshot } from "@/services/observability/health-check-service";

export type SentryProductionDashboard = {
  policyId: typeof SENTRY_PRODUCTION_ERA70_POLICY_ID;
  path: typeof SENTRY_PRODUCTION_ERA70_DEVELOPER_PATH;
  opsDoc: typeof SENTRY_PRODUCTION_ERA70_OPS_DOC;
  activationScript: typeof SENTRY_PRODUCTION_ERA70_ACTIVATION_SCRIPT;
  artifactPath: typeof SENTRY_PRODUCTION_ERA70_SUMMARY_ARTIFACT;
  requiredEnvVars: readonly string[];
  recommendedEnvVars: readonly string[];
  missingEnvVars: string[];
  wiringOk: boolean;
  wiringFailures: string[];
  sentryServer: "not_configured" | "live" | "dsn_uninitialized";
  observabilityBackend: string;
  proofStatus: SentryProductionSmokeSummary["proofStatus"] | "unknown";
  activationReady: boolean;
};

export async function loadSentryProductionDashboard(): Promise<SentryProductionDashboard> {
  const [extended, wiring] = await Promise.all([
    loadExtendedHealthSnapshot(),
    Promise.resolve(auditSentryProductionWiring(process.cwd())),
  ]);

  const missingEnvVars = listMissingSentryProductionEnvVars(process.env);
  const activationReady = wiring.ok && missingEnvVars.length === 0;

  let proofStatus: SentryProductionDashboard["proofStatus"] = "unknown";
  if (extended.sentryServer === "live") {
    proofStatus = "proof_passed";
  } else if (missingEnvVars.length > 0) {
    proofStatus = "proof_skipped_awaiting_dsn";
  } else if (extended.sentryServer === "dsn_uninitialized") {
    proofStatus = "proof_failed_wiring";
  }

  return {
    policyId: SENTRY_PRODUCTION_ERA70_POLICY_ID,
    path: SENTRY_PRODUCTION_ERA70_DEVELOPER_PATH,
    opsDoc: SENTRY_PRODUCTION_ERA70_OPS_DOC,
    activationScript: SENTRY_PRODUCTION_ERA70_ACTIVATION_SCRIPT,
    artifactPath: SENTRY_PRODUCTION_ERA70_SUMMARY_ARTIFACT,
    requiredEnvVars: SENTRY_PRODUCTION_ERA70_REQUIRED_ENV_VARS,
    recommendedEnvVars: SENTRY_PRODUCTION_ERA70_RECOMMENDED_ENV_VARS,
    missingEnvVars,
    wiringOk: wiring.ok,
    wiringFailures: wiring.failures,
    sentryServer: extended.sentryServer,
    observabilityBackend: extended.observability,
    proofStatus,
    activationReady,
  };
}
