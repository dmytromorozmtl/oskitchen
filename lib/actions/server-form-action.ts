/**
 * React 19 form `action` props expect `void | Promise<void>`.
 * Server actions that return `{ ok, error }` should be wrapped for `<form action={...}>`.
 */
export type ServerFormActionResult = {
  ok?: boolean;
  error?: string;
  [key: string]: unknown;
};

export function asVoidFormAction<T extends (formData: FormData) => Promise<ServerFormActionResult>>(
  action: T,
): (formData: FormData) => Promise<void> {
  return async (formData: FormData) => {
    await action(formData);
  };
}

export function asVoidFormActionNoArg<T extends () => Promise<ServerFormActionResult>>(
  action: T,
): () => Promise<void> {
  return async () => {
    await action();
  };
}
