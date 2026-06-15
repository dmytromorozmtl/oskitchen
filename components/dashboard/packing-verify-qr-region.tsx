"use client";

import * as React from "react";

import { parseEmbeddedTokenFromQr } from "@/lib/packing-verification/verification-validation";

type Scanner = import("html5-qrcode").Html5QrcodeScanner;

export function PackingVerifyQrRegion({
  onDecoded,
  disabled,
}: {
  onDecoded: (raw: string) => void;
  disabled?: boolean;
}) {
  const elId = React.useRef(`pack-verify-qr-${Math.random().toString(36).slice(2, 10)}`);
  const cb = React.useRef(onDecoded);
  cb.current = onDecoded;

  React.useEffect(() => {
    if (disabled) return;
    let scanner: Scanner | null = null;
    let cancelled = false;
    void (async () => {
      try {
        const { Html5QrcodeScanner } = await import("html5-qrcode");
        if (cancelled) return;
        scanner = new Html5QrcodeScanner(
          elId.current,
          { fps: 8, qrbox: { width: 240, height: 240 }, rememberLastUsedCamera: true },
          false,
        );
        scanner.render(
          (decoded) => {
            cb.current(parseEmbeddedTokenFromQr(decoded));
            void scanner?.clear().catch(() => {});
          },
          () => {},
        );
      } catch {
        /* camera blocked or lib load failed */
      }
    })();
    return () => {
      cancelled = true;
      void scanner?.clear().catch(() => {});
    };
  }, [disabled]);

  return (
    <div className="rounded-xl border border-border/80 bg-muted/20 p-2">
      <div id={elId.current} className="min-h-[280px] w-full" />
      <p className="mt-2 px-2 text-center text-xs text-muted-foreground">
        Allow camera access when prompted. If the camera is unavailable, use the Manual tab.
      </p>
    </div>
  );
}
