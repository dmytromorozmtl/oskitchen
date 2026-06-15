"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** Limited markdown body editor (bold, lists, links) — stored as markdown in `body`. */
export function RichTextBodyField({
  id,
  name,
  defaultValue,
  required,
  rows = 6,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  rows?: number;
}) {
  const [value, setValue] = React.useState(defaultValue ?? "");

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={id}>Body (markdown)</Label>
        <span className="text-[10px] text-muted-foreground">**bold** · *italic* · [link](https://…) · - list</span>
      </div>
      <input type="hidden" name="bodyFormat" value="markdown" />
      <Textarea
        id={id}
        name={name}
        required={required}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={rows}
        className="rounded-xl font-mono text-sm leading-relaxed"
        spellCheck
      />
    </div>
  );
}
