import Link from "next/link";
import { ArrowRight, BarChart3, Radio, Sun } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AI_BRIEFING_NARRATIVE_P2_111_EYEBROW,
  AI_BRIEFING_NARRATIVE_P2_111_HEADLINE,
  AI_BRIEFING_NARRATIVE_P2_111_OPERATOR_LINKS,
  AI_BRIEFING_NARRATIVE_P2_111_SECTIONS,
  AI_BRIEFING_NARRATIVE_P2_111_SUBLINE,
} from "@/lib/ai/ai-briefing-narrative-p2-111-content";
import { AI_BRIEFING_NARRATIVE_P2_111_TEST_IDS } from "@/lib/ai/ai-briefing-narrative-p2-111-policy";
import type { AiBriefingNarrativeSnapshot } from "@/services/ai/ai-briefing-narrative-p2-111-service";

const SECTION_ICONS = [Sun, Radio, ArrowRight] as const;

/** Blueprint P2-111 — AI briefing narrative panel. */
export function AiBriefingNarrativePanel({ snapshot }: { snapshot: AiBriefingNarrativeSnapshot }) {
  return (
    <div className="space-y-8" data-testid={AI_BRIEFING_NARRATIVE_P2_111_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {AI_BRIEFING_NARRATIVE_P2_111_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {AI_BRIEFING_NARRATIVE_P2_111_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {AI_BRIEFING_NARRATIVE_P2_111_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live briefing draft"} · policy{" "}
          {snapshot.policyId}
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" aria-hidden />
            <CardTitle className="text-lg">Today&apos;s narrative</CardTitle>
          </div>
          <CardDescription className="text-base leading-relaxed text-foreground">
            {snapshot.narrative}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {AI_BRIEFING_NARRATIVE_P2_111_SECTIONS.map((section, index) => {
          const Icon = SECTION_ICONS[index] ?? Sun;
          const built = snapshot.sections.find((s) => s.id === section.id);
          return (
            <Card
              key={section.id}
              className="border-border/80 shadow-sm"
              data-testid={AI_BRIEFING_NARRATIVE_P2_111_TEST_IDS[index + 1]}
            >
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <CardTitle className="text-base">{section.label}</CardTitle>
                  <CardDescription className="mt-1">{section.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {built && <p className="text-sm">{built.text}</p>}
                <p className="font-mono text-xs text-muted-foreground">
                  {built?.sourceReference ?? section.module}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {AI_BRIEFING_NARRATIVE_P2_111_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
