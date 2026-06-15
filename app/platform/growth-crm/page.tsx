import { PlatformInternalStub } from "@/components/platform/platform-internal-stub";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";

export default async function Page() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:organizations:read");
  return (
    <PlatformInternalStub
      title="Growth CRM"
      description="Pipeline stages from lead to paid — connect growth tables when ready."
    />
  );
}
