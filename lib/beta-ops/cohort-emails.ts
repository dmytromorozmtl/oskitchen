import { loadCohortRegistry, parseEmailList } from "@/lib/beta-ops/cohort-registry";

export type CohortEmailSource = "argv" | "env" | "registry" | "none";

/** Resolve pilot kitchen emails from CLI, env, or saved registry. */
export function resolveCohortEmails(argv = process.argv): {
  emails: string[];
  source: CohortEmailSource;
} {
  const fromArgv = parseEmailList(
    argv.find((a) => a.startsWith("--emails="))?.split("=").slice(1).join("="),
  );
  if (fromArgv.length) return { emails: fromArgv, source: "argv" };

  const fromEnv = parseEmailList(process.env.BETA_COHORT_EMAILS);
  if (fromEnv.length) return { emails: fromEnv, source: "env" };

  const registry = loadCohortRegistry();
  const fromRegistry = registry?.kitchens.map((k) => k.email) ?? [];
  if (fromRegistry.length) return { emails: fromRegistry, source: "registry" };

  return { emails: [], source: "none" };
}

export function hasCohortEmails(argv = process.argv): boolean {
  return resolveCohortEmails(argv).emails.length > 0;
}
