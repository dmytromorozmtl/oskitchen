/**
 * Simple prime-cost overhead allocator (optional).
 * All values are operational estimates — verify with your accountant.
 */
export function allocateOverheadOnPrimeCost(
  primeCost: number,
  overheadPercentOfPrimeCost: number,
  enabled: boolean,
): number {
  if (!enabled || primeCost <= 0 || overheadPercentOfPrimeCost <= 0) return 0;
  return Math.max(0, primeCost * overheadPercentOfPrimeCost);
}
