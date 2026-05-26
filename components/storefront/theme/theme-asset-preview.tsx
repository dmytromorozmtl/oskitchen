"use client";

import * as React from "react";

import { isSafeHttpsUrl } from "@/lib/storefront/theme-validation";

function Row({ label, url }: { label: string; url: string | null | undefined }) {
  const v = (url ?? "").trim();
  const check = isSafeHttpsUrl(v);
  const [broken, setBroken] = React.useState(false);
  return (
    <div className="rounded-lg border border-border/70 p-3 text-sm">
      <p className="font-medium">{label}</p>
      {!v ? <p className="text-xs text-muted-foreground">Not set</p> : null}
      {v ? (
        <>
          <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">{v}</p>
          {check.ok && !broken ? (
            <div className="mt-2 overflow-hidden rounded-md border border-border/60 bg-muted/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v}
                alt=""
                className="max-h-24 w-auto object-contain"
                loading="lazy"
                onError={() => setBroken(true)}
              />
            </div>
          ) : (
            <p className="mt-2 text-xs text-destructive">{broken ? "Image failed to load." : check.reason}</p>
          )}
        </>
      ) : null}
    </div>
  );
}

export function ThemeAssetPreview({
  logoUrl,
  faviconUrl,
  heroImageUrl,
  coverImageUrl,
}: {
  logoUrl?: string | null;
  faviconUrl?: string | null;
  heroImageUrl?: string | null;
  coverImageUrl?: string | null;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Row label="Logo" url={logoUrl} />
      <Row label="Favicon" url={faviconUrl} />
      <Row label="Hero" url={heroImageUrl} />
      <Row label="Cover" url={coverImageUrl} />
    </div>
  );
}
