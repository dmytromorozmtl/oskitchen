import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

/** Critical routes — vendor cabinet uses Next.js route group `(cabinet)`. */
const CRITICAL_FILES: string[] = [
  "app/page.tsx",
  "app/layout.tsx",
  "app/pricing/page.tsx",
  "app/shopify/page.tsx",
  "app/login/page.tsx",
  "app/signup/page.tsx",
  "app/dashboard/today/page.tsx",
  "app/dashboard/marketplace/page.tsx",
  "app/dashboard/marketplace/wishlist/page.tsx",
  "app/dashboard/marketplace/catalog/page.tsx",
  "app/dashboard/marketplace/orders/page.tsx",
  "app/dashboard/marketplace/vendors/page.tsx",
  "app/dashboard/marketplace/analytics/page.tsx",
  "app/dashboard/marketplace/compare/page.tsx",
  "app/dashboard/analytics/digital-twin/page.tsx",
  "app/dashboard/analytics/food-cost/page.tsx",
  "app/dashboard/analytics/benchmarks/page.tsx",
  "app/dashboard/inventory/purchasing-ai/page.tsx",
  "app/dashboard/kitchen/cameras/page.tsx",
  "app/dashboard/menu/universal/page.tsx",
  "app/vendor/register/page.tsx",
  "app/vendor/(cabinet)/dashboard/page.tsx",
  "app/vendor/(cabinet)/products/page.tsx",
  "app/vendor/(cabinet)/orders/page.tsx",
  "app/vendor/(cabinet)/finance/page.tsx",
  "app/vendor/(cabinet)/analytics/page.tsx",
  "app/vendor/(cabinet)/settings/page.tsx",
  "app/platform/marketplace/vendors/page.tsx",
  "app/platform/marketplace/products/page.tsx",
  "app/platform/marketplace/disputes/page.tsx",
  "app/platform/marketplace/analytics/page.tsx",
  "services/ai/ai-restaurant-brain.ts",
  "services/ai/digital-twin.ts",
  "services/ai/real-time-twin.ts",
  "services/ai/food-cost-ai.ts",
  "services/ai/food-cost-alerts.ts",
  "services/ai/ai-purchasing.ts",
  "services/ai/purchasing-automation.ts",
  "services/ai/kitchen-camera.ts",
  "services/ai/benchmark-network.ts",
  "services/ai/briefing-delivery.ts",
  "services/ai/predictive-alerts.ts",
  "services/menu/universal-menu-engine.ts",
  "services/marketplace/cart-service.ts",
  "services/marketplace/checkout-service.ts",
  "services/marketplace/stripe-connect-service.ts",
  "services/marketplace/inventory-integration-service.ts",
  "services/marketplace/capital-integration-service.ts",
  "services/marketplace/briefing-integration-service.ts",
  "services/marketplace/billing-integration-service.ts",
  "services/marketplace/analytics-integration-service.ts",
  "services/marketplace/recommendations-service.ts",
  "services/marketplace/featured-service.ts",
  "services/marketplace/marketplace-dashboard-service.ts",
  "services/marketplace/marketplace-catalog-service.ts",
  "services/marketplace/recurring-orders-service.ts",
  "lib/permissions/permissions.ts",
  "prisma/schema.prisma",
];

describe("final verification critical files", () => {
  it("includes all marketplace, AI, vendor cabinet, and platform paths", () => {
    const missing = CRITICAL_FILES.filter((rel) => !existsSync(join(ROOT, rel)));
    expect(missing).toEqual([]);
  });
});
