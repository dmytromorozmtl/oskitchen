"use client";

import { useEffect } from "react";

export function VendorCabinetPwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw-marketplace-vendor.js").catch(() => undefined);
  }, []);

  return null;
}
