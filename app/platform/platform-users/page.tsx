import { PlatformInternalStub } from "@/components/platform/platform-internal-stub";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";

export default async function Page() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:users:write");
  return (
    <PlatformInternalStub
      title="Platform users"
      description="OS Kitchen staff with PlatformUserRole rows — keep separate from workspace roles."
    />
  );
}
