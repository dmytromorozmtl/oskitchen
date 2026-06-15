/** True when a calendar day (pickup/delivery) falls inside any blackout window (inclusive dates). */
export function isDateInStorefrontBlackout(
  rows: { startDate: Date; endDate: Date }[],
  fulfillmentDay: Date | undefined | null,
): boolean {
  if (!fulfillmentDay || rows.length === 0) return false;
  const t = fulfillmentDay.getTime();
  for (const r of rows) {
    const s = new Date(r.startDate);
    s.setHours(0, 0, 0, 0);
    const e = new Date(r.endDate);
    e.setHours(23, 59, 59, 999);
    if (t >= s.getTime() && t <= e.getTime()) return true;
  }
  return false;
}
