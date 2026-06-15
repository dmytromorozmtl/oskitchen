import React from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import type { DigitalTwinDataGateResult } from "@/lib/ai/digital-twin-data-gate";
import { cn } from "@/lib/utils";

type Props = {
  gate: DigitalTwinDataGateResult;
};

/** Honest data-readiness banner for Digital Twin simulation inputs. */
export function DigitalTwinDataGateBanner({ gate }: Props) {
  const tone =
    gate.tier === "live_ready"
      ? "border-emerald-300/70 bg-emerald-50 text-emerald-950 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-50"
      : gate.tier === "partial"
        ? "border-amber-300/70 bg-amber-50 text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-50"
        : "border-orange-300/70 bg-orange-50 text-orange-950 dark:border-orange-700/60 dark:bg-orange-950/40 dark:text-orange-50";

  const Icon = gate.tier === "live_ready" ? CheckCircle2 : AlertTriangle;

  return (
    <div
      role="status"
      data-testid="digital-twin-data-gate-banner"
      data-digital-twin-gate-tier={gate.tier}
      className={cn("rounded-lg border px-4 py-3", tone)}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="font-medium">{gate.headline}</p>
            <p className="text-sm opacity-90">{gate.detail}</p>
            <p className="mt-1 text-xs opacity-80">
              Max confidence {Math.round(gate.maxConfidence * 100)}% · Policy {gate.policyId}
            </p>
          </div>
          <ul className="grid gap-1 sm:grid-cols-2">
            {gate.checks.map((check) => (
              <li key={check.signal} className="flex items-start gap-2 text-xs">
                <span aria-hidden>{check.passed ? "✓" : "○"}</span>
                <span>
                  <span className="font-medium">{check.label}:</span> {check.detail}
                  {!check.passed && check.remediationHref ? (
                    <>
                      {" "}
                      <Link href={check.remediationHref} className="underline underline-offset-2">
                        Fix
                      </Link>
                    </>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
