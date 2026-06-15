import Link from "next/link";
import { CheckCircle2, ClipboardCheck, ListChecks, PackageSearch } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EXPO_MODE_CAPABILITIES,
  EXPO_MODE_EYEBROW,
  EXPO_MODE_HEADLINE,
  EXPO_MODE_OPERATOR_LINKS,
  EXPO_MODE_SUBLINE,
} from "@/lib/kitchen/expo-mode-p2-93-content";
import { formatKdsElapsedClock } from "@/lib/kitchen/kds-queue-clarity-era18";
import { EXPO_MODE_TEST_IDS } from "@/lib/kitchen/expo-mode-p2-93-policy";
import type { ExpoModeSnapshot } from "@/services/kitchen/expo-mode-p2-93-service";

const CAPABILITY_ICONS = [ListChecks, PackageSearch, ClipboardCheck] as const;

/** Blueprint P2-93 — expo mode panel. */
export function ExpoModePanel({ snapshot }: { snapshot: ExpoModeSnapshot }) {
  return (
    <div className="space-y-8" data-testid={EXPO_MODE_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {EXPO_MODE_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">{EXPO_MODE_HEADLINE}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {EXPO_MODE_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.queueCount} expo ticket(s) · {snapshot.readyTicketCount} bumped READY · policy{" "}
          {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Expo queue</CardDescription>
            <CardTitle className="text-2xl">{snapshot.queueCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-emerald-200/80 shadow-sm dark:border-emerald-900/40">
          <CardHeader className="pb-2">
            <CardDescription>Complete</CardDescription>
            <CardTitle className="text-2xl text-emerald-600 dark:text-emerald-400">
              {snapshot.completeCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-amber-200/80 shadow-sm dark:border-amber-900/40">
          <CardHeader className="pb-2">
            <CardDescription>Missing items</CardDescription>
            <CardTitle className="text-2xl text-amber-600 dark:text-amber-400">
              {snapshot.incompleteCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {EXPO_MODE_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? ListChecks;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={EXPO_MODE_TEST_IDS[index + 1]}
            >
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <CardTitle className="text-base">{capability.label}</CardTitle>
                  <CardDescription className="mt-1">{capability.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs text-muted-foreground">{capability.module}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {snapshot.orders.length > 0 ? (
        <div className="space-y-4">
          {snapshot.orders.slice(0, 8).map((order) => (
            <Card key={order.orderId} className="border-border/80 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-base">{order.customerName}</CardTitle>
                  <CardDescription>
                    {order.completenessPercent}% complete · {formatKdsElapsedClock(order.elapsedSeconds)}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  {order.isComplete ? (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" aria-hidden />
                      Complete
                    </Badge>
                  ) : (
                    <Badge variant="destructive">{order.missingItems.length} missing</Badge>
                  )}
                  {order.canHandoff ? (
                    <Badge variant="default">Ready for handoff</Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {order.missingItems.length > 0 ? (
                  <p className="text-muted-foreground">
                    Missing: {order.missingItems.join(", ")}
                  </p>
                ) : null}
                <div className="grid gap-2 md:grid-cols-2">
                  {order.handoffChecklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span
                        className={
                          item.checked
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground"
                        }
                      >
                        {item.checked ? "✓" : "○"}
                      </span>
                      <span>{item.label}</span>
                      {item.required ? (
                        <Badge variant="outline" className="text-[10px]">
                          required
                        </Badge>
                      ) : null}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No expo tickets — bump orders to READY on KDS to populate the pass queue.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {EXPO_MODE_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
