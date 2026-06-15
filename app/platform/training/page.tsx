import { PlatformInternalStub } from "@/components/platform/platform-internal-stub";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";

export default async function Page() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:workspaces:read");
  return (
    <PlatformInternalStub
      title="Training"
      description="Training sessions scheduled, materials delivered, and certification status."
    />
  );
}
