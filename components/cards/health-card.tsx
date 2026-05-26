import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function HealthCard({
  title,
  description,
  tone = "neutral",
  children,
  className,
}: {
  title: string;
  description?: string;
  tone?: "neutral" | "ok" | "warn" | "bad";
  children?: ReactNode;
  className?: string;
}) {
  const border =
    tone === "ok"
      ? "border-emerald-500/30"
      : tone === "warn"
        ? "border-amber-500/40"
        : tone === "bad"
          ? "border-destructive/40"
          : "border-border/80";
  return (
    <Card className={cn("bg-card/90 shadow-sm", border, className)}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      {children ? <CardContent>{children}</CardContent> : null}
    </Card>
  );
}
