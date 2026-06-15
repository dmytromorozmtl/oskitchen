/** Logical origin of an error recovery row. */
export const ERROR_RECOVERY_SOURCES = ["WEBHOOK_JOB"] as const;
export type ErrorRecoverySourceKey = (typeof ERROR_RECOVERY_SOURCES)[number];
