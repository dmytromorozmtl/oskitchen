import { isLighthouseCiGateP3_60Enabled } from "@/lib/qa/lighthouse-ci-gate-p3-60-policy";

export function lighthouseCiGateP3_60Ready(): boolean {
  return isLighthouseCiGateP3_60Enabled();
}
