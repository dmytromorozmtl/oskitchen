"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";

import { publishBrandedPwaAction } from "@/actions/branding-pwa";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  PWA_COLOR_PRESETS,
  type WhiteLabelPwaConfig,
} from "@/services/branding/white-label-service";

export type PwaBrandingStudioProps = {
  initialConfig: WhiteLabelPwaConfig | null;
  allowHideBranding: boolean;
  hideKitchenOsBranding: boolean;
};

export function PwaBrandingStudio({
  initialConfig,
  allowHideBranding,
  hideKitchenOsBranding,
}: PwaBrandingStudioProps) {
  const [logoUrl, setLogoUrl] = useState(initialConfig?.logoUrl ?? "");
  const [themeColor, setThemeColor] = useState(
    initialConfig?.themeColor ?? PWA_COLOR_PRESETS[0].hex,
  );
  const [hideBrand, setHideBrand] = useState(hideKitchenOsBranding);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const previewName = initialConfig?.restaurantName ?? "Your Restaurant";
  const installUrl = initialConfig?.installUrl ?? "/branding";

  const phoneStyle = useMemo(
    () =>
      ({
        "--pwa-accent": themeColor,
      }) as React.CSSProperties,
    [themeColor],
  );

  function onPublish() {
    setMessage(null);
    setError(null);
    const fd = new FormData();
    fd.set("logoUrl", logoUrl);
    fd.set("themeColor", themeColor);
    if (hideBrand && allowHideBranding) fd.set("hideKitchenOsBranding", "on");

    startTransition(async () => {
      const res = await publishBrandedPwaAction(fd);
      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }
      if ("data" in res && res.data?.message) {
        setMessage(res.data.message);
      }
    });
  }

  if (!initialConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Branded mobile app (PWA)</CardTitle>
          <CardDescription>
            Publish a storefront first, then return here to generate your installable app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="rounded-full">
            <Link href="/dashboard/storefront">Open storefront settings</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <Card>
        <CardHeader>
          <CardTitle>Branded mobile app (PWA)</CardTitle>
          <CardDescription>
            Customers install your restaurant on their home screen — logo, colors, and menu in
            under 5 minutes. AI-assisted setup; you review before publish.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              name="logoUrl"
              placeholder="https://cdn.example.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Square PNG or SVG works best. Asset library upload coming next — URL is supported
              today.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Primary color</Label>
            <div className="flex flex-wrap gap-2">
              {PWA_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={cn(
                    "h-9 w-9 rounded-full border-2 transition",
                    themeColor.toUpperCase() === preset.hex
                      ? "border-foreground scale-110"
                      : "border-transparent",
                  )}
                  style={{ backgroundColor: preset.hex }}
                  aria-label={preset.label}
                  onClick={() => setThemeColor(preset.hex)}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="themeColor" className="sr-only">
                Custom hex
              </Label>
              <Input
                id="themeColor"
                name="themeColor"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                placeholder="#FF5F1F"
                className="max-w-[140px] font-mono"
              />
            </div>
          </div>

          {allowHideBranding ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={hideBrand}
                onChange={(e) => setHideBrand(e.target.checked)}
              />
              Hide &quot;OS Kitchen&quot; in app description (Enterprise)
            </label>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="rounded-full"
              disabled={pending}
              onClick={onPublish}
            >
              {pending ? "Publishing…" : "Publish branded PWA"}
            </Button>
            <Button type="button" variant="outline" className="rounded-full" asChild>
              <Link href={installUrl} target="_blank" rel="noreferrer">
                Open install page
              </Link>
            </Button>
          </div>

          {message ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {initialConfig.publishedAt ? (
            <p className="text-xs text-muted-foreground">
              Last published {new Date(initialConfig.publishedAt).toLocaleString()}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex justify-center lg:justify-end">
        <div
          className="relative h-[520px] w-[260px] rounded-[2rem] border-[10px] border-zinc-800 bg-zinc-950 shadow-2xl"
          style={phoneStyle}
        >
          <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-zinc-800" />
          <div className="flex h-full flex-col overflow-hidden rounded-[1.4rem] bg-background pt-8">
            <div
              className="px-4 py-3 text-center text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--pwa-accent)" }}
            >
              {previewName}
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt=""
                  className="h-16 w-16 rounded-2xl object-cover"
                />
              ) : (
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-bold text-white"
                  style={{ backgroundColor: "var(--pwa-accent)" }}
                >
                  {previewName.slice(0, 1)}
                </div>
              )}
              <p className="text-sm font-medium">{previewName}</p>
              <p className="text-xs text-muted-foreground">Add to Home Screen</p>
              <div
                className="mt-2 rounded-full px-4 py-2 text-xs font-medium text-white"
                style={{ backgroundColor: "var(--pwa-accent)" }}
              >
                Order now
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
