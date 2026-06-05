import type { ExportType } from "@/lib/import-export/export-types";
import type { DATA_EXPORT_POLICY_ID } from "@/lib/data/export-policy";

export type DataExportLaneId =
  | "operations"
  | "catalog"
  | "purchasing"
  | "integrations"
  | "compliance";

export type DataExportDomain = {
  type: ExportType;
  label: string;
  description: string;
  rowCount: number;
  downloadHref: string;
  format: "csv";
  accessible: boolean;
};

export type DataExportLane = {
  id: DataExportLaneId;
  label: string;
  domains: DataExportDomain[];
  rowCount: number;
};

export type DataPortabilitySnapshot = {
  policyId: typeof DATA_EXPORT_POLICY_ID;
  generatedAtIso: string;
  workspaceLabel: string;
  lanes: DataExportLane[];
  summary: {
    laneCount: number;
    domainCount: number;
    accessibleDomainCount: number;
    totalRows: number;
    manifestHref: string;
  };
  basePath: string;
};
