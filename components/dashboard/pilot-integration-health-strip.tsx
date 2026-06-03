export {
  IntegrationHealthStrip,
  type IntegrationHealthStripModel,
} from "@/components/dashboard/integration-health-strip";

import {
  IntegrationHealthStrip,
} from "@/components/dashboard/integration-health-strip";
import type { PilotIntegrationHealthCommercialInflectionFootnote } from "@/lib/integrations/pilot-integration-health-commercial-inflection-era28";
import type { PilotIntegrationHealthStripModel } from "@/lib/integrations/pilot-integration-health-strip-era18";

/** @deprecated Use `IntegrationHealthStrip` from `@/components/dashboard/integration-health-strip`. */
export function PilotIntegrationHealthStrip(props: {
  model: PilotIntegrationHealthStripModel & {
    commercialInflection?: PilotIntegrationHealthCommercialInflectionFootnote | null;
  };
}) {
  return <IntegrationHealthStrip model={props.model} />;
}
