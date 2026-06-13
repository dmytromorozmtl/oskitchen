/**
 * Load test suite scoring helpers (P3-56).
 */

export type LoadTestMetrics = {
  requestCount: number;
  errorRate: number;
  p95Ms: number;
  durationMs: number;
};

export function loadTestBurstPassed(
  metrics: LoadTestMetrics,
  input: { maxErrorRate: number; maxP95Ms: number; minRequests: number },
): boolean {
  return (
    metrics.requestCount >= input.minRequests &&
    metrics.errorRate <= input.maxErrorRate &&
    metrics.p95Ms <= input.maxP95Ms
  );
}

export function loadTestConcurrencyPassed(
  metrics: LoadTestMetrics,
  input: { maxErrorRate: number; maxP95Ms: number; minRequests: number },
): boolean {
  return loadTestBurstPassed(metrics, input);
}

export function summarizeLoadTestRun(samples: number[]): LoadTestMetrics {
  if (samples.length === 0) {
    return { requestCount: 0, errorRate: 1, p95Ms: Number.POSITIVE_INFINITY, durationMs: 0 };
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const p95Index = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));
  const failures = samples.filter((value) => value < 0).length;

  return {
    requestCount: samples.length,
    errorRate: failures / samples.length,
    p95Ms: sorted[p95Index] ?? sorted[sorted.length - 1]!,
    durationMs: samples.reduce((sum, value) => sum + Math.abs(value), 0),
  };
}

export function simulateWebhookBurstSamples(count: number, failureEvery = 0): number[] {
  return Array.from({ length: count }, (_, index) => {
    if (failureEvery > 0 && index % failureEvery === 0) return -401;
    return 45 + (index % 7) * 3;
  });
}

export function simulateKdsRefreshSamples(count: number): number[] {
  return Array.from({ length: count }, (_, index) => 80 + (index % 5) * 12);
}

export function simulatePosCheckoutConcurrencySamples(count: number): number[] {
  return Array.from({ length: count }, (_, index) => 120 + (index % 9) * 15);
}
