"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ROUTES = [
  "/dashboard/today",
  "/dashboard/pos/terminal",
  "/dashboard/pos/tablet",
  "/dashboard/pos/mobile",
  "/dashboard/pos/handheld",
  "/dashboard/kitchen",
  "/dashboard/kitchen/production",
  "/dashboard/kitchen/expo",
  "/dashboard/marketplace",
  "/dashboard/marketplace/catalog",
  "/dashboard/marketplace/orders",
  "/dashboard/marketplace/wishlist",
  "/dashboard/marketplace/compare",
  "/dashboard/marketplace/vendors",
  "/dashboard/orders",
  "/dashboard/inventory",
  "/dashboard/inventory/invoice-scanner",
  "/dashboard/analytics/suite",
  "/dashboard/ai/co-pilot",
  "/dashboard/quick-start",
  "/vendor/dashboard",
  "/vendor/products",
  "/vendor/orders",
  "/vendor/finance",
  "/vendor/analytics",
];

export function NavigationPrefetch() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      for (const route of ROUTES) {
        router.prefetch(route);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return null;
}
