import { Store } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";

export function MarketplaceDataUnavailable({
  title = "Marketplace temporarily unavailable",
  description = "We could not load marketplace data for this workspace. Try again in a moment.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <EmptyState
      icon={Store}
      title={title}
      description={description}
      primaryLabel="Marketplace home"
      primaryHref="/dashboard/marketplace"
      secondaryLabel="Today"
      secondaryHref="/dashboard/today"
    />
  );
}
