"use client";

import { toast } from "sonner";

export function pushSuccessToast(message: string) {
  toast.success(message);
}
