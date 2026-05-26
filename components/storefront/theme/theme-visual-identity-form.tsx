"use client";

import type { MediaPickerAsset } from "@/components/storefront/media/media-picker-dialog";
import { MediaUrlField } from "@/components/storefront/media/media-url-field";
import { updateStorefrontThemeSettingsFormAction } from "@/actions/storefront-pillar-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ThemeVisualIdentityForm({
  assets,
  settings,
}: {
  assets: MediaPickerAsset[];
  settings: {
    logoUrl: string | null;
    faviconUrl: string | null;
    heroImageUrl: string | null;
    coverImageUrl: string | null;
    brandColor: string | null;
    secondaryColor: string | null;
    backgroundColor: string | null;
    textColor: string | null;
    fontFamily: string | null;
    themePreset: string | null;
    layoutPreset: string | null;
  };
}) {
  return (
    <form action={updateStorefrontThemeSettingsFormAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <MediaUrlField id="logoUrl" name="logoUrl" label="Logo URL" defaultValue={settings.logoUrl ?? ""} assets={assets} />
        <MediaUrlField
          id="faviconUrl"
          name="faviconUrl"
          label="Favicon URL"
          defaultValue={settings.faviconUrl ?? ""}
          assets={assets}
        />
        <MediaUrlField
          id="heroImageUrl"
          name="heroImageUrl"
          label="Hero image URL"
          defaultValue={settings.heroImageUrl ?? ""}
          assets={assets}
        />
        <MediaUrlField
          id="coverImageUrl"
          name="coverImageUrl"
          label="Cover / banner image URL"
          defaultValue={settings.coverImageUrl ?? ""}
          assets={assets}
        />
        <div className="space-y-2">
          <Label htmlFor="brandColor">Accent (hex)</Label>
          <Input
            id="brandColor"
            name="brandColor"
            defaultValue={settings.brandColor ?? "#286ab8"}
            className="rounded-xl font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="secondaryColor">Secondary (hex)</Label>
          <Input id="secondaryColor" name="secondaryColor" defaultValue={settings.secondaryColor ?? ""} className="rounded-xl font-mono text-sm" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="backgroundColor">Page background (hex)</Label>
          <Input id="backgroundColor" name="backgroundColor" defaultValue={settings.backgroundColor ?? ""} className="rounded-xl font-mono text-sm" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="textColor">Primary text (hex)</Label>
          <Input id="textColor" name="textColor" defaultValue={settings.textColor ?? ""} className="rounded-xl font-mono text-sm" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="fontFamily">Font stack hint</Label>
          <Input
            id="fontFamily"
            name="fontFamily"
            defaultValue={settings.fontFamily ?? ""}
            placeholder="e.g. Inter, system-ui, sans-serif"
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="themePreset">Theme preset key</Label>
          <Input id="themePreset" name="themePreset" defaultValue={settings.themePreset ?? ""} className="rounded-xl font-mono text-sm" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="layoutPreset">Layout preset key</Label>
          <Input id="layoutPreset" name="layoutPreset" defaultValue={settings.layoutPreset ?? ""} className="rounded-xl font-mono text-sm" />
        </div>
      </div>
      <Button type="submit" className="rounded-full">
        Save theme
      </Button>
    </form>
  );
}
