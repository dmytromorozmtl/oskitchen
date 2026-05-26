/** Pure helpers for Edge Config read-after-write verification. */

export function edgeVersionMatchesExpected(input: {
  experimentEnabled: boolean;
  expectedVersion: number;
  edgeVersion: number | null;
}): boolean {
  if (!input.experimentEnabled) {
    return input.edgeVersion === null;
  }
  return input.edgeVersion === input.expectedVersion;
}

export async function pollEdgeVersionMatch(input: {
  experimentEnabled: boolean;
  expectedVersion: number;
  readVersion: () => Promise<number | null>;
  maxAttempts?: number;
  delayMs?: number;
}): Promise<{ matched: boolean; edgeVersion: number | null }> {
  const max = input.maxAttempts ?? 5;
  const delay = input.delayMs ?? 350;
  let last: number | null = null;

  for (let i = 0; i < max; i++) {
    last = await input.readVersion();
    if (
      edgeVersionMatchesExpected({
        experimentEnabled: input.experimentEnabled,
        expectedVersion: input.expectedVersion,
        edgeVersion: last,
      })
    ) {
      return { matched: true, edgeVersion: last };
    }
    if (i < max - 1) {
      await new Promise((r) => setTimeout(r, delay * (i + 1)));
    }
  }
  return { matched: false, edgeVersion: last };
}
