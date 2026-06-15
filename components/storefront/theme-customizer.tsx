"use client";

import * as React from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ThemeCustomizerState } from "@/lib/storefront/theme-draft";
import { THEME_PREVIEW_MESSAGE } from "@/lib/storefront/theme-preview-message";
import {
  THEME_PRESET_LIST,
  activeThemePresetId,
  type StorefrontThemePresetId,
} from "@/lib/storefront/theme-presets";
import { STOREFRONT_FONT_OPTIONS } from "@/services/storefront/font-service";

type DevicePreview = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTHS: Record<DevicePreview, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

type ThemeVersionRow = { id: string; createdAt: string };

export function ThemeCustomizer({
  storefrontId,
  storeSlug,
  initial,
}: {
  storefrontId: string;
  storeSlug: string;
  initial: ThemeCustomizerState;
}) {
  const [theme, setTheme] = React.useState<ThemeCustomizerState>(initial);
  const [device, setDevice] = React.useState<DevicePreview>("desktop");
  const [autosaveStatus, setAutosaveStatus] = React.useState<"idle" | "pending" | "saved" | "error">("idle");
  const [versions, setVersions] = React.useState<ThemeVersionRow[]>([]);
  const [restoringId, setRestoringId] = React.useState<string | null>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const iframeReadyRef = React.useRef(false);
  const activePreset = activeThemePresetId(theme);

  const previewSrc = `/s/${storeSlug}?preview=1`;

  const postThemeToPreview = React.useCallback((t: ThemeCustomizerState) => {
    const win = iframeRef.current?.contentWindow;
    if (!win || !iframeReadyRef.current) return;
    win.postMessage({ type: THEME_PREVIEW_MESSAGE, theme: t }, window.location.origin);
  }, []);

  React.useEffect(() => {
    postThemeToPreview(theme);
  }, [theme, postThemeToPreview]);

  React.useEffect(() => {
    void fetch(`/api/storefront/theme/versions?storefrontId=${storefrontId}`)
      .then((r) => r.json())
      .then((data: { versions?: ThemeVersionRow[] }) => {
        if (Array.isArray(data.versions)) setVersions(data.versions);
      })
      .catch(() => setVersions([]));
  }, [storefrontId]);

  React.useEffect(() => {
    setAutosaveStatus("pending");
    const timer = window.setTimeout(() => {
      void fetch("/api/storefront/theme/save-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storefrontId, theme }),
      })
        .then((res) => {
          if (!res.ok) {
            setAutosaveStatus("error");
            return;
          }
          setAutosaveStatus("saved");
        })
        .catch(() => setAutosaveStatus("error"));
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [theme, storefrontId]);

  function applyPreset(id: StorefrontThemePresetId) {
    const preset = THEME_PRESET_LIST.find((p) => p.id === id);
    if (!preset) return;
    setTheme({ ...theme, ...preset.theme });
  }

  async function restoreVersion(versionId: string) {
    setRestoringId(versionId);
    try {
      const res = await fetch("/api/storefront/theme/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storefrontId, versionId }),
      });
      const data = (await res.json()) as { error?: string; theme?: ThemeCustomizerState };
      if (!res.ok || !data.theme) {
        toast.error(data.error ?? "Could not restore version");
        return;
      }
      setTheme(data.theme);
      postThemeToPreview(data.theme);
      toast.success("Theme restored from version — publish when ready for guests");
    } finally {
      setRestoringId(null);
    }
  }

  const autosaveLabel =
    autosaveStatus === "pending"
      ? "Saving draft…"
      : autosaveStatus === "saved"
        ? "Draft saved"
        : autosaveStatus === "error"
          ? "Autosave failed"
          : null;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 min-h-[640px] rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Live preview</p>
            {autosaveLabel ? (
              <p className="text-[10px] text-muted-foreground">{autosaveLabel}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-muted/50 p-0.5">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                device === "desktop" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={device === "desktop"}
            >
              <Monitor className="h-3.5 w-3.5" />
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setDevice("tablet")}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                device === "tablet" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={device === "tablet"}
            >
              <Tablet className="h-3.5 w-3.5" />
              Tablet
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                device === "mobile" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={device === "mobile"}
            >
              <Smartphone className="h-3.5 w-3.5" />
              Mobile
            </button>
          </div>
        </div>
        <div className="flex justify-center overflow-x-auto rounded-lg bg-muted/30 p-4">
          <iframe
            ref={iframeRef}
            title="Storefront theme preview"
            src={previewSrc}
            onLoad={() => {
              iframeReadyRef.current = true;
              postThemeToPreview(theme);
            }}
            style={{ width: DEVICE_WIDTHS[device], maxWidth: "100%", transition: "width 0.3s ease" }}
            className="h-[560px] rounded-lg border border-border/60 bg-background shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Theme presets</p>
          <div className="grid grid-cols-2 gap-2">
            {THEME_PRESET_LIST.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`rounded-xl border p-3 text-left transition hover:border-primary ${
                  activePreset === preset.id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/80"
                }`}
              >
                <div
                  className="mb-2 h-8 w-full rounded-md border border-border/50"
                  style={{ background: preset.swatch }}
                  aria-hidden
                />
                <p className="text-sm font-medium">{preset.name}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{preset.description}</p>
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm font-semibold">Customize appearance</p>

        <div>
          <Label className="text-xs font-medium">Accent color</Label>
          <input
            type="color"
            value={theme.accentColor}
            onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
            className="mt-1 h-10 w-full cursor-pointer rounded-xl border border-input"
          />
        </div>

        <div>
          <Label className="text-xs font-medium">Secondary color</Label>
          <input
            type="color"
            value={theme.secondaryColor}
            onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
            className="mt-1 h-10 w-full cursor-pointer rounded-xl border border-input"
          />
        </div>

        <div>
          <Label className="text-xs font-medium">Font</Label>
          <select
            value={theme.fontFamily}
            onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
            className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
          >
            {STOREFRONT_FONT_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-xs font-medium">Button style</Label>
          <select
            value={theme.buttonStyle}
            onChange={(e) =>
              setTheme({
                ...theme,
                buttonStyle: e.target.value as ThemeCustomizerState["buttonStyle"],
              })
            }
            className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="rounded-full">Pill</option>
            <option value="rounded-lg">Rounded</option>
            <option value="rounded-none">Square</option>
          </select>
        </div>

        <div>
          <Label className="text-xs font-medium">Hero layout</Label>
          <select
            value={theme.heroLayout}
            onChange={(e) =>
              setTheme({
                ...theme,
                heroLayout: e.target.value as ThemeCustomizerState["heroLayout"],
              })
            }
            className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="centered">Centered</option>
            <option value="split">Split (text + image)</option>
            <option value="image-first">Image first</option>
          </select>
        </div>

        <div>
          <Label className="text-xs font-medium">Card style</Label>
          <select
            value={theme.cardStyle}
            onChange={(e) =>
              setTheme({ ...theme, cardStyle: e.target.value as ThemeCustomizerState["cardStyle"] })
            }
            className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="shadow-sm">Subtle shadow</option>
            <option value="shadow-md">Elevated</option>
            <option value="bordered">Border only</option>
          </select>
        </div>

        {versions.length > 0 ? (
          <div className="mt-2 border-t border-border/80 pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Version history</p>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between gap-2 py-1 text-xs">
                  <span className="text-muted-foreground">{new Date(v.createdAt).toLocaleString()}</span>
                  <button
                    type="button"
                    disabled={restoringId === v.id}
                    onClick={() => void restoreVersion(v.id)}
                    className="shrink-0 font-medium text-primary hover:underline disabled:opacity-50"
                  >
                    {restoringId === v.id ? "Restoring…" : "Restore"}
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Snapshots from each Publish. Restore loads the draft — publish again for guests.
            </p>
          </div>
        ) : null}

        <p className="text-xs text-muted-foreground">
          Changes autosave every 2s. Guests see the last published theme — use Publish on this tab when ready.
        </p>
      </div>
    </div>
  );
}
