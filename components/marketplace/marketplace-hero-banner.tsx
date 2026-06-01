"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MarketplaceDashboardPromotion } from "@/services/marketplace/marketplace-dashboard-service";

export function MarketplaceHeroBanner({
  promotions,
}: {
  promotions: MarketplaceDashboardPromotion[];
}) {
  const [index, setIndex] = useState(0);
  const items = promotions.length > 0 ? promotions : [];

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  const active = items[index] ?? items[0]!;

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background shadow-sm">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          {active.badge ? (
            <Badge variant="secondary" className="rounded-full">
              {active.badge}
            </Badge>
          ) : null}
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{active.title}</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">{active.subtitle}</p>
          <Button asChild className="mt-2 rounded-full">
            <Link href={active.href}>Explore</Link>
          </Button>
        </div>
        {items.length > 1 ? (
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
              aria-label="Previous promotion"
              onClick={() => setIndex((current) => (current - 1 + items.length) % items.length)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-1">
              {items.map((item, dotIndex) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Show promotion ${dotIndex + 1}`}
                  className={`h-2 w-2 rounded-full ${dotIndex === index ? "bg-primary" : "bg-muted-foreground/30"}`}
                  onClick={() => setIndex(dotIndex)}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
              aria-label="Next promotion"
              onClick={() => setIndex((current) => (current + 1) % items.length)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
