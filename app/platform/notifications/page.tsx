import { PlatformInternalStub } from "@/components/platform/platform-internal-stub";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";

export default async function Page() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:automations:read");
  return (
    <PlatformInternalStub
      title="Notifications"
      description="Notification fan-out, failures, and template diagnostics."
    />
  );
}
