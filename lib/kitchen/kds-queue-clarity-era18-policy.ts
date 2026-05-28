/**
 * KDS queue clarity polish — Evolution Era 18 Workstream G Cycle 7.
 *
 * Queue summary strip, ticket numbers, prep/expo sections, oldest-first sort.
 * Does NOT claim rush-hour SLO certification or Toast expo parity.
 */

export const KDS_QUEUE_CLARITY_ERA18_POLICY_ID = "era18-kds-queue-clarity-v1" as const;

export const KDS_QUEUE_CLARITY_ERA18_DECISION_DATE = "2026-05-28" as const;

export const KDS_QUEUE_CLARITY_ERA18_PROOF_STATUS = "kds_queue_clarity_wired" as const;

export const KDS_QUEUE_CLARITY_ERA18_DAILY_SERVICE_MODULE =
  "components/kitchen/kds-daily-service.tsx" as const;

export const KDS_QUEUE_CLARITY_ERA18_HELPER_MODULE =
  "lib/kitchen/kds-queue-clarity-era18.ts" as const;

export const KDS_QUEUE_CLARITY_ERA18_UX_TARGETS = [
  "Queue summary strip — active, prep, ready, overdue counts",
  "Ticket number + table on each card",
  "Prep vs expo (ready) sections with oldest-first sort",
  "Overdue visual + sound unchanged from KDS v1",
] as const;

export const KDS_QUEUE_CLARITY_ERA18_FORBIDDEN_CLAIMS = [
  "rush-hour kds slo certified",
  "toast expo parity",
  "production kds realtime slo",
] as const;

export const KDS_QUEUE_CLARITY_ERA18_UNIT_TESTS = [
  "tests/unit/kds-queue-clarity-era18.test.ts",
] as const;

export const KDS_QUEUE_CLARITY_ERA18_BACKLOG_ID = "KOS-E18-007" as const;
