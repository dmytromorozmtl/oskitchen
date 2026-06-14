/**
 * Today Command Center — single entry surface for loaders + navigation helpers.
 * Heavy queries stay split across `today-command-center-service` and `today-query-service`.
 */
export { todayActionHref, type TodayActionId } from "./today-actions-service";
export {
  loadTodayCommandCenter,
  type TodayBlocker,
  type TodayCommandCenterPayload,
} from "./today-command-center-service";
export { loadTodayOperationalCounts, todayDateWindows } from "./today-query-service";
