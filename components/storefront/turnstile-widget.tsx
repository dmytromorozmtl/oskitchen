"use client";

import * as React from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        opts: { sitekey: string; callback: (token: string) => void; "expired-callback"?: () => void },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export function TurnstileWidget({
  siteKey,
  onToken,
}: {
  siteKey: string;
  onToken: (token: string | null) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const widgetId = React.useRef<string | null>(null);

  const renderWidget = React.useCallback(() => {
    if (!ref.current || !window.turnstile) return;
    if (widgetId.current) {
      window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    }
    widgetId.current = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      callback: (token) => onToken(token),
      "expired-callback": () => onToken(null),
    });
  }, [siteKey, onToken]);

  React.useEffect(() => {
    if (window.turnstile) renderWidget();
    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
      }
    };
  }, [renderWidget]);

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={renderWidget} />
      <div ref={ref} className="min-h-[65px]" />
    </>
  );
}
