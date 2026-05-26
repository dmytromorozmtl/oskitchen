/** Soft limits for synchronous uploads — larger files need object storage + workers (roadmap). */
export const IMPORT_SYNC_SOFT_ROW_WARNING = 25_000;
export const IMPORT_SYNC_SOFT_BYTES_WARNING = 12 * 1024 * 1024;
