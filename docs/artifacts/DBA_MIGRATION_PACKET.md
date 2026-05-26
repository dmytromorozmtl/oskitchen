# DBA Migration Approval Packet — KitchenOS

Generated: 2026-05-17T19:12:07.670Z

## Executive summary

Remediation migrations add **nullable** `workspace_id` columns and indexes. They are **additive** and safe to deploy before backfill. Application code already writes `workspaceId` on new rows.

| Migration | Risk | Backfill |
|-----------|------|----------|
| `20260517120000_workspace_phase1_order_menu_product` | LOW | Required after deploy |
| `20260517140000_workspace_phase2_integration_webhook` | LOW | Required after deploy |

## Pre-deploy checklist (DBA)

1. [ ] Snapshot / PITR confirmed for staging DB
2. [ ] Maintenance window communicated (index creation may lock briefly)
3. [ ] `DIRECT_URL` points to session pooler `:5432` (not transaction pooler)
4. [ ] Approve `npx prisma migrate deploy` on staging first, then production after smoke
5. [ ] Post-deploy: `npm run staging:remediation-all` or backfill scripts manually
6. [ ] Verify: `npm run check:backfill` → all OK

## Remediation migration detail

### 20260517120000_workspace_phase1_order_menu_product

- **Risk:** LOW
- **SQL size:** 1850 bytes

- Additive nullable columns — no table rewrite required on PG 11+.
- Backfill required after deploy: npm run backfill:workspace-id
- Runtime already sets workspaceId on new orders.
- Indexes created CONCURRENTLY-safe via IF NOT EXISTS (brief lock on first create).
- Rollback: columns are nullable; app tolerates NULL workspace_id until backfill completes.

### 20260517140000_workspace_phase2_integration_webhook

- **Risk:** LOW
- **SQL size:** 1209 bytes

- Additive nullable columns — no table rewrite required on PG 11+.
- Backfill required: npm run backfill:workspace-phase2
- Indexes created CONCURRENTLY-safe via IF NOT EXISTS (brief lock on first create).
- Rollback: columns are nullable; app tolerates NULL workspace_id until backfill completes.

## Full migration inventory

