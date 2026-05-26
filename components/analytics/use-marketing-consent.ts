"use client";

import { useEffect, useState } from "react";

import {
  hasMarketingConsentCookie,
  MARKETING_CONSENT_EVENT,
} from "@/lib/analytics/marketing-consent";

export function useMarketingConsentGranted(): boolean {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    setGranted(hasMarketingConsentCookie());

    const handleChange = (event: Event) => {
      const detail = (event as CustomEvent<{ granted?: boolean }>).detail;
      if (typeof detail?.granted === "boolean") {
        setGranted(detail.granted);
        return;
      }
      setGranted(hasMarketingConsentCookie());
    };

    window.addEventListener(MARKETING_CONSENT_EVENT, handleChange as EventListener);
    return () => {
      window.removeEventListener(MARKETING_CONSENT_EVENT, handleChange as EventListener);
    };
  }, []);

  return granted;
}
