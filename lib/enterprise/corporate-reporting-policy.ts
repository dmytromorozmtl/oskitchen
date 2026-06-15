/**
 * ENT-65 — Corporate Reporting (CEO P&L, trends, forecasts).
 *
 * @see services/enterprise/corporate-reporting-service.ts
 * @see lib/enterprise/corporate-reporting-builders.ts
 */

export const CORPORATE_REPORTING_POLICY_ID = "corporate-reporting-ent65-v1" as const;

export const CORPORATE_REPORTING_PATH = "/dashboard/enterprise/reports" as const;

/** Default food cost % of net revenue when costing run is unavailable. */
export const CORPORATE_DEFAULT_FOOD_COST_PCT = 32 as const;

/** Default other operating expense % of net revenue (packaging, utilities proxy). */
export const CORPORATE_DEFAULT_OPEX_PCT = 8 as const;

/** Default labor % when labor manager has no clock data. */
export const CORPORATE_DEFAULT_LABOR_PCT = 28 as const;

export const CORPORATE_FORECAST_PREVIEW_DAYS = 7 as const;
