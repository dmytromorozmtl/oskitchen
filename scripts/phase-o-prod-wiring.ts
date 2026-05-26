#!/usr/bin/env tsx
/**
 * Phase O+ — production wiring checklist.
 * Run: npm run ops:phase-o-prod-wiring
 */

const phaseOChecklist = {
  phase: "O+",
  recommended_order: ["O1 Causal forest", "O2 Feature stream", "O5 Post-publish guard", "O3 CRDT gossip", "O4 FedRAMP"],
  o1_causal_forest: {
    env: ["THEME_EXPERIMENT_CAUSAL_FOREST=1", "THEME_EXPERIMENT_CAUSAL_ALIGN_PP=3"],
    bq: "experiment_causal_lift_daily → POST /api/webhooks/bigquery-causal-lift",
    gate: "publish_draft requires causalForestPassed + hierarchical alignment",
    json: "causalLiftDaily + auto postWinnerHoldoutPercent",
  },
  o2_feature_stream: {
    env: [
      "THEME_EXPERIMENT_FEATURE_STREAM_BUS=1",
      "THEME_EXPERIMENT_REALTIME_REGRET_PP=3",
      "THEME_EXPERIMENT_REALTIME_EXPLORATION_CAP=10",
      "EXPERIMENT_FEATURE_STREAM_WEBHOOK_SECRET",
    ],
    webhook: "POST /api/webhooks/experiment-feature-stream",
    cron: "/api/cron/storefront-experiment-linucb-realtime (* * * * *)",
  },
  o5_post_publish: {
    env: ["THEME_EXPERIMENT_POST_PUBLISH_GUARD=1", "THEME_EXPERIMENT_POST_PUBLISH_WINDOW_HOURS=24"],
    cron: "/api/cron/storefront-experiment-post-publish-guard (0 * * * *)",
    slack: "experiment_rollback_confirm | experiment_rollback_keep",
    behavior: "2σ drop → rollbackPending + freeze auto-conclude 7d",
  },
  o3_crdt_gossip: {
    env: ["THEME_EXPERIMENT_CRDT_GOSSIP=1", "EDGE_CONFIG_ID_LOCAL"],
    cron: "/api/cron/storefront-experiment-crdt-gossip (0 8 * * *)",
    read: "local replica first → majority → primary",
  },
  o4_fedramp: {
    env: ["AUDIT_ARCHIVE_S3_REPLICA_BUCKET", "AUDIT_ARCHIVE_S3_COMPLIANCE_MODE=1"],
    cron: "/api/cron/soc2-fedramp-replicate (quarterly)",
    sql: "prisma/sql/experiment-auditor-rls.sql",
  },
  phase_p: "Implemented — run npm run ops:phase-p-prod-wiring",
};

console.log(JSON.stringify(phaseOChecklist, null, 2));
