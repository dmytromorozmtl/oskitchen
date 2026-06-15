import type { KdsDailyOrder } from "@/services/kitchen-screen/daily-kds-service";
import type { SimulationMenuMixItem, SimulationResult } from "@/lib/ai/digital-twin-types";

/** Live KDS queue snapshot for Digital Twin seeding. */
export type KdsLiveState = {
  queueDepth: number;
  highPriorityCount: number;
  avgWaitMinutes: number;
  stationLoads: { station: string; load: number }[];
  orders: KdsDailyOrder[];
  updatedAt: string;
};

/** Recent POS order flow — incoming rate and menu mix for the next simulation window. */
export type PosLiveSnapshot = {
  ordersLastHour: number;
  incomingRatePerHour: number;
  menuMix: SimulationMenuMixItem[];
  updatedAt: string;
};

/** Predictions persisted for KDS UI / polling clients. */
export type KdsTwinPredictions = {
  workspaceId: string;
  updatedAt: string;
  bottleneckStation: string;
  bottleneckDelayMinutes: number;
  alertActive: boolean;
  stationPredictions: {
    station: string;
    predictedWaitMinutes: number;
    utilization: number;
    currentLoad: number;
  }[];
  recommendations: string[];
  confidence: number;
  aiAssisted: true;
};

export type RealTimeTwinUpdate = {
  workspaceId: string;
  kdsState: KdsLiveState;
  posSnapshot: PosLiveSnapshot;
  simulation: SimulationResult;
  predictions: KdsTwinPredictions;
  alertSent: boolean;
  alertReason?: string;
};
