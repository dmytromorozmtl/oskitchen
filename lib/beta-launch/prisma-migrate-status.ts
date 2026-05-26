const REMEDIATION_MIGRATIONS = [
  "20260517120000_workspace_phase1_order_menu_product",
  "20260517140000_workspace_phase2_integration_webhook",
] as const;

export type MigrateStatusSummary = {
  ok: boolean;
  pendingCount: number;
  pendingRemediation: string[];
  databaseReachable: boolean;
  rawExcerpt: string;
};

/** Parse `prisma migrate status` stdout/stderr (best-effort). */
export function parsePrismaMigrateStatus(output: string): MigrateStatusSummary {
  const text = output.trim();
  const databaseReachable = !/can't reach|ECONNREFUSED|P1001/i.test(text);

  const pending: string[] = [];
  const pendingSection = text.match(
    /following migration(?:s)? have not yet been applied:([\s\S]*?)(?:\n\n|$)/i,
  );
  if (pendingSection?.[1]) {
    for (const line of pendingSection[1].split("\n")) {
      const m = line.match(/^\s*(\d{14}_[\w]+)/);
      if (m?.[1]) pending.push(m[1]);
    }
  }

  const pendingRemediation = pending.filter((p) =>
    (REMEDIATION_MIGRATIONS as readonly string[]).some((r) => p.includes(r) || r.includes(p)),
  );

  const upToDate = /database schema is up to date/i.test(text);
  const ok = databaseReachable && (upToDate || pendingRemediation.length === 0);

  return {
    ok,
    pendingCount: pending.length,
    pendingRemediation,
    databaseReachable,
    rawExcerpt: text.slice(0, 1200),
  };
}

export function remediationMigrationIds(): readonly string[] {
  return REMEDIATION_MIGRATIONS;
}
