import { KDSSkeleton } from "@/components/dashboard/kds-skeleton";

export default function KdsProductionViewLoading() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <KDSSkeleton section="production" />
    </div>
  );
}
