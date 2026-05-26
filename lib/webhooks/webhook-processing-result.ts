export type WebhookProcessingResult =
  | { ok: true }
  | { ok: false; code: string; message: string; retryable: boolean };
