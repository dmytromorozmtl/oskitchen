export type VoiceOrderChannel = "alexa" | "google_home" | "dashboard_test";

export type VoiceOrderSourceMetadata = {
  voice?: {
    channel?: VoiceOrderChannel;
    utterance?: string;
    tableLabel?: string;
    tableNumber?: string;
    confidence?: number;
    parsedSummary?: string;
  };
  table?: string;
};

export function buildVoiceOrderSourceMetadata(input: {
  channel: VoiceOrderChannel;
  utterance: string;
  tableLabel: string;
  confidence: number;
  parsedSummary: string;
}): VoiceOrderSourceMetadata {
  const tableNumber = input.tableLabel.replace(/^Table\s*/i, "").trim();
  return {
    voice: {
      channel: input.channel,
      utterance: input.utterance.slice(0, 500),
      tableLabel: input.tableLabel,
      tableNumber,
      confidence: input.confidence,
      parsedSummary: input.parsedSummary,
    },
    table: input.tableLabel,
  };
}

export function readVoiceTableLabel(sourceMetadataJson: unknown): string | null {
  if (!sourceMetadataJson || typeof sourceMetadataJson !== "object") return null;
  const meta = sourceMetadataJson as VoiceOrderSourceMetadata;
  if (meta.voice?.tableLabel?.trim()) return meta.voice.tableLabel.trim();
  if (meta.table?.trim()) return meta.table.trim();
  return null;
}

export function isVoiceOrder(sourceMetadataJson: unknown): boolean {
  if (!sourceMetadataJson || typeof sourceMetadataJson !== "object") return false;
  const meta = sourceMetadataJson as VoiceOrderSourceMetadata;
  return Boolean(meta.voice?.channel);
}
