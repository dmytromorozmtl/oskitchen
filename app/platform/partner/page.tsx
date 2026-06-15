import { PlatformInternalStub } from "@/components/platform/platform-internal-stub";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";

export default async function Page() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:organizations:read");
  return (
    <PlatformInternalStub
      title="Partner"
      description="Partner-attached organizations and revenue share placeholders."
    />
  );
}
