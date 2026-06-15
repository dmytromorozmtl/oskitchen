export type StorefrontMediaSourceKind = "EXTERNAL_URL" | "UPLOAD";

export type StorefrontMediaKind = "IMAGE" | "VIDEO" | "DOCUMENT" | "ICON";

/** Maps to `StorefrontAsset` today; future columns may extend. */
export type StorefrontMediaListItem = {
  id: string;
  url: string;
  kind: string;
  label: string | null;
  createdAt: Date;
};
