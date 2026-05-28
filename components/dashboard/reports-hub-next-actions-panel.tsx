import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReportsHubNextActionCard } from "@/lib/reports/reports-hub-next-actions-era21";
import { cn } from "@/lib/utils";

export function ReportsHubNextActionsPanel(props: { cards: readonly ReportsHubNextActionCard[] }) {
  const { cards } = props;
  if (cards.length === 0) return null;

  return (
    <section className="space-y-2" data-testid="reports-hub-next-actions">
      <h2 className="text-lg font-semibold">Recommended next actions</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {cards.map((card) => (
          <Card
            key={card.id}
            className={cn(
              "border-border/80 shadow-sm",
              card.tone === "attention" && "border-amber-200/70 bg-amber-50/10 dark:border-amber-900/40",
              card.tone === "primary" && "border-primary/25 bg-primary/[0.03]",
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{card.title}</CardTitle>
              <CardDescription>{card.detail}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant={card.tone === "primary" ? "default" : "outline"} size="sm" className="rounded-full">
                <Link href={card.href} data-testid={`reports-next-action-${card.id}`}>
                  {card.ctaLabel}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
