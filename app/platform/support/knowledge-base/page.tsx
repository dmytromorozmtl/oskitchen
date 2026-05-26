import { PlatformInternalStub } from "@/components/platform/platform-internal-stub";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";

export default async function PlatformSupportKnowledgeBasePage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:support:read");
  return (
    <PlatformInternalStub
      title="Knowledge base"
      description="Macros, suggested replies, and runbooks for operators — connect SupportMacro and internal docs next."
    />
  );
}
