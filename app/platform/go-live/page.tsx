import { PlatformInternalStub } from "@/components/platform/platform-internal-stub";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";

export default async function Page() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:workspaces:read");
  return (
    <PlatformInternalStub
      title="Go-live"
      description="Launch calendar, readiness gates, and post go-live verification."
    />
  );
}
