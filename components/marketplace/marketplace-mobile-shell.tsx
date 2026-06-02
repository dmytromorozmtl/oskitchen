"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

import { MarketplaceMobileCartDrawer } from "@/components/marketplace/marketplace-mobile-cart-drawer";
import { MARKETPLACE_MOBILE_CARD_CLASS } from "@/lib/marketplace/mobile-ui";
import {
  isMarketplaceOfflineMode,
  loadOfflineCatalogProducts,
} from "@/lib/marketplace/mobile-ui";
import type { MarketplaceCartClientView } from "@/services/marketplace/cart-service";

export function MarketplaceMobileShell({
  cart,
  canCartWrite,
  children,
}: {
  cart: MarketplaceCartClientView | null;
  canCartWrite: boolean;
  children: React.ReactNode;
}) {
  const [offline, setOffline] = useState(false);
  const [cachedCount, setCachedCount] = useState(0);

  useEffect(() => {
    const sync = () => {
      setOffline(isMarketplaceOfflineMode());
      setCachedCount(loadOfflineCatalogProducts().length);
    };
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return (
    <>
      {offline && cachedCount > 0 ? (
        <div className={`${MARKETPLACE_MOBILE_CARD_CLASS} flex items-start gap-3 border-amber-500/30 bg-amber-500/5`}>
          <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="text-sm">
            <p className="font-medium">Offline catalog available</p>
            <p className="text-muted-foreground">
              {cachedCount} products cached locally.{" "}
              <Link href="/dashboard/marketplace/catalog" className="underline">
                Browse catalog
              </Link>
            </p>
          </div>
        </div>
      ) : null}
      {children}
      <MarketplaceMobileCartDrawer initialCart={cart} canEdit={canCartWrite} />
    </>
  );
}
