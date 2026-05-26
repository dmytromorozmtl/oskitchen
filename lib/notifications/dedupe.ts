/**
 * Compose a deterministic dedupe key for a (rule, recipient, source) tuple
 * within a sliding window. The legacy `notification_logs.dedupeKey` column
 * has a UNIQUE constraint — collisions short-circuit duplicate sends.
 */
export type DedupeInput = {
  ruleKey: string;
  recipient: string;
  sourceType: string;
  sourceId?: string | null;
  /**
   * Window size in minutes. The bucket index is appended so the same
   * tuple can re-send once the next window opens (e.g. a daily reminder
   * uses windowMinutes = 24*60).
   */
  windowMinutes: number;
  /** Optional override of the bucket reference time. */
  now?: Date;
};

export function buildDedupeKey(input: DedupeInput): string {
  const now = input.now ?? new Date();
  const bucket = Math.floor(now.getTime() / (input.windowMinutes * 60_000));
  const parts = [
    input.ruleKey,
    input.recipient.toLowerCase().trim(),
    input.sourceType,
    input.sourceId ?? "-",
    `b${bucket}`,
  ];
  return parts.join("|");
}

/** Stable dedupe key for an event that should never repeat (e.g. order confirmation). */
export function staticDedupeKey(ruleKey: string, recipient: string, sourceType: string, sourceId: string): string {
  return [ruleKey, recipient.toLowerCase().trim(), sourceType, sourceId, "static"].join("|");
}
