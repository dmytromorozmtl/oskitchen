import { Suspense, type ReactNode } from "react";

import { KDSSkeleton } from "@/components/dashboard/kds-skeleton";
import { MarketplaceSkeleton } from "@/components/dashboard/marketplace-skeleton";
import { POSSkeleton } from "@/components/dashboard/pos-skeleton";
import { TodaySkeleton } from "@/components/dashboard/today-skeleton";
import type { SuspenseWave1Sector } from "@/lib/frontend/suspense-boundaries-p2-41-policy";

const SECTOR_SKELETONS = {
  today: TodaySkeleton,
  marketplace: MarketplaceSkeleton,
  pos: POSSkeleton,
  kitchen: KDSSkeleton,
} as const;

type SuspenseWave1PageBoundaryProps = {
  sector: SuspenseWave1Sector;
  children: ReactNode;
};

export function SuspenseWave1PageBoundary({ sector, children }: SuspenseWave1PageBoundaryProps) {
  const Skeleton = SECTOR_SKELETONS[sector];
  return (
    <Suspense fallback={<Skeleton />}>
      {children}
    </Suspense>
  );
}
