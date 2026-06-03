"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  PREVIEW_REVEAL_CANCEL_LABEL,
  PREVIEW_REVEAL_CONFIRM_LABEL,
  PREVIEW_REVEAL_DIALOG_BODY,
  PREVIEW_REVEAL_DIALOG_TITLE,
} from "@/lib/navigation/preview-route-hiding-confirmation-policy";

export type PreviewRouteHidingConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  previewLinkCount?: number;
};

export function PreviewRouteHidingConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  previewLinkCount,
}: PreviewRouteHidingConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid="preview-route-hiding-confirmation-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>{PREVIEW_REVEAL_DIALOG_TITLE}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{PREVIEW_REVEAL_DIALOG_BODY}</p>
              {previewLinkCount != null && previewLinkCount > 0 ? (
                <p className="font-medium text-foreground">
                  {previewLinkCount} preview module{previewLinkCount === 1 ? "" : "s"} will appear
                  in the sidebar.
                </p>
              ) : null}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{PREVIEW_REVEAL_CANCEL_LABEL}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            data-testid="preview-route-hiding-confirm"
          >
            {PREVIEW_REVEAL_CONFIRM_LABEL}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
