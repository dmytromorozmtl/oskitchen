"use client";

import * as React from "react";

export function StorefrontFormBuilder({ initialJson }: { initialJson: string }) {
  const [json, setJson] = React.useState(initialJson);
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor="fieldsJson">
        Fields JSON
      </label>
      <textarea
        id="fieldsJson"
        name="fieldsJson"
        value={json}
        onChange={(e) => setJson(e.target.value)}
        rows={18}
        className="w-full rounded-xl border border-input bg-background p-3 font-mono text-xs leading-relaxed"
        spellCheck={false}
      />
      <p className="text-xs text-muted-foreground">
        Each field: <span className="font-mono">id</span>, <span className="font-mono">type</span>, <span className="font-mono">label</span>, optional{" "}
        <span className="font-mono">required</span>, <span className="font-mono">options</span> (for select).
      </p>
    </div>
  );
}
