"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type StorefrontPwaInstallProps = {
  storeSlug: string;
  restaurantName: string;
  themeColor: string;
  logoUrl: string | null;
  menuUrl: string;
};

export function StorefrontPwaInstall({
  storeSlug,
  restaurantName,
  themeColor,
  logoUrl,
  menuUrl,
}: StorefrontPwaInstallProps) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const manifestLink = document.querySelector<HTMLLinkElement>(
      'link[rel="manifest"][data-kos-storefront-pwa]',
    );
    if (!manifestLink) {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = `/s/${storeSlug}/manifest.webmanifest`;
      link.setAttribute("data-kos-storefront-pwa", storeSlug);
      document.head.appendChild(link);
    }

    const themeMeta =
      document.querySelector<HTMLMetaElement>('meta[name="theme-color"][data-kos-pwa]') ??
      document.createElement("meta");
    themeMeta.name = "theme-color";
    themeMeta.content = themeColor;
    themeMeta.setAttribute("data-kos-pwa", storeSlug);
    if (!themeMeta.parentElement) document.head.appendChild(themeMeta);

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker
        .register(`/s/${storeSlug}/sw.js`, { scope: `/s/${storeSlug}/` })
        .catch(() => undefined);
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, [storeSlug, themeColor]);

  async function onInstall() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setDeferred(null);
  }

  return (
    <Card>
      <CardHeader className="items-center text-center">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="mx-auto mb-2 h-16 w-16 rounded-2xl object-cover" />
        ) : (
          <div
            className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white"
            style={{ backgroundColor: themeColor }}
          >
            {restaurantName.slice(0, 1)}
          </div>
        )}
        <CardTitle className="text-lg">Install {restaurantName}</CardTitle>
        <CardDescription>
          {installed
            ? "App installed — open it from your home screen."
            : "Works on iPhone and Android. No App Store download."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {deferred ? (
          <Button
            type="button"
            className="w-full rounded-full"
            style={{ backgroundColor: themeColor }}
            onClick={() => void onInstall()}
          >
            Install app
          </Button>
        ) : (
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              <span className="text-foreground">iPhone:</span> Safari → Share → Add to Home Screen
            </li>
            <li>
              <span className="text-foreground">Android:</span> Chrome menu → Install app or Add
              to Home screen
            </li>
          </ol>
        )}
        <Button type="button" variant="outline" className="w-full rounded-full" asChild>
          <a href={menuUrl}>Browse menu without installing</a>
        </Button>
      </CardContent>
    </Card>
  );
}
