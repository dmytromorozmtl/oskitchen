import { buildEra20PilotIcpQualificationBridgeSlice } from "@/lib/commercial/era20-pilot-icp-qualification-bridge-era20";
import type { Era20PilotIcpQualificationBridgeSlice } from "@/lib/commercial/era20-pilot-icp-qualification-bridge-era20";

export async function loadPilotIcpQualificationBridgeSlice(): Promise<Era20PilotIcpQualificationBridgeSlice> {
  return buildEra20PilotIcpQualificationBridgeSlice({
    icpEnvRaw: process.env.PILOT_GONOGO_ICP_INPUT_JSON,
  });
}
