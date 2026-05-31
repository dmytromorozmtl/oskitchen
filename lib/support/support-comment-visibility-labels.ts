/** User-facing labels for support ticket comment visibility (RU + short EN code for triage). */
export const SUPPORT_COMMENT_VISIBILITY_LABEL: Record<string, string> = {
  CUSTOMER: "Сообщение клиенту (видно в переписке / email при настроенной доставке)",
  INTERNAL: "Внутренняя заметка (только команда поддержки OS Kitchen)",
  PARTNER: "Партнёр (если задействован партнёрский канал)",
};

export function supportCommentVisibilityBadgeLabel(visibility: string): string {
  return SUPPORT_COMMENT_VISIBILITY_LABEL[visibility] ?? visibility;
}
