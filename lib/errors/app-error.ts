/** Typed application error — safe to message-map for UI without leaking internals. */
export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly exposeToClient: boolean;

  constructor(
    message: string,
    opts: { code: string; status?: number; exposeToClient?: boolean; cause?: unknown },
  ) {
    super(message, { cause: opts.cause });
    this.name = "AppError";
    this.code = opts.code;
    this.status = opts.status ?? 400;
    this.exposeToClient = opts.exposeToClient ?? false;
  }
}

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError;
}
