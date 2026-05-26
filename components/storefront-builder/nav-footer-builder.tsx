"use client";

import * as React from "react";

import { FooterVisualEditor } from "@/components/storefront-builder/footer-visual-editor";
import { NavigationVisualEditor } from "@/components/storefront-builder/navigation-visual-editor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updateStorefrontFooterSettingsFormAction,
  updateStorefrontNavigationSettingsFormAction,
} from "@/actions/storefront-navigation";

export function NavFooterBuilder({
  itemsJson,
  blocksJson,
  customPages,
  secondaryLocales,
}: {
  itemsJson: string;
  blocksJson: string;
  customPages: { slug: string; title: string }[];
  secondaryLocales: string[];
}) {
  const [showJson, setShowJson] = React.useState(false);
  const initialNav = React.useMemo(() => {
    try {
      return JSON.parse(itemsJson) as unknown;
    } catch {
      return { items: [] };
    }
  }, [itemsJson]);
  const initialFooter = React.useMemo(() => {
    try {
      return JSON.parse(blocksJson) as unknown;
    } catch {
      return { blocks: [] };
    }
  }, [blocksJson]);

  if (showJson) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Advanced JSON</p>
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setShowJson(false)}>
            Back to visual editor
          </Button>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <form action={updateStorefrontNavigationSettingsFormAction} className="space-y-3 rounded-xl border p-4">
            <Label htmlFor="nav-json">Navigation JSON</Label>
            <Textarea id="nav-json" name="itemsJson" defaultValue={itemsJson} rows={12} className="font-mono text-xs" />
            <Button type="submit" className="rounded-full">
              Save navigation JSON
            </Button>
          </form>
          <form action={updateStorefrontFooterSettingsFormAction} className="space-y-3 rounded-xl border p-4">
            <Label htmlFor="footer-json">Footer JSON</Label>
            <Textarea id="footer-json" name="blocksJson" defaultValue={blocksJson} rows={12} className="font-mono text-xs" />
            <Button type="submit" className="rounded-full">
              Save footer JSON
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">Visual editor — no JSON required for day-to-day edits.</p>
        <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={() => setShowJson(true)}>
          Advanced JSON
        </Button>
      </div>
      <NavigationVisualEditor
        initialRaw={initialNav}
        customPages={customPages}
        secondaryLocales={secondaryLocales}
      />
      <FooterVisualEditor initialRaw={initialFooter} />
    </div>
  );
}
