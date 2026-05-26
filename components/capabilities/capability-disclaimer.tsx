import { capabilityStatusFootnote } from "@/lib/capabilities/capability-copy";

export function CapabilityDisclaimer() {
  return (
    <p className="text-xs text-muted-foreground">{capabilityStatusFootnote()}</p>
  );
}
