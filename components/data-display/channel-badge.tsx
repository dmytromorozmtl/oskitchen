import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const labels: Record<string, string> = {
  WOOCOMMERCE: "WooCommerce",
  SHOPIFY: "Shopify",
  UBER_EATS: "Uber Eats",
  UBER_DIRECT: "Uber Direct",
  MANUAL: "Manual",
};

export function ChannelBadge({
  provider,
  className,
}: {
  provider: string;
  className?: string;
}) {
  const label = labels[provider] ?? provider;
  return (
    <Badge variant="outline" className={cn("rounded-full font-normal", className)}>
      {label}
    </Badge>
  );
}
