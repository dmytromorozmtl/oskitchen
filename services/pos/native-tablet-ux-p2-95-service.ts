import {
  buildNativeTabletUxReport,
  type NativeTabletUxReport,
} from "@/lib/pos/native-tablet-ux-p2-95-operations";
import { NATIVE_TABLET_UX_P2_95_POLICY_ID } from "@/lib/pos/native-tablet-ux-p2-95-policy";
import type { TabletOrientation } from "@/lib/pos/pos-tablet-layout";
import { getOpenTabs } from "@/services/pos/tab-service";

export type NativeTabletUxSnapshot = NativeTabletUxReport & {
  policyId: typeof NATIVE_TABLET_UX_P2_95_POLICY_ID;
  defaultOrientation: TabletOrientation;
};

export async function loadNativeTabletUxSnapshot(
  userId: string,
  orientation: TabletOrientation = "landscape",
): Promise<NativeTabletUxSnapshot> {
  const openTabs = await getOpenTabs(userId);
  const report = buildNativeTabletUxReport({
    orientation,
    openTabCount: openTabs.length,
  });

  return {
    policyId: NATIVE_TABLET_UX_P2_95_POLICY_ID,
    defaultOrientation: orientation,
    ...report,
  };
}
