import type { ReactNode } from "react";

/** Minimal CSF3 types — Storybook-compatible without requiring runtime imports in CI. */

export type StoryMeta<T = unknown> = {
  title: string;
  component?: T;
  tags?: string[];
  parameters?: Record<string, unknown>;
};

export type StoryObj<TMeta extends StoryMeta = StoryMeta> = {
  args?: Record<string, unknown>;
  render?: () => ReactNode;
};

export const STORYBOOK_TOP20_TITLE_PREFIX = "Design System/Top 20" as const;

export function top20StoryMeta<T>(name: string, component: T): StoryMeta<T> {
  return {
    title: `${STORYBOOK_TOP20_TITLE_PREFIX}/${name}`,
    component,
    tags: ["top20", "design-system"],
  };
}
