import {
  BUTTON_REGRESSION_P3_52_CRITICAL_PAGE_COUNT,
  BUTTON_REGRESSION_P3_52_CRITICAL_PAGES,
  type ButtonRegressionCriticalPageId,
} from "@/lib/qa/button-regression-p3-52-policy";

export type ButtonRegressionButtonProbe = {
  id: string;
  namePattern: string;
  clickSafe: boolean;
  optional?: boolean;
};

export type ButtonRegressionPageProbe = {
  pageId: ButtonRegressionCriticalPageId;
  path: string;
  label: string;
  buttons: readonly ButtonRegressionButtonProbe[];
};

/** Dashboard shell controls probed on every critical page. */
export const BUTTON_REGRESSION_P3_52_SHELL_BUTTONS: readonly ButtonRegressionButtonProbe[] = [
  {
    id: "nav_menu",
    namePattern: "Open navigation menu",
    clickSafe: true,
    optional: true,
  },
  {
    id: "account_menu",
    namePattern: "Open account menu",
    clickSafe: true,
    optional: true,
  },
  {
    id: "theme_toggle",
    namePattern: "Toggle theme",
    clickSafe: true,
    optional: true,
  },
] as const;

/** Page-specific primary actions (non-destructive probes only). */
export const BUTTON_REGRESSION_P3_52_PAGE_SPECIFIC_BUTTONS: Partial<
  Record<ButtonRegressionCriticalPageId, readonly ButtonRegressionButtonProbe[]>
> = {
  "quick-start": [
    {
      id: "continue",
      namePattern: "^continue$",
      clickSafe: true,
      optional: true,
    },
  ],
  kitchen: [
    {
      id: "sound_toggle",
      namePattern: "kitchen sound alerts",
      clickSafe: true,
      optional: true,
    },
  ],
  "pos-terminal": [
    {
      id: "shortcuts_hint",
      namePattern: "keyboard shortcuts",
      clickSafe: false,
      optional: true,
    },
  ],
  "qr-codes": [
    {
      id: "generate_qr",
      namePattern: "generate qr",
      clickSafe: false,
      optional: true,
    },
  ],
  "ai-co-pilot": [
    {
      id: "new_chat",
      namePattern: "new chat",
      clickSafe: true,
      optional: true,
    },
  ],
  marketplace: [
    {
      id: "browse_catalog",
      namePattern: "browse catalog",
      clickSafe: false,
      optional: true,
    },
  ],
};

export function buttonsForCriticalPage(
  pageId: ButtonRegressionCriticalPageId,
): readonly ButtonRegressionButtonProbe[] {
  const specific = BUTTON_REGRESSION_P3_52_PAGE_SPECIFIC_BUTTONS[pageId] ?? [];
  return [...BUTTON_REGRESSION_P3_52_SHELL_BUTTONS, ...specific];
}

export function buildButtonRegressionPageProbes(): ButtonRegressionPageProbe[] {
  return BUTTON_REGRESSION_P3_52_CRITICAL_PAGES.map((page) => ({
    pageId: page.id,
    path: page.path,
    label: page.label,
    buttons: buttonsForCriticalPage(page.id),
  }));
}

export function countButtonRegressionProbes(): number {
  return buildButtonRegressionPageProbes().reduce(
    (total, page) => total + page.buttons.length,
    0,
  );
}

export function countRequiredButtonRegressionProbes(): number {
  return buildButtonRegressionPageProbes().reduce(
    (total, page) => total + page.buttons.filter((button) => !button.optional).length,
    0,
  );
}

export function validateButtonRegressionContract(): {
  passed: boolean;
  pageCount: number;
  probeCount: number;
  errors: string[];
} {
  const pages = buildButtonRegressionPageProbes();
  const errors: string[] = [];

  if (pages.length !== BUTTON_REGRESSION_P3_52_CRITICAL_PAGE_COUNT) {
    errors.push(
      `Expected ${BUTTON_REGRESSION_P3_52_CRITICAL_PAGE_COUNT} pages, got ${pages.length}`,
    );
  }

  const paths = pages.map((page) => page.path);
  if (new Set(paths).size !== paths.length) {
    errors.push("Duplicate critical page paths detected");
  }

  for (const page of pages) {
    if (page.buttons.length < BUTTON_REGRESSION_P3_52_SHELL_BUTTONS.length) {
      errors.push(`${page.pageId}: missing shell button probes`);
    }
  }

  const probeCount = countButtonRegressionProbes();
  if (probeCount < BUTTON_REGRESSION_P3_52_CRITICAL_PAGE_COUNT * 3) {
    errors.push(`Probe count ${probeCount} below minimum 90`);
  }

  return {
    passed: errors.length === 0,
    pageCount: pages.length,
    probeCount,
    errors,
  };
}

export function findCriticalPageProbe(
  pageId: ButtonRegressionCriticalPageId,
): ButtonRegressionPageProbe | undefined {
  return buildButtonRegressionPageProbes().find((page) => page.pageId === pageId);
}
