import { BetaOperationsCenter } from "@/components/beta/beta-operations-center";
import { getBetaOperationsSnapshot } from "@/services/beta/beta-service";

export default async function BetaApplicationsPage() {
  const initial = await getBetaOperationsSnapshot();
  return <BetaOperationsCenter initial={initial} />;
}
