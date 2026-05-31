"use client";

import { QRCodeSVG } from "qrcode.react";

export function OrderQr({ url }: { url: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-inner">
      <QRCodeSVG value={url} size={180} bgColor="transparent" fgColor="#FF5F1F" />
    </div>
  );
}
