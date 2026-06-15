/**
 * Load env for CLI scripts — never use `source .env.production.local` in zsh
 * (passwords with ?, &, # break shell parsing and corrupt DATABASE_URL).
 */
import { loadProductionEnvLocal } from "./load-dotenv-file";

export function loadStorefrontScriptEnv(cwd = process.cwd()): string[] {
  return loadProductionEnvLocal(cwd);
}
