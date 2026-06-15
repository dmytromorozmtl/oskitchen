import Link from "next/link";
import { HelpCircle, Star, TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MENU_ENGINEERING_P2_105_CAPABILITIES,
  MENU_ENGINEERING_P2_105_EYEBROW,
  MENU_ENGINEERING_P2_105_HEADLINE,
  MENU_ENGINEERING_P2_105_OPERATOR_LINKS,
  MENU_ENGINEERING_P2_105_SUBLINE,
} from "@/lib/analytics/menu-engineering-p2-105-content";
import { MENU_ENGINEERING_P2_105_TEST_IDS } from "@/lib/analytics/menu-engineering-p2-105-policy";
import type { MenuEngineeringSnapshot } from "@/services/analytics/menu-engineering-p2-105-service";

const CAPABILITY_ICONS = [Star, TrendingUp, TrendingDown] as const;

const CATEGORY_STYLES = {
  STAR: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  PLOW: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  PUZZLE: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  DOG: "bg-muted text-muted-foreground",
} as const;

/** Blueprint P2-105 — menu engineering Stars/Plowhorses/Puzzles/Dogs panel. */
export function MenuEngineeringPanel({ snapshot }: { snapshot: MenuEngineeringSnapshot }) {
  return (
    <div className="space-y-8" data-testid={MENU_ENGINEERING_P2_105_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {MENU_ENGINEERING_P2_105_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">{MENU_ENGINEERING_P2_105_HEADLINE}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {MENU_ENGINEERING_P2_105_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live menu data"} · {snapshot.itemCount}{" "}
          items · {snapshot.targetMarginPercent}% target margin · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Stars</CardDescription>
            <CardTitle className="text-2xl">{snapshot.starCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Plowhorses</CardDescription>
            <CardTitle className="text-2xl">{snapshot.plowCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Puzzles</CardDescription>
            <CardTitle className="text-2xl">{snapshot.puzzleCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Dogs</CardDescription>
            <CardTitle className="text-2xl">{snapshot.dogCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {MENU_ENGINEERING_P2_105_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? Star;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={MENU_ENGINEERING_P2_105_TEST_IDS[index + 1]}
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

      <div className="grid gap-4 md:grid-cols-2">
        {snapshot.quadrants.map((quadrant) => (
          <Card key={quadrant.category} className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_STYLES[quadrant.category]}`}
                >
                  {quadrant.label}
                </span>
                <CardDescription>{quadrant.count} items</CardDescription>
              </div>
              <CardDescription className="text-sm">{quadrant.action}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="text-muted-foreground">
                Avg {quadrant.avgPopularity} orders · {quadrant.avgProfitability}% margin · $
                {quadrant.totalRevenuePotential.toFixed(0)} revenue potential
              </p>
              {snapshot.items
                .filter((item) => item.category === quadrant.category)
                .slice(0, 4)
                .map((item) => (
                  <div key={item.productId} className="flex justify-between border-b py-1">
                    <span>{item.productName}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {item.popularity} · {item.profitability}%
                    </span>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {snapshot.dogCount > 0 && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0">
            <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            <div>
              <CardTitle className="text-base">Dog action recommendations</CardTitle>
              <CardDescription className="mt-1">
                {snapshot.items
                  .filter((i) => i.category === "DOG")
                  .slice(0, 3)
                  .map((i) => i.productName)
                  .join(", ")}
                {snapshot.dogCount > 3 ? ` +${snapshot.dogCount - 3} more` : ""}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {snapshot.items.find((i) => i.category === "DOG")?.recommendation}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {MENU_ENGINEERING_P2_105_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
