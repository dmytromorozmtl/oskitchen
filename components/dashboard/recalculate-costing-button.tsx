"use client";

import * as React from "react";

import { recalculateCostSnapshotsAction } from "@/actions/costing";
import { Button } from "@/components/ui/button";

export function RecalculateCostingButton() {
  const [msg, setMsg] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  return (
    <div>
      <Button
        type="button"
        disabled={pending}
        variant="secondary"
        className="rounded-full"
        onClick={async () => {
          setPending(true);
          setMsg(null);
          const r = await recalculateCostSnapshotsAction();
          setPending(false);
          if ("error" in r && r.error) setMsg(r.error);
          else if ("ok" in r && r.ok)
            setMsg(`Recorded ${r.created} new cost snapshot(s). Margins below use the latest rows.`);
        }}
      >
        {pending ? "Working…" : "Recalculate costs"}
      </Button>
      {msg ? <p className="mt-2 max-w-md text-sm text-muted-foreground">{msg}</p> : null}
    </div>
  );
}