| Migration | Remediation | Risk | Bytes |
|-----------|-------------|------|-------|
| `20260106120000_init` | — | MEDIUM | 5750 |
| `20260207140000_storefront_production_layer` | — | MEDIUM | 9289 |
| `20260207150000_hardening` | — | HIGH | 4638 |
| `20260215120000_platform_support_session` | — | MEDIUM | 1897 |
| `20260506140000_gtm_layer` | — | MEDIUM | 11051 |
| `20260506200000_monetization_layer` | — | MEDIUM | 5193 |
| `20260506223000_implementation_layer` | — | LOW | 11811 |
| `20260506225000_external_readiness` | — | LOW | 2699 |
| `20260506231000_scale_readiness` | — | MEDIUM | 13848 |
| `20260506235545_init2` | — | LOW | 228 |
| `20260507140000_storefront_commerce_v2` | — | MEDIUM | 14336 |
| `20260507160000_business_type_expansion` | — | LOW | 1068 |
| `20260507180000_integrations_platform` | — | LOW | 10996 |
| `20260507191500_ingredient_demand_command_center` | — | LOW | 6643 |
| `20260507193000_channel_setup_and_credential_audit` | — | MEDIUM | 2149 |
| `20260507194500_channel_import_pipeline_reliability` | — | MEDIUM | 9488 |
| `20260507194600_external_order_channel_batch_link` | — | LOW | 466 |
| `20260507203000_purchasing_command_center` | — | MEDIUM | 11794 |
| `20260508120000_kitchen_module_preferences` | — | MEDIUM | 990 |
| `20260508140000_sellable_onboarding_demo` | — | MEDIUM | 763 |
| `20260509130000_beta_applications` | — | LOW | 872 |
| `20260510180000_advanced_vertical_features` | — | MEDIUM | 23045 |
| `20260511120000_automation_engine_foundation` | — | MEDIUM | 3204 |
| `20260511150000_route_command_center` | — | LOW | 8363 |
| `20260511180000_tasks_operations_command_center` | — | LOW | 9347 |
| `20260511200000_platform_admin_foundation` | — | MEDIUM | 4052 |
| `20260511220000_locations_management_center` | — | LOW | 3705 |
| `20260511224500_customer_crm_command_center` | — | LOW | 14047 |
| `20260511230000_meal_plans_command_center` | — | LOW | 8957 |
| `20260511235000_catering_quotes_command_center` | — | LOW | 14658 |
| `20260512000000_analytics_command_center` | — | LOW | 5092 |
| `20260513000000_forecast_planning_center` | — | LOW | 6512 |
| `20260513183000_partner_operating_system` | — | HIGH | 9163 |
| `20260513200000_onboarding_adaptive_json` | — | LOW | 165 |
| `20260514000000_reports_center` | — | LOW | 1117 |
| `20260514180000_pos_terminal_module` | — | MEDIUM | 12992 |
| `20260514190000_support_issue_resolution_center` | — | LOW | 2059 |
| `20260514190001_support_issue_resolution_center_data` | — | LOW | 13495 |
| `20260515000000_executive_command_center` | — | LOW | 3943 |
| `20260515120000_channel_operations_center` | — | MEDIUM | 1499 |
| `20260516000000_ai_copilot` | — | LOW | 7997 |
| `20260516120000_menu_center_strategy` | — | MEDIUM | 947 |
| `20260516130100_menu_catalog_only` | — | MEDIUM | 407 |
| `20260516145000_brand_management_center` | — | HIGH | 2923 |
| `20260516160000_production_command_center` | — | MEDIUM | 10940 |
| `20260517000000_playbooks` | — | LOW | 9861 |
| `20260517120000_workspace_phase1_order_menu_product` | yes | LOW | 1850 |
| `20260517140000_packing_command_center` | — | MEDIUM | 12387 |
| `20260517140000_workspace_phase2_integration_webhook` | yes | LOW | 1209 |
| `20260517160000_packing_qc_verification` | — | MEDIUM | 8668 |
| `20260518000000_workspace_templates` | — | LOW | 5181 |
| `20260518103000_nutrition_labels_module` | — | MEDIUM | 10124 |
| `20260520140000_costing_profitability_command_center` | — | MEDIUM | 10906 |
| `20260520160000_data_operations_import_export` | — | MEDIUM | 4992 |
| `20260521000000_implementation_center` | — | LOW | 7297 |
| `20260521120000_import_center` | — | LOW | 1494 |
| `20260521150000_product_mapping_workbench` | — | LOW | 8886 |
| `20260522100000_go_live_command_center` | — | LOW | 13181 |
| `20260523100000_training_command_center` | — | LOW | 26119 |
| `20260524100000_staff_workforce_center` | — | LOW | 10338 |
| `20260525100000_billing_center` | — | LOW | 7167 |
| `20260526100000_order_creation_center` | — | LOW | 2455 |
| `20260527100000_notification_center` | — | LOW | 6264 |
| `20260528100000_settings_center` | — | LOW | 308 |
| `20260529100000_audit_trail_center` | — | LOW | 4150 |
| `20260530120000_growth_os_foundation` | — | LOW | 1804 |
| `20260531120000_beta_program_operations_center` | — | MEDIUM | 5493 |
| `20260531120100_support_ticket_status_cancelled_enum` | — | LOW | 186 |
| `20260531120200_kitchen_settings_pos_settings_json` | — | LOW | 301 |
| `20260614120000_storefront_next_pass_theme_slider_assets` | — | LOW | 1966 |
| `20260615140000_storefront_followup_gaps` | — | LOW | 2806 |
| `20260615150000_storefront_first_party_analytics_mode` | — | LOW | 207 |
| `20260615180000_webhook_processing_jobs` | — | MEDIUM | 1652 |
| `20260615190000_error_recovery_items` | — | MEDIUM | 1725 |
| `20260616120000_phase4_storefront_polish` | — | LOW | 1813 |
| `20260617120000_phase5bf_storefront_growth` | — | LOW | 487 |
| `20260618120000_phase5_platform_experiments` | — | LOW | 92 |
| `20260619120000_phase6_ci_commerce_ops` | — | LOW | 132 |
| `20260620130000_storefront_edge_sync_jobs` | — | MEDIUM | 1349 |
| `20260621100000_storefront_ga4_property_id` | — | LOW | 203 |
| `20260622100000_storefront_experiment_audit_stream` | — | LOW | 893 |
| `20260623100000_storefront_experiment_legal_hold` | — | LOW | 99 |
| `20260624100000_workspace_experiment_policy` | — | LOW | 82 |
| `20260625100000_storefront_phase6_invites` | — | LOW | 2314 |

## `prisma migrate status` (this host)

```
warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
For more information, see: https://pris.ly/prisma-config

Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres", schema "public" at "aws-1-us-west-2.pooler.supabase.com:5432"

84 migrations found in prisma/migrations

Database schema is up to date!
```
