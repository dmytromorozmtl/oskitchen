import { PilotRouteLoading } from "@/components/dashboard/pilot-route-states";

/** LOADING_SKELETON_EXCEPTION — POS terminal uses spinner for instant operator feedback (DES-28). */
/** ROUTE_LOADING_EXCEPTION — operator terminal spinner, not dashboard LoadingState chrome (DES-36). */

export default function Loading() {
  return <PilotRouteLoading title="Loading POS terminal…" />;
}
