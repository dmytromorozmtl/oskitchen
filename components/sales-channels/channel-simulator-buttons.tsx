"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { runChannelIngestSimulation } from "@/actions/channel-command-center";
import { Button } from "@/components/ui/button";

const SCENARIOS = [
  { id: "unmatched_product", label: "Unmatched product" },
  { id: "duplicate_order", label: "Duplicate order" },
  { id: "missing_fulfillment", label: "Missing fulfillment hint" },
] as const;

export function ChannelSimulatorButtons() {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {SCENARIOS.map((s) => (
        <Button
          key={s.id}
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await runChannelIngestSimulation({ scenario: s.id });
              router.refresh();
            })
          }
        >
          {s.label}
        </Button>
      ))}
    </div>
  );
}
