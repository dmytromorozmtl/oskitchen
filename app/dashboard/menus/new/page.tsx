import { MenuNewWizard } from "@/components/dashboard/menu-new-wizard";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findOwnerKitchenSettings } from "@/lib/scope/owner-kitchen-settings";

export default async function NewMenuPage() {
  const { dataUserId } = await getTenantActor();
  const kitchen = await findOwnerKitchenSettings(dataUserId, { businessType: true });

  return <MenuNewWizard businessType={kitchen?.businessType ?? null} />;
}
