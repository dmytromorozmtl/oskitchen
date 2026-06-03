import { loadEnvFiles, loadStagingPilotEnv } from "./load-dotenv-file";

/** Optional local file for channel live smokes (never commit secrets). */
export const SMOKE_ENV_FILE_PATHS = [".env.smoke.local"] as const;

/**
 * Load env for channel live smokes:
 * 1. `.env` → `.env.local` → `.env.staging.local` (vault / pilot)
 * 2. `.env.smoke.local` fills only keys still empty (overrides never committed)
 */
export function loadSmokeEnv(cwd = process.cwd()): string[] {
  const staging = loadStagingPilotEnv(cwd);
  const smokeOnly = loadEnvFiles([...SMOKE_ENV_FILE_PATHS], cwd, { skipEmptyInFile: true });
  return [...new Set([...staging, ...smokeOnly])];
}
