"use client";

import * as React from "react";

import { BRAND_CONTEXT_CHANGED_EVENT, BRAND_CONTEXT_STORAGE_KEY } from "@/lib/brands/brand-types";

/** `__all__` = no brand filter; otherwise a brand UUID. */
export type BrandContextSelection = "__all__" | (string & {});

const BrandContext = React.createContext<BrandContextSelection>("__all__");

export function BrandContextProvider({ children }: { children: React.ReactNode }) {
  const [selection, setSelection] = React.useState<BrandContextSelection>("__all__");

  React.useEffect(() => {
    const read = () => {
      try {
        const raw = window.localStorage.getItem(BRAND_CONTEXT_STORAGE_KEY);
        if (!raw || raw === "__all__") setSelection("__all__");
        else setSelection(raw);
      } catch {
        setSelection("__all__");
      }
    };
    read();
    window.addEventListener(BRAND_CONTEXT_CHANGED_EVENT, read);
    return () => window.removeEventListener(BRAND_CONTEXT_CHANGED_EVENT, read);
  }, []);

  return <BrandContext.Provider value={selection}>{children}</BrandContext.Provider>;
}

export function useBrandContext(): BrandContextSelection {
  return React.useContext(BrandContext);
}
