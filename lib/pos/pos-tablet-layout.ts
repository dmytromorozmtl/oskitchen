import { cn } from "@/lib/utils";

export type TabletOrientation = "portrait" | "landscape";

export function getTabletOrientation(): TabletOrientation {
  if (typeof window === "undefined") return "landscape";
  return window.matchMedia("(orientation: portrait)").matches ? "portrait" : "landscape";
}

export function subscribeTabletOrientation(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const media = window.matchMedia("(orientation: portrait)");
  const handler = () => onStoreChange();
  media.addEventListener("change", handler);
  return () => media.removeEventListener("change", handler);
}

export function posTabletShellClass(orientation: TabletOrientation): string {
  return cn(
    "pos-tablet-shell touch-manipulation",
    orientation === "portrait" ? "pos-tablet-portrait" : "pos-tablet-landscape",
  );
}

export function posTabletMainLayoutClass(
  orientation: TabletOrientation,
  tabletMode: boolean,
): string {
  if (!tabletMode) return "flex-col gap-4 md:flex-row md:items-stretch";
  return orientation === "landscape"
    ? "flex-col gap-4 md:flex-row md:items-stretch"
    : "flex-col gap-4";
}

export function posTabletCartPanelClass(
  orientation: TabletOrientation,
  tabletMode: boolean,
): string {
  if (!tabletMode) {
    return cn(
      "shrink-0 border-border/80 shadow-md",
      "w-full max-md:max-w-full",
      "md:w-[28rem] md:max-w-md md:flex-none",
      "md:max-h-[calc(100vh-10rem)] md:overflow-y-auto",
    );
  }
  return cn(
    "shrink-0 border-border/80 shadow-md",
    "w-full max-md:max-w-full",
    orientation === "landscape"
      ? "md:w-[28rem] md:max-w-md md:flex-none md:max-h-[calc(100vh-10rem)] md:overflow-y-auto"
      : "sticky bottom-0 z-10 max-h-[48vh] overflow-y-auto",
  );
}

/** iPad-native polish — touch-manipulation, press scale, swipe-friendly shell. */
export function posIpadNativeShellClass(): string {
  return cn("pos-ipad-native touch-manipulation select-none");
}

/** Product tile press feedback on tablet counter. */
export function posIpadNativeProductTileClass(): string {
  return cn("active:scale-[0.98] motion-reduce:active:scale-100");
}
