/**
 * P2-43 — Layout-level error.tsx catch-all for 251 public pages.
 *
 * @see docs/public-pages-error-tsx-p2-43.md
 */

import { existsSync } from "node:fs";
import { join } from "node:path";

export const PUBLIC_PAGES_ERROR_TSX_P2_43_POLICY_ID = "public-pages-error-tsx-p2-43-v1" as const;

export const PUBLIC_PAGES_ERROR_TSX_P2_43_DOC = "docs/public-pages-error-tsx-p2-43.md" as const;

export const PUBLIC_PAGES_ERROR_TSX_P2_43_ARTIFACT =
  "artifacts/public-pages-error-tsx-p2-43.json" as const;

export const PUBLIC_PAGES_ERROR_TSX_P2_43_CHECK_NPM_SCRIPT =
  "check:public-pages-error-tsx-p2-43" as const;

export const PUBLIC_PAGES_ERROR_TSX_P2_43_CI_NPM_SCRIPT =
  "test:ci:public-pages-error-tsx-p2-43" as const;

export const PUBLIC_PAGES_ERROR_TSX_P2_43_UNIT_TEST =
  "tests/unit/public-pages-error-tsx-p2-43.test.ts" as const;

export const PUBLIC_PAGES_ERROR_TSX_P2_43_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const PUBLIC_PAGES_ERROR_TSX_P2_43_COMPONENT =
  "components/marketing/public-layout-error.tsx" as const;

export const PUBLIC_PAGES_ERROR_TSX_P2_43_TEMPLATE_MARKER = "PublicLayoutError" as const;

export const PUBLIC_PAGES_ERROR_TSX_P2_43_SCAFFOLD_SCRIPT =
  "scripts/scaffold-public-pages-error-tsx-p2-43.ts" as const;

/** Public marketing / platform / storefront pages (excludes app/dashboard). */
export const PUBLIC_PAGES_ERROR_TSX_P2_43_PAGE_COUNT = 251 as const;

export type PublicLayoutErrorSegment = {
  id: string;
  errorPath: string;
  homeHref: string;
  homeLabel: string;
};

/** Layout-level catch-all error boundaries covering 251 public pages (P2-43). */
export const PUBLIC_LAYOUT_ERROR_SEGMENTS: readonly PublicLayoutErrorSegment[] = [
  {
    id: "root",
    errorPath: "app/error.tsx",
    homeHref: "/",
    homeLabel: "Home",
  },
  {
    id: "platform",
    errorPath: "app/platform/error.tsx",
    homeHref: "/platform/dashboard",
    homeLabel: "Platform home",
  },
  {
    id: "vendor",
    errorPath: "app/vendor/error.tsx",
    homeHref: "/vendor/dashboard",
    homeLabel: "Vendor dashboard",
  },
  {
    id: "storefront",
    errorPath: "app/s/[storeSlug]/error.tsx",
    homeHref: "/",
    homeLabel: "OS Kitchen home",
  },
  {
    id: "help",
    errorPath: "app/help/error.tsx",
    homeHref: "/help",
    homeLabel: "Help center",
  },
  {
    id: "legal",
    errorPath: "app/legal/error.tsx",
    homeHref: "/legal",
    homeLabel: "Legal hub",
  },
  {
    id: "pricing",
    errorPath: "app/pricing/error.tsx",
    homeHref: "/pricing",
    homeLabel: "Pricing",
  },
  {
    id: "integrations",
    errorPath: "app/integrations/error.tsx",
    homeHref: "/integrations",
    homeLabel: "Integrations",
  },
  {
    id: "onboarding",
    errorPath: "app/onboarding/error.tsx",
    homeHref: "/onboarding",
    homeLabel: "Onboarding",
  },
  {
    id: "q",
    errorPath: "app/q/error.tsx",
    homeHref: "/",
    homeLabel: "Home",
  },
] as const;

export const PUBLIC_PAGES_ERROR_TSX_P2_43_WIRING_PATHS = [
  PUBLIC_PAGES_ERROR_TSX_P2_43_DOC,
  PUBLIC_PAGES_ERROR_TSX_P2_43_ARTIFACT,
  PUBLIC_PAGES_ERROR_TSX_P2_43_UNIT_TEST,
  PUBLIC_PAGES_ERROR_TSX_P2_43_COMPONENT,
  PUBLIC_PAGES_ERROR_TSX_P2_43_SCAFFOLD_SCRIPT,
  PUBLIC_PAGES_ERROR_TSX_P2_43_CI_WORKFLOW,
  "components/dashboard/error-boundary-template.tsx",
] as const;

export const PUBLIC_PAGES_DASHBOARD_PREFIX = "app/dashboard/" as const;

export function isPublicPagePath(pagePath: string): boolean {
  return pagePath.startsWith("app/") && !pagePath.startsWith(PUBLIC_PAGES_DASHBOARD_PREFIX);
}

export function publicLayoutErrorUsesTemplate(source: string): boolean {
  return (
    source.includes(PUBLIC_PAGES_ERROR_TSX_P2_43_TEMPLATE_MARKER) &&
    source.includes("reset")
  );
}

export function publicPageHasErrorAncestor(pagePath: string, root = process.cwd()): boolean {
  const normalized = pagePath.replace(/\/page\.tsx?$/, "");
  const parts = normalized.split("/");
  for (let i = parts.length; i >= 1; i -= 1) {
    const candidate = `${parts.slice(0, i).join("/")}/error.tsx`;
    if (existsSync(join(root, candidate))) return true;
  }
  return false;
}
