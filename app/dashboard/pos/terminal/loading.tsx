import { PilotRouteLoading } from "@/components/dashboard/pilot-route-states";

/** LOADING_SKELETON_EXCEPTION — POS terminal uses spinner for instant operator feedback (DES-28). */

export default function Loading() {
  return <PilotRouteLoading title="Loading POS terminal…" />;
}
