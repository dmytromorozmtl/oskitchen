import { PlatformInternalStub } from "@/components/platform/platform-internal-stub";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";

export default async function Page() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:organizations:read");
  return (
    <PlatformInternalStub
      title="Beta applications"
      description="Intake queue to convert qualified betas into provisioned workspaces."
    />
  );
}
