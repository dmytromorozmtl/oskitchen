import type { DigitalTwinDataGateResult } from "@/lib/ai/digital-twin-data-gate";

export type TwinStation = {
  name: string;
  capacity: number;
  currentLoad: number;
};

export type TwinStaff = {
  name: string;
  station: string;
  efficiency: number;
};

export type TwinEquipment = {
  name: string;
  station: string;
  throughput: number;
};

export type KitchenTwinConfig = {
  stations: TwinStation[];
  staff: TwinStaff[];
  equipment: TwinEquipment[];
};

export type SimulationMenuMixItem = {
  item: string;
  percentage: number;
};

export type SimulationParams = {
  orderCount: number;
  /** Simulation horizon in minutes. */
  timeWindow: number;
  menuMix: SimulationMenuMixItem[];
};

export type SimulationResult = {
  bottleneckStation: string;
  bottleneckDelay: number;
  totalTime: number;
  stationUtilization: { station: string; utilization: number }[];
  waitTimes: { station: string; avgWait: number; maxWait: number }[];
  recommendations: string[];
  /** AI-assisted — deterministic queue model, not live camera data. */
  aiAssisted: true;
  confidence: number;
};

export type KitchenSimulation = {
  config: KitchenTwinConfig;
  simulate(params: SimulationParams): SimulationResult;
};

export type DigitalTwinDashboardPayload = {
  config: KitchenTwinConfig;
  defaultMenuMix: SimulationMenuMixItem[];
  initialResult: SimulationResult;
  dataGate: DigitalTwinDataGateResult;
};
