export function startSpanSafe(_name: string, fn: () => void): void {
  fn();
}
