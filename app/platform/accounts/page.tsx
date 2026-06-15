import { PlatformInternalStub } from "@/components/platform/platform-internal-stub";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";

export default async function Page() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:workspaces:read");
  return (
    <PlatformInternalStub
      title="Accounts"
      description="Roll-up of billing owners, contract mode, and workspace membership for finance and CS."
    />
  );
}
