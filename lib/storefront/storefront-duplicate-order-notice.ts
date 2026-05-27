type DuplicateNoticeInput = {
  duplicate: boolean;
  paymentMode: string | null | undefined;
  paymentStatus: string | null | undefined;
};

export function getStorefrontDuplicateOrderNotice(input: DuplicateNoticeInput): {
  tone: "info" | "warning";
  message: string;
} | null {
  if (!input.duplicate) {
    return null;
  }

  if (input.paymentMode === "ONLINE_PAYMENT" && input.paymentStatus === "PENDING") {
    return {
      tone: "warning",
      message:
        "We found a recent identical order and reused it to avoid starting a second card payment. Use the original checkout window or wait for confirmation.",
    };
  }

  if (input.paymentMode === "ONLINE_PAYMENT" && input.paymentStatus === "FAILED") {
    return {
      tone: "info",
      message:
        "We found a recent identical order and reused it instead of creating a duplicate. Retry payment below when you are ready.",
    };
  }

  return {
    tone: "info",
    message: "We found a recent identical order and reused it instead of creating a duplicate.",
  };
}
