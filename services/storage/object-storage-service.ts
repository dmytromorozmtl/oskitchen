export type ObjectStorageMode = "NOT_CONFIGURED" | "S3_COMPATIBLE_ROADMAP";

export function objectStorageMode(): ObjectStorageMode {
  return process.env.OBJECT_STORAGE_BUCKET?.trim() ? "S3_COMPATIBLE_ROADMAP" : "NOT_CONFIGURED";
}
