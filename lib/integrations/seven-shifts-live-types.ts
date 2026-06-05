export type SevenShiftsLiveConnectionSettings = {
  staffMappings?: Record<string, string>;
  lastScheduleImportAt?: string | null;
  lastScheduleExportAt?: string | null;
  lastLaborSyncAt?: string | null;
  lastLaborTotal?: number | null;
  exportedShiftIds?: string[];
};

export type SevenShiftsLiveDashboard = {
  mode: "placeholder" | "live";
  oauthAuthorizeUrl: string | null;
  connected: boolean;
  companyId: string | null;
  staffMappingCount: number;
  lastScheduleImportAt: string | null;
  lastScheduleExportAt: string | null;
  lastLaborSyncAt: string | null;
  lastLaborTotal: number | null;
  message: string;
};
