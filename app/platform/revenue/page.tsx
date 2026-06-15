import { PlatformInternalStub } from "@/components/platform/platform-internal-stub";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";

export default async function Page() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:billing:read");
  return (
    <PlatformInternalStub
      title="Revenue"
      description="MRR/ARR once wired to Stripe reporting — placeholders only until then."
    />
  );
}
