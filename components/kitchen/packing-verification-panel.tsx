import Link from "next/link";
import { AlertTriangle, PackageCheck, QrCode, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PACKING_VERIFICATION_P2_94_CAPABILITIES,
  PACKING_VERIFICATION_P2_94_EYEBROW,
  PACKING_VERIFICATION_P2_94_HEADLINE,
  PACKING_VERIFICATION_P2_94_OPERATOR_LINKS,
  PACKING_VERIFICATION_P2_94_SUBLINE,
} from "@/lib/kitchen/packing-verification-p2-94-content";
import { PACKING_VERIFICATION_P2_94_TEST_IDS } from "@/lib/kitchen/packing-verification-p2-94-policy";
import type { PackingVerificationSnapshot } from "@/services/kitchen/packing-verification-p2-94-service";

const CAPABILITY_ICONS = [QrCode, ShieldAlert, PackageCheck] as const;

/** Blueprint P2-94 — packing verification panel. */
export function PackingVerificationPanel({ snapshot }: { snapshot: PackingVerificationSnapshot }) {
  return (
    <div className="space-y-8" data-testid={PACKING_VERIFICATION_P2_94_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {PACKING_VERIFICATION_P2_94_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">{PACKING_VERIFICATION_P2_94_HEADLINE}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {PACKING_VERIFICATION_P2_94_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.taskCount} pack task(s) · {snapshot.deliveryCount} delivery · policy{" "}
          {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Labels missing</CardDescription>
            <CardTitle className="text-2xl">{snapshot.labelsMissingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-amber-200/80 shadow-sm dark:border-amber-900/40">
          <CardHeader className="pb-2">
            <CardDescription>Allergen open</CardDescription>
            <CardTitle className="text-2xl text-amber-600 dark:text-amber-400">
              {snapshot.allergenOpenCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-emerald-200/80 shadow-sm dark:border-emerald-900/40">
          <CardHeader className="pb-2">
            <CardDescription>Bags ready</CardDescription>
            <CardTitle className="text-2xl text-emerald-600 dark:text-emerald-400">
              {snapshot.bagReadyCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Queued</CardDescription>
            <CardTitle className="text-2xl">{snapshot.focus.queuedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PACKING_VERIFICATION_P2_94_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? PackageCheck;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={PACKING_VERIFICATION_P2_94_TEST_IDS[index + 1]}
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

      {snapshot.allergenRows.length > 0 ? (
        <Card className="border-violet-200/80 bg-violet-50/40 shadow-sm dark:border-violet-900/40 dark:bg-violet-950/20">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden />
            <div>
              <CardTitle className="text-base">Open allergen checks</CardTitle>
              <CardDescription>Clear before bag handoff</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {snapshot.allergenRows.slice(0, 8).map((row) => (
              <div key={row.taskId} className="flex justify-between gap-2 border-b py-2 last:border-0">
                <span>
                  {row.title} · {row.customerName}
                </span>
                <span className="text-muted-foreground">{row.allergenSummary ?? "review required"}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {snapshot.tasks.length > 0 ? (
        <div className="space-y-4">
          {snapshot.tasks.slice(0, 6).map((task) => (
            <Card key={task.taskId} className="border-border/80 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-base">{task.title}</CardTitle>
                  <CardDescription>
                    {task.customerName} · {task.fulfillmentType}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  {task.labelMissing ? <Badge variant="destructive">Label missing</Badge> : null}
                  {task.allergenOpen ? <Badge variant="outline">Allergen</Badge> : null}
                  {task.bagReady ? <Badge variant="secondary">Bag ready</Badge> : null}
                </div>
              </CardHeader>
              <CardContent className="grid gap-2 md:grid-cols-2 text-sm">
                {task.deliveryBagChecklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className={item.checked ? "text-emerald-600" : "text-muted-foreground"}>
                      {item.checked ? "✓" : "○"}
                    </span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No pack tasks today — generate packing queue to start verification.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {PACKING_VERIFICATION_P2_94_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
