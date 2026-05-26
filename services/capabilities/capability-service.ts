import { getServerEnv } from "@/lib/env";
import { buildCapabilityRows, type CapabilityRow } from "@/lib/capabilities/capability-matrix";

export function listCapabilities(): CapabilityRow[] {
  return buildCapabilityRows(getServerEnv());
}
