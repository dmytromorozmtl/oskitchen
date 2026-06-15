#!/usr/bin/env tsx
import { bigQueryExperimentParityQueryTemplate } from "@/lib/storefront/ga4-parity";

const projectId = process.env.GCP_PROJECT_ID?.trim() ?? "your-gcp-project";
const datasetId = process.env.GA4_BIGQUERY_DATASET?.trim() ?? "analytics_XXXXXXX";
const days = Number(process.env.GA4_PARITY_DAYS ?? "7");

console.log(
  JSON.stringify(
    {
      projectId,
      datasetId,
      days,
      sql: bigQueryExperimentParityQueryTemplate({ projectId, datasetId, days }),
    },
    null,
    2,
  ),
);
