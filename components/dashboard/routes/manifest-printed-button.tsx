"use client";

import { useTransition } from "react";

import { recordManifestPrintedAction } from "@/actions/delivery-route";
import { Button } from "@/components/ui/button";

export function ManifestPrintedButton({ routeId, children }: { routeId: string; children?: React.ReactNode }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      onClick={() => {
        startTransition(async () => {
          await recordManifestPrintedAction(routeId);
          window.print();
        });
      }}
      disabled={pending}
    >
      {children ?? (pending ? "Recording…" : "Record & print")}
    </Button>
  );
}
