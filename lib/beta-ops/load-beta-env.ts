import { loadEnvFiles } from "../../scripts/lib/load-dotenv-file";

const BETA_ENV_FILES = [
  ".env",
  ".env.local",
  ".env.beta.local",
  ".env.staging.local",
] as const;

/** Load beta/staging env files into process.env (shell exports win). */
export function loadBetaEnv(cwd = process.cwd()): string[] {
  return loadEnvFiles([...BETA_ENV_FILES], cwd, { skipEmptyInFile: true });
}

/** Map smoke URL to Playwright base URL when unset. */
export function applyPlaywrightEnvFromSmoke(): void {
  const smoke = process.env.SMOKE_BASE_URL?.trim();
  if (smoke && !process.env.PLAYWRIGHT_BASE_URL?.trim()) {
    process.env.PLAYWRIGHT_BASE_URL = smoke.replace(/\/$/, "");
  }
}
