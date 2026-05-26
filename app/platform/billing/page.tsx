import { PlatformInternalStub } from "@/components/platform/platform-internal-stub";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";

export default async function Page() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:billing:read");
  return (
    <PlatformInternalStub
      title="Billing"
      description="Subscriptions, failed payments, and Stripe-linked truth — never fabricate gateway state."
    />
  );
}
