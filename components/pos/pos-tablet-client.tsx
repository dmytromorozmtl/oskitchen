"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { TabletSmartphone } from "lucide-react";

import { PosTerminalClient } from "@/components/dashboard/pos-terminal-client";
import type {
  PosTerminalProduct,
  PosTerminalRecentCustomer,
  PosTerminalRegister,
  PosTerminalStaff,
} from "@/components/dashboard/pos-terminal-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { posTouchCompactClass } from "@/lib/pos/touch-targets";
import { POS_TABLET_POS_MIN_TOUCH_PX } from "@/lib/pos/pos-tablet-pos-policy";
import { IPAD_NATIVE_POS_POLISH_MIN_TOUCH_PX } from "@/lib/pos/ipad-native-pos-polish-policy";
import {
  getTabletOrientation,
  posIpadNativeShellClass,
  posTabletShellClass,
  subscribeTabletOrientation,
} from "@/lib/pos/pos-tablet-layout";
import type { PosConflictResolutionStrategy } from "@/lib/pos/pos-settings";
import { cn } from "@/lib/utils";

export function PosTabletClient(props: {
  registers: PosTerminalRegister[];
  staff: PosTerminalStaff[];
  products: PosTerminalProduct[];
  openShiftsByRegisterId: Record<string, { id: string } | null>;
  recentCustomers?: PosTerminalRecentCustomer[];
  customerAttachEnabled?: boolean;
  quickOrderEnabled?: boolean;
  businessType?: string | null;
  canApplyPosDiscount?: boolean;
  offlineQueueEnabled?: boolean;
  conflictResolution?: PosConflictResolutionStrategy;
}) {
  const orientation = useSyncExternalStore(
    subscribeTabletOrientation,
    getTabletOrientation,
    () => "landscape" as const,
  );

  return (
    <div
      className={cn(posTabletShellClass(orientation), posIpadNativeShellClass())}
      data-testid="pos-tablet-shell"
      data-ipad-native-polish="true"
      data-mobile-pos-kds="true"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <TabletSmartphone className="h-5 w-5 text-primary" aria-hidden />
          <h1 className="text-xl font-semibold tracking-tight">Tablet POS</h1>
          <Badge variant="secondary" className="rounded-full text-[10px] uppercase">
            {orientation}
          </Badge>
          <Badge variant="outline" className="rounded-full text-[10px] uppercase">
            {IPAD_NATIVE_POS_POLISH_MIN_TOUCH_PX}px · swipe · haptic
            {/* Touch floor alias: POS_TABLET_POS_MIN_TOUCH_PX={POS_TABLET_POS_MIN_TOUCH_PX} */}
          </Badge>
        </div>
        <Button asChild variant="ghost" size="sm" className={`rounded-full ${posTouchCompactClass}`}>
          <Link href="/dashboard/pos/terminal">Desktop terminal</Link>
        </Button>
      </div>

      <PosTerminalClient
        {...props}
        desktopMode={false}
        initialSpeedMode
        tabletMode
        layoutOrientation={orientation}
      />
    </div>
  );
}
