/**
 * Task checklist is stored as JSON on the task. We never assume the shape on
 * read — `parseChecklist` is forgiving and always returns an array.
 */

export type TaskChecklistItem = {
  id: string;
  title: string;
  completed: boolean;
  completedBy?: string | null;
  completedAt?: string | null;
};

export function parseChecklist(value: unknown): TaskChecklistItem[] {
  if (!Array.isArray(value)) return [];
  const out: TaskChecklistItem[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const id = typeof r.id === "string" ? r.id : null;
    const title = typeof r.title === "string" ? r.title : null;
    if (!id || !title) continue;
    out.push({
      id,
      title,
      completed: Boolean(r.completed),
      completedBy: typeof r.completedBy === "string" ? r.completedBy : null,
      completedAt: typeof r.completedAt === "string" ? r.completedAt : null,
    });
  }
  return out;
}

export function toggleChecklistItem(
  items: TaskChecklistItem[],
  id: string,
  completed: boolean,
  performedBy: string | null,
  now: Date = new Date(),
): TaskChecklistItem[] {
  return items.map((item) =>
    item.id === id
      ? {
          ...item,
          completed,
          completedBy: completed ? performedBy : null,
          completedAt: completed ? now.toISOString() : null,
        }
      : item,
  );
}

export function checklistCounts(items: TaskChecklistItem[]): { total: number; completed: number } {
  return { total: items.length, completed: items.filter((i) => i.completed).length };
}

/** Generate fresh checklist item ids without pulling in `crypto`. */
export function newChecklistId(): string {
  return Math.random().toString(36).slice(2, 10);
}
