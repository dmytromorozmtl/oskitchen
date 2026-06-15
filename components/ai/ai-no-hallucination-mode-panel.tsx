import Link from "next/link";
import { Database, ShieldBan, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AI_NO_HALLUCINATION_MODE_P2_110_CAPABILITIES,
  AI_NO_HALLUCINATION_MODE_P2_110_EYEBROW,
  AI_NO_HALLUCINATION_MODE_P2_110_HEADLINE,
  AI_NO_HALLUCINATION_MODE_P2_110_OPERATOR_LINKS,
  AI_NO_HALLUCINATION_MODE_P2_110_SUBLINE,
} from "@/lib/ai/ai-no-hallucination-mode-p2-110-content";
import { AI_NO_HALLUCINATION_MODE_P2_110_TEST_IDS } from "@/lib/ai/ai-no-hallucination-mode-p2-110-policy";
import type { AiNoHallucinationModeSnapshot } from "@/services/ai/ai-no-hallucination-mode-p2-110-service";

const CAPABILITY_ICONS = [Database, ShieldCheck, ShieldBan] as const;

/** Blueprint P2-110 — AI no hallucination mode panel. */
export function AiNoHallucinationModePanel({ snapshot }: { snapshot: AiNoHallucinationModeSnapshot }) {
  return (
    <div className="space-y-8" data-testid={AI_NO_HALLUCINATION_MODE_P2_110_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {AI_NO_HALLUCINATION_MODE_P2_110_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {AI_NO_HALLUCINATION_MODE_P2_110_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {AI_NO_HALLUCINATION_MODE_P2_110_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live insights"} · mode{" "}
          {snapshot.modeEnabled ? "enabled" : "relaxed"} · {snapshot.passCount}/{snapshot.checkCount}{" "}
          pass · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Pass</CardDescription>
            <CardTitle className="text-2xl text-green-600">{snapshot.passCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Blocked</CardDescription>
            <CardTitle className="text-2xl">{snapshot.blockedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Needs source</CardDescription>
            <CardTitle className="text-2xl">{snapshot.needsSourceCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {AI_NO_HALLUCINATION_MODE_P2_110_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? Database;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={AI_NO_HALLUCINATION_MODE_P2_110_TEST_IDS[index + 1]}
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

      {snapshot.checks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Claim checks</h3>
          <div className="grid gap-2">
            {snapshot.checks.map((check) => (
              <Card key={check.id} className="border-border/80 shadow-sm">
                <CardHeader className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-sm">{check.claim}</CardTitle>
                    <Badge
                      variant={
                        check.verdict === "pass"
                          ? "default"
                          : check.verdict === "blocked"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {check.verdict}
                    </Badge>
                  </div>
                  <CardDescription>
                    {check.reason ?? "Source-backed tenant claim"}
                    {check.sourceReference ? ` · ${check.sourceReference}` : ""}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {AI_NO_HALLUCINATION_MODE_P2_110_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
