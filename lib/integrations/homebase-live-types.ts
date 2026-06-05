export type HomebaseLiveConnectionSettings = {
  staffMappings?: Record<string, string>;
  lastScheduleImportAt?: string | null;
  lastScheduleExportAt?: string | null;
  lastTimeClockSyncAt?: string | null;
  lastTimeClockSynced?: number | null;
  exportedShiftIds?: string[];
  syncedTimecardIds?: string[];
};

export type HomebaseTimePunchRow = {
  id: string;
  userId: string;
  clockIn: string;
  clockOut: string | null;
};

export type HomebaseLiveDashboard = {
  mode: "placeholder" | "live";
  oauthAuthorizeUrl: string | null;
  connected: boolean;
  locationId: string | null;
  staffMappingCount: number;
  lastScheduleImportAt: string | null;
  lastScheduleExportAt: string | null;
  lastTimeClockSyncAt: string | null;
  lastTimeClockSynced: number | null;
  message: string;
};
