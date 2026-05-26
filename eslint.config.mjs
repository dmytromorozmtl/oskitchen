import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import requireOwnerScope from "./eslint/rules/require-owner-scope.js";
import requireActionResult from "./eslint/rules/require-action-result.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const permissionsLegacyPathRule = {
  name: "@/lib/permissions",
  message: "Use @/lib/permissions/legacy (POS) or @/lib/permissions/index (workspace matrix).",
};

/** Cron routes may import `_experiments/*`; all other app code may not. */
const experimentsImportPattern = {
  group: ["@/services/storefront/_experiments/*"],
  message: "Experiment sync services are cron-only. Do not import from production paths.",
};

/** Cron handlers must stay server-only — no React UI imports. */
const cronForbiddenUiPatterns = [
  {
    group: ["@/components/*", "@/components/**"],
    message: "Cron routes must not import dashboard or storefront UI components.",
  },
  {
    group: ["@/app/**"],
    message: "Cron routes must not import App Router pages or layouts.",
  },
];

const eslintConfig = [
  { ignores: ["scripts/**", "services/storefront/_experiments/**", "archive/cron-routes/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [permissionsLegacyPathRule],
          patterns: [experimentsImportPattern],
        },
      ],
    },
  },
  {
    files: ["app/api/cron/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [permissionsLegacyPathRule],
          patterns: cronForbiddenUiPatterns,
        },
      ],
    },
  },
  {
    plugins: {
      kitchenos: {
        rules: {
          "require-owner-scope": requireOwnerScope,
          "require-action-result": requireActionResult,
        },
      },
    },
    files: ["services/**/*.ts", "actions/**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Identifier[name='dataUserId']",
          message:
            "Use TenantActor.userId + workspaceId in services — not dataUserId (dashboard loader alias).",
        },
      ],
      "kitchenos/require-owner-scope": "warn",
      "kitchenos/require-action-result": "warn",
    },
  },
  {
    files: ["lib/auth/**/*.ts", "lib/supabase/**/*.ts", "lib/scope/**/*.ts"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
];

export default eslintConfig;
