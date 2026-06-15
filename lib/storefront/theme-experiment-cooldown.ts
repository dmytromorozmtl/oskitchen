import { parseThemeExperimentStored } from "@/lib/storefront/theme-experiment-version";
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export function getExperimentConcludedAt(raw: unknown): string | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const v = (raw as Record<string, unknown>).concludedAt;
  return typeof v === "string" ? v : null;
}

export type ExperimentCooldownBlock = {
  blocked: true;
  message: string;
  daysRemaining: number;
};

/** Blocks re-enabling experiment within 7 days of conclude (reduces carryover). */
export function getExperimentEnableCooldownBlock(
  previousRaw: unknown,
  enabling: boolean,
): ExperimentCooldownBlock | null {
  if (!enabling) return null;
  const stored = parseThemeExperimentStored(previousRaw);
  if (stored?.enabled) return null;

  const concludedAt = getExperimentConcludedAt(previousRaw);
  if (!concludedAt) return null;

  const ended = new Date(concludedAt).getTime();
  if (Number.isNaN(ended)) return null;

  const elapsed = Date.now() - ended;
  if (elapsed >= COOLDOWN_MS) return null;

  const daysRemaining = Math.ceil((COOLDOWN_MS - elapsed) / (24 * 60 * 60 * 1000));
  return {
    blocked: true,
    daysRemaining,
    message: `Wait ${daysRemaining} more day(s) after ending the last experiment before starting a new one (7-day cooldown).`,
  };
}
