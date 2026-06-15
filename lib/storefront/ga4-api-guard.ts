const CIRCUIT_OPEN_MS = 60 * 60 * 1000;
const MAX_FAILURES = 5;

let failureCount = 0;
let circuitOpenUntil = 0;

export function isGa4ApiCircuitOpen(): boolean {
  if (Date.now() < circuitOpenUntil) return true;
  return false;
}

export function recordGa4ApiSuccess(): void {
  failureCount = 0;
  circuitOpenUntil = 0;
}

export function recordGa4ApiFailure(): void {
  failureCount += 1;
  if (failureCount >= MAX_FAILURES) {
    circuitOpenUntil = Date.now() + CIRCUIT_OPEN_MS;
    failureCount = 0;
  }
}

/** Per-cron throttle — avoid hammering GA4 Data API across many storefronts. */
export async function throttleGa4CronBatch(index: number): Promise<void> {
  const delayMs = Number(process.env.GA4_CRON_STORE_DELAY_MS ?? "250");
  if (index > 0 && delayMs > 0) {
    await new Promise((r) => setTimeout(r, delayMs));
  }
}
