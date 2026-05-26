export type CustomerOrderTouch = { email: string; orderId: string };

export function computeRepeatRate(touches: CustomerOrderTouch[]): { repeatRate: number | null; uniqueCustomers: number; repeatCustomers: number } {
  const byEmail = new Map<string, number>();
  for (const t of touches) {
    if (!t.email) continue;
    const key = t.email.toLowerCase().trim();
    if (!key) continue;
    byEmail.set(key, (byEmail.get(key) ?? 0) + 1);
  }
  const uniqueCustomers = byEmail.size;
  let repeatCustomers = 0;
  byEmail.forEach((count) => {
    if (count >= 2) repeatCustomers += 1;
  });
  const repeatRate = uniqueCustomers > 0 ? Math.round((repeatCustomers / uniqueCustomers) * 10000) / 10000 : null;
  return { repeatRate, uniqueCustomers, repeatCustomers };
}

export function newCustomerCount(args: {
  firstOrderAtByEmail: Map<string, Date>;
  windowStart: Date;
  windowEnd: Date;
}): number {
  let n = 0;
  args.firstOrderAtByEmail.forEach((firstOrderAt) => {
    if (firstOrderAt >= args.windowStart && firstOrderAt <= args.windowEnd) n += 1;
  });
  return n;
}
