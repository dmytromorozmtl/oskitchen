/**
 * Platform integration / webhook audit action names.
 * Use these strings with `auditLog` so filters stay consistent.
 *
 * Note: replay/retry actions must only be emitted from real server mutations
 * that perform those operations — never from UI placeholders.
 */
export const PLATFORM_INTEGRATION_DIAGNOSTICS_VIEWED =
  "PLATFORM_INTEGRATION_DIAGNOSTICS_VIEWED" as const;

/** Emit when a platform user requests webhook replay and a server action executes it. */
export const PLATFORM_WEBHOOK_REPLAY_REQUESTED = "PLATFORM_WEBHOOK_REPLAY_REQUESTED" as const;

/** Emit when a platform user requests an integration retry/sync and a server action executes it. */
export const PLATFORM_INTEGRATION_RETRY_REQUESTED =
  "PLATFORM_INTEGRATION_RETRY_REQUESTED" as const;
