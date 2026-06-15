/**
 * Business-mode navigation helpers — terminology + filtering live in existing modules.
 * Central import surface for product excellence docs and future refactors.
 */
export {
  dashboardModeSummaryLines,
  getFilteredNavGroups,
  isRecommendedModuleHref,
  RECOMMENDED_MODULE_HREFS,
  resolveBusinessType,
} from "@/lib/business-modes";
export { checklistMenuLabel, navLabelForBusinessType } from "@/lib/terminology";
