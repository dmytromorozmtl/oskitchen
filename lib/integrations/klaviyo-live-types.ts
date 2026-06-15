import type { EmailFlowId } from "@/services/marketing/email-marketing-service";

export type KlaviyoLiveConnectionSettings = {
  lastProfileSyncAt?: string | null;
  lastSegmentExportAt?: string | null;
  lastSegmentExportId?: string | null;
  lastSegmentExportCount?: number | null;
  lastCampaignTriggerAt?: string | null;
  lastCampaignFlow?: EmailFlowId | null;
  lastCampaignTriggered?: number | null;
};

export type KlaviyoSegmentRow = {
  id: string;
  name: string;
  profileCount: number | null;
};

export type KlaviyoLiveDashboard = {
  mode: "placeholder" | "live";
  connected: boolean;
  segmentCount: number;
  campaignFlowCount: number;
  lastProfileSyncAt: string | null;
  lastSegmentExportAt: string | null;
  lastSegmentExportCount: number | null;
  lastCampaignTriggerAt: string | null;
  lastCampaignTriggered: number | null;
  message: string;
};

export type KlaviyoCampaignTriggerResult = {
  ok: boolean;
  triggered: number;
  failed: number;
  message: string;
  errors?: string[];
};

export type KlaviyoSegmentExportResult = {
  ok: boolean;
  rowCount: number;
  filename: string;
  csv: string;
  message: string;
};
