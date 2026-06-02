/**
 * Legacy path — Next.js loads `instrumentation-client.ts` for the browser SDK.
 * Re-export router hook only; do not call Sentry.init here (avoids double init).
 */
export { onRouterTransitionStart } from "./instrumentation-client";
