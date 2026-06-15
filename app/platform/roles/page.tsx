import { PlatformInternalStub } from "@/components/platform/platform-internal-stub";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";

export default async function Page() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:users:write");
  return (
    <PlatformInternalStub
      title="Roles & permissions"
      description="Map Prisma platform roles to fine-grained keys in lib/platform/platform-permissions.ts."
    />
  );
}
