import { POSSkeleton } from "@/components/dashboard/pos-skeleton";
import { PageShell } from "@/components/layout/page-shell";

export default function Loading() {
  return (
    <PageShell>
      <POSSkeleton />
    </PageShell>
  );
}
