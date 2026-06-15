/** Logical grouping for environment diagnostics (values never exposed). */
export const DEVELOPER_ENV_GROUPS = [
  "app",
  "database",
  "security",
  "auth",
  "payments",
  "notifications",
  "integrations",
  "AI",
  "maps",
  "queues",
  "observability",
  "demo",
] as const;

export type DeveloperEnvGroup = (typeof DEVELOPER_ENV_GROUPS)[number];

const GROUP_MAP: Record<string, DeveloperEnvGroup> = {
  App: "app",
  Database: "database",
  Supabase: "database",
  Security: "security",
  Stripe: "payments",
  Resend: "notifications",
  Integrations: "integrations",
  Demo: "demo",
  AI: "AI",
  Maps: "maps",
};

export function normalizeEnvGroupLabel(raw: string): DeveloperEnvGroup | "other" {
  const mapped = GROUP_MAP[raw];
  if (mapped) return mapped;
  const g = raw.toLowerCase();
  if (g === "auth") return "auth";
  if (g === "payments") return "payments";
  if (DEVELOPER_ENV_GROUPS.includes(g as DeveloperEnvGroup)) return g as DeveloperEnvGroup;
  return "other";
}
