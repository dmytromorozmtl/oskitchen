export type WaitlistConfig = {
  baseMinutes: number;
  minutesPerPartyAhead: number;
  minutesPerGuestOverTwo: number;
  maxQuotedMinutes: number;
  notifyGraceMinutes: number;
};

export type WaitlistEntryForEstimate = {
  id: string;
  partySize: number;
  createdAt: Date;
  status: string;
};

export type WaitlistQueueItem = {
  id: string;
  position: number;
  estimatedWaitMinutes: number;
};

export const DEFAULT_WAITLIST_CONFIG: WaitlistConfig = {
  baseMinutes: 5,
  minutesPerPartyAhead: 8,
  minutesPerGuestOverTwo: 2,
  maxQuotedMinutes: 120,
  notifyGraceMinutes: 10,
};

export function parseWaitlistConfig(settingsCenterJson: unknown): WaitlistConfig {
  const base = DEFAULT_WAITLIST_CONFIG;
  if (!settingsCenterJson || typeof settingsCenterJson !== "object") return base;
  const root = settingsCenterJson as Record<string, unknown>;
  const raw = root.waitlist;
  if (!raw || typeof raw !== "object") return base;
  const cfg = raw as Record<string, unknown>;
  return {
    baseMinutes: clampInt(cfg.baseMinutes, 0, 60, base.baseMinutes),
    minutesPerPartyAhead: clampInt(cfg.minutesPerPartyAhead, 1, 60, base.minutesPerPartyAhead),
    minutesPerGuestOverTwo: clampInt(cfg.minutesPerGuestOverTwo, 0, 30, base.minutesPerGuestOverTwo),
    maxQuotedMinutes: clampInt(cfg.maxQuotedMinutes, 10, 240, base.maxQuotedMinutes),
    notifyGraceMinutes: clampInt(cfg.notifyGraceMinutes, 5, 60, base.notifyGraceMinutes),
  };
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function sortWaitingEntries(entries: WaitlistEntryForEstimate[]): WaitlistEntryForEstimate[] {
  return entries
    .filter((entry) => entry.status === "WAITING")
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export function estimateWaitMinutesForPosition(
  positionIndex: number,
  queue: WaitlistEntryForEstimate[],
  config: WaitlistConfig,
): number {
  let total = config.baseMinutes;
  for (let i = 0; i < positionIndex; i++) {
    const ahead = queue[i];
    if (!ahead) continue;
    total += config.minutesPerPartyAhead;
    total += Math.max(0, ahead.partySize - 2) * config.minutesPerGuestOverTwo;
  }
  return Math.min(config.maxQuotedMinutes, Math.ceil(total));
}

export function buildWaitlistQueueSummary(
  entries: WaitlistEntryForEstimate[],
  config: WaitlistConfig = DEFAULT_WAITLIST_CONFIG,
): WaitlistQueueItem[] {
  const queue = sortWaitingEntries(entries);
  return queue.map((entry, index) => ({
    id: entry.id,
    position: index + 1,
    estimatedWaitMinutes: estimateWaitMinutesForPosition(index, queue, config),
  }));
}

export function findQueueItemForEntry(
  entryId: string,
  entries: WaitlistEntryForEstimate[],
  config: WaitlistConfig = DEFAULT_WAITLIST_CONFIG,
): WaitlistQueueItem | null {
  return buildWaitlistQueueSummary(entries, config).find((item) => item.id === entryId) ?? null;
}

export function formatWaitlistJoinedSms(params: {
  storeName: string;
  position: number;
  estimatedMinutes: number;
}): string {
  return `${params.storeName}: You're #${params.position} on the waitlist. Estimated wait ~${params.estimatedMinutes} min. We'll text when your table is ready.`;
}

export function formatWaitlistReadySms(params: {
  storeName: string;
  graceMinutes: number;
}): string {
  return `${params.storeName}: Your table is ready! Please check in with the host within ${params.graceMinutes} minutes.`;
}

export function formatReservationConfirmationSms(params: {
  storeName: string;
  reservationDate: string;
  partySize: number;
  confirmationCode?: string | null;
}): string {
  const code = params.confirmationCode ? ` Ref: ${params.confirmationCode}.` : "";
  return `${params.storeName}: Reservation confirmed for ${params.partySize} on ${params.reservationDate}.${code}`;
}

export async function sendReservationConfirmationSms(params: {
  storeName: string;
  customerPhone: string;
  reservationDate: string;
  partySize: number;
  confirmationCode?: string | null;
}): Promise<
  import("@/services/notifications/sms-service").SmsSendResult
> {
  const { sendSmsNotification } = await import("@/services/notifications/sms-service");
  return sendSmsNotification({
    to: params.customerPhone,
    body: formatReservationConfirmationSms({
      storeName: params.storeName,
      reservationDate: params.reservationDate,
      partySize: params.partySize,
      confirmationCode: params.confirmationCode,
    }),
  });
}
