import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ProviderMissingState({
  title,
  description,
  setupHref,
  setupLabel = "Open settings",
}: {
  title: string;
  description: string;
  setupHref: string;
  setupLabel?: string;
}) {
  return (
    <Card className="border-dashed border-border/80 bg-muted/10 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="secondary" className="rounded-full">
          <Link href={setupHref}>{setupLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
