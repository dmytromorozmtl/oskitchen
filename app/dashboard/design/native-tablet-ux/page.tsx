import type { Metadata } from "next";

import { NativeTabletUxTouchbistroPanel } from "@/components/design/native-tablet-ux-touchbistro-panel";
import {
  NATIVE_TABLET_UX_P3_145_HEADLINE,
  NATIVE_TABLET_UX_P3_145_POLICY_ID,
  NATIVE_TABLET_UX_P3_145_ROUTE,
} from "@/lib/design/native-tablet-ux-p3-145-policy";

export const metadata: Metadata = {
  title: "Native tablet UX — TouchBistro parity",
  description:
    "TouchBistro parity baseline at /dashboard/design/native-tablet-ux — iPad layouts, bar mode, and table/tabs polish with 44px touch targets.",
};

export default function NativeTabletUxDesignPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <NativeTabletUxTouchbistroPanel />
      <p className="sr-only">
        Policy {NATIVE_TABLET_UX_P3_145_POLICY_ID} · {NATIVE_TABLET_UX_P3_145_HEADLINE} ·{" "}
        {NATIVE_TABLET_UX_P3_145_ROUTE}
      </p>
    </div>
  );
}
