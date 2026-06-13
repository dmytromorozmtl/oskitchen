import { VisualKdsKitchenShell } from "@/components/dashboard/visual-kds-kitchen-shell";
import { VisualMobileTodayShell } from "@/components/dashboard/visual-mobile-today-shell";
import { VisualPosTabletShell } from "@/components/dashboard/visual-pos-tablet-shell";

/** Isolated POS tablet surface for Playwright visual QA. */
export default function VisualTestPosTabletPage() {
  return <VisualPosTabletShell />;
}
