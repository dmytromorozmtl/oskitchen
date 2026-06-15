import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function MarketplaceSetupIllustration() {
  return (
    <svg
      viewBox="0 0 160 120"
      role="img"
      aria-label="Marketplace setup in progress"
      className="mx-auto h-28 w-36 text-primary/80"
    >
      <rect
        x="24"
        y="52"
        width="112"
        height="56"
        rx="6"
        fill="currentColor"
        opacity="0.08"
      />
      <path
        d="M24 52 L80 28 L136 52"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity="0.35"
      />
      <rect
        x="68"
        y="72"
        width="24"
        height="36"
        rx="2"
        fill="currentColor"
        opacity="0.2"
      />
      <rect
        x="36"
        y="64"
        width="20"
        height="16"
        rx="2"
        fill="currentColor"
        opacity="0.15"
      />
      <rect
        x="104"
        y="64"
        width="20"
        height="16"
        rx="2"
        fill="currentColor"
        opacity="0.15"
      />
      <circle cx="80" cy="18" r="10" fill="currentColor" opacity="0.12" />
      <path
        d="M74 18 L78 22 L86 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.45"
      />
    </svg>
  );
}

export function MarketplaceDataUnavailable({
  title = "Marketplace is being set up",
  description = "Vendor catalog, checkout, and order flows are rolling out for your workspace. We will notify you when marketplace data is ready.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card
      data-testid="marketplace-data-unavailable"
      className="mx-auto max-w-lg border-dashed border-border/80 bg-muted/10 shadow-none"
    >
      <CardHeader className="text-center">
        <MarketplaceSetupIllustration />
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        <Button asChild className="rounded-full" variant="premium">
          <Link href="/dashboard/support">Contact support</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/dashboard/today">Go to Today</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
