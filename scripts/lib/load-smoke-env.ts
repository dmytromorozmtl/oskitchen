import { loadEnvFiles, loadStagingPilotEnv } from "./load-dotenv-file";

/** Optional local files for channel live smokes (never commit secrets). */
export const SMOKE_ENV_FILE_PATHS = [
  ".env.integration-sandbox.local",
  ".env.smoke.local",
] as const;

/**
 * Load env for channel live smokes:
 * 1. `.env` → `.env.local` → `.env.staging.local` (vault / pilot)
 * 2. `.env.integration-sandbox.local` / `.env.smoke.local` fill only keys still empty
 */
export function loadSmokeEnv(cwd = process.cwd()): string[] {
  const staging = loadStagingPilotEnv(cwd);
  const smokeOnly = loadEnvFiles([...SMOKE_ENV_FILE_PATHS], cwd, { skipEmptyInFile: true });
  return [...new Set([...staging, ...smokeOnly])];
}
