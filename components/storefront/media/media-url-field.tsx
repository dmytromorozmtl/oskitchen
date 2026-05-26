"use client";

import * as React from "react";

import type { MediaPickerAsset } from "@/components/storefront/media/media-picker-dialog";
import { MediaPickerDialog } from "@/components/storefront/media/media-picker-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MediaUrlField({
  id,
  name,
  label,
  defaultValue,
  assets,
  placeholder = "https://…",
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
  assets: MediaPickerAsset[];
  placeholder?: string;
}) {
  const [value, setValue] = React.useState(defaultValue ?? "");

  return (
    <div className="space-y-2 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {assets.length > 0 ? (
          <MediaPickerDialog assets={assets} triggerLabel="Pick from library" onSelect={setValue} />
        ) : null}
      </div>
      <Input
        id={id}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl font-mono text-sm"
      />
    </div>
  );
}
