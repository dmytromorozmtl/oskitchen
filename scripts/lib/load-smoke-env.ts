import { loadEnvFiles } from "./load-dotenv-file";

/** Optional local file for channel live smokes (never commit secrets). */
export const SMOKE_ENV_FILE_PATHS = [".env.smoke.local"] as const;

/** Load smoke env into `process.env` (later files override earlier). */
export function loadSmokeEnv(cwd = process.cwd()): string[] {
  return loadEnvFiles([...SMOKE_ENV_FILE_PATHS], cwd, { skipEmptyInFile: true });
}
