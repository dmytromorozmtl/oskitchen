import { KDSSkeleton } from "@/components/dashboard/kds-skeleton";
import { PageShell } from "@/components/layout/page-shell";

export default function Loading() {
  return (
    <PageShell>
      <KDSSkeleton />
    </PageShell>
  );
}
