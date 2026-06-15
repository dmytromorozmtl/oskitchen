import type { AuditLogInput } from "@/lib/audit/audit-types";
import { auditLog } from "@/services/audit/audit-service";

type AuditMutationOptions<T> = {
  audit: Omit<AuditLogInput, "before" | "after"> & {
    loadBefore?: () => Promise<unknown>;
  };
  mutate: () => Promise<T>;
  after?: (result: T) => unknown;
};

/**
 * Wrap a server mutation with centralized audit logging (non-throwing audit writer).
 */
export async function withAuditMutation<T>(opts: AuditMutationOptions<T>): Promise<T> {
  const before = opts.audit.loadBefore ? await opts.audit.loadBefore() : undefined;
  const result = await opts.mutate();
  const after = opts.after ? opts.after(result) : result;
  void auditLog({
    ...opts.audit,
    before,
    after,
  });
  return result;
}
