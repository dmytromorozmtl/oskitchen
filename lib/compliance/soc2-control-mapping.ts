/**
 * P4 — SOC2 Type II control mapping for experiment platform crons.
 */

export type Soc2ControlId = "CC6.1" | "CC7.2" | "CC8.1";

export type ExperimentCronControl = {
  path: string;
  schedule: string;
  controls: Soc2ControlId[];
  description: string;
};

export const EXPERIMENT_CRON_CONTROLS: ExperimentCronControl[] = [
  {
    path: "/api/cron/storefront-experiment-srm",
    schedule: "0 */6 * * *",
    controls: ["CC7.2"],
    description: "SRM monitoring — assignment integrity",
  },
  {
    path: "/api/cron/storefront-ga4-parity",
    schedule: "30 */6 * * *",
    controls: ["CC7.2"],
    description: "GA4 parity — measurement accuracy",
  },
  {
    path: "/api/cron/storefront-experiment-audit-archive",
    schedule: "0 3 * * 0",
    controls: ["CC6.1"],
    description: "Immutable audit archive to S3",
  },
  {
    path: "/api/cron/storefront-experiment-audit-control",
    schedule: "0 7 * * *",
    controls: ["CC7.2", "CC6.1"],
    description: "Continuous audit stream controls",
  },
  {
    path: "/api/cron/soc2-experiment-evidence",
    schedule: "0 4 * * 1",
    controls: ["CC6.1"],
    description: "Weekly SOC2 evidence pack",
  },
  {
    path: "/api/cron/storefront-experiment-auto-conclude",
    schedule: "0 10 * * *",
    controls: ["CC8.1"],
    description: "Auto-conclude with approval gates",
  },
  {
    path: "/api/cron/storefront-experiment-feature-store",
    schedule: "0 2 * * *",
    controls: ["CC7.2"],
    description: "ML feature store materialization",
  },
  {
    path: "/api/cron/storefront-experiment-linucb-realtime",
    schedule: "* * * * *",
    controls: ["CC7.2"],
    description: "LinUCB realtime edge sync",
  },
  {
    path: "/api/cron/storefront-experiment-post-publish-guard",
    schedule: "0 * * * *",
    controls: ["CC8.1", "CC7.2"],
    description: "Post-publish regression guard",
  },
  {
    path: "/api/cron/storefront-experiment-crdt-gossip",
    schedule: "0 8 * * *",
    controls: ["CC6.1"],
    description: "CRDT tombstone GC",
  },
  {
    path: "/api/cron/soc2-fedramp-replicate",
    schedule: "0 4 1 */3 *",
    controls: ["CC6.1"],
    description: "Cross-region evidence replication",
  },
  {
    path: "/api/cron/soc2-type2-evidence-binder",
    schedule: "0 5 1 * *",
    controls: ["CC6.1", "CC7.2"],
    description: "Monthly Type II evidence binder",
  },
];

export type Soc2EvidenceBinder = {
  generatedAt: string;
  period: string;
  controls: {
    controlId: Soc2ControlId;
    cronPaths: string[];
    evidenceArtifacts: string[];
    status: "operating" | "exception";
  }[];
};

export function buildSoc2Type2EvidenceBinder(): Soc2EvidenceBinder {
  const byControl = new Map<Soc2ControlId, ExperimentCronControl[]>();
  for (const c of EXPERIMENT_CRON_CONTROLS) {
    for (const id of c.controls) {
      const list = byControl.get(id) ?? [];
      list.push(c);
      byControl.set(id, list);
    }
  }

  const now = new Date();
  const period = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  const controls: Soc2EvidenceBinder["controls"] = [];
  for (const [controlId, crons] of byControl) {
    controls.push({
      controlId,
      cronPaths: crons.map((c) => c.path),
      evidenceArtifacts: [
        "s3://experiment-audit/soc2/manifest.json",
        "s3://experiment-audit/soc2/access-certification-*.json",
        "storefront_experiment_audit_events",
      ],
      status: "operating",
    });
  }

  return {
    generatedAt: now.toISOString(),
    period,
    controls,
  };
}
