/**
 * Getting started pilot channel step — Evolution Era 18 Workstream L Cycle 28.
 *
 * Adds sales-channel connection to the onboarding golden path and surfaces
 * integration errors before pilot orders scale.
 * Does not claim live Woo/Shopify PASS or Square same-day setup parity.
 */

import { GETTING_STARTED_FOCUS_ERA18_POLICY_ID } from "@/lib/onboarding/getting-started-focus-era18-policy";

export const GETTING_STARTED_PILOT_CHANNEL_ERA18_POLICY_ID =
  "era18-getting-started-pilot-channel-v1" as const;

export const GETTING_STARTED_PILOT_CHANNEL_ERA18_EXTENDS_POLICIES = [
  GETTING_STARTED_FOCUS_ERA18_POLICY_ID,
] as const;

export const GETTING_STARTED_PILOT_CHANNEL_ERA18_PROOF_STATUS =
  "getting_started_pilot_channel_wired" as const;

export const GETTING_STARTED_PILOT_CHANNEL_ERA18_BACKLOG_ID = "KOS-E18-028" as const;
