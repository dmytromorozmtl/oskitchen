"use client";

/**
 * Builder asset picker — delegates to the shared media library dialog.
 * @deprecated Import `MediaPickerDialog` from `@/components/storefront/media/media-picker-dialog` directly.
 */
export {
  MediaPickerDialog as AssetPickerDialog,
  MediaPickerDialogTrigger as AssetPickerDialogTrigger,
  type MediaPickerAsset,
} from "@/components/storefront/media/media-picker-dialog";

/** @deprecated Use `MediaPickerDialog` — kept for legacy imports. */
export function AssetPickerDialogStub() {
  return null;
}
