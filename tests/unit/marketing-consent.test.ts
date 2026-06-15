import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  denyMarketingConsent,
  grantMarketingConsent,
  hasMarketingConsentCookie,
  MARKETING_CONSENT_EVENT,
} from "@/lib/analytics/marketing-consent";

const ORIGINAL_WINDOW = globalThis.window;
const ORIGINAL_DOCUMENT = globalThis.document;
const ORIGINAL_ENV = { ...process.env };

describe("marketing consent helpers", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";

    const listeners = new Map<string, EventListener[]>();
    const dispatchEvent = vi.fn((event: Event) => {
      const handlers = listeners.get(event.type) ?? [];
      handlers.forEach((handler) => handler(event));
      return true;
    });

    const windowMock = {
      gtag: vi.fn(),
      fbq: vi.fn(),
      dispatchEvent,
      addEventListener: vi.fn((type: string, handler: EventListener) => {
        listeners.set(type, [...(listeners.get(type) ?? []), handler]);
      }),
      removeEventListener: vi.fn((type: string, handler: EventListener) => {
        listeners.set(
          type,
          (listeners.get(type) ?? []).filter((candidate) => candidate !== handler),
        );
      }),
    };

    Object.defineProperty(globalThis, "window", {
      value: windowMock,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, "document", {
      value: { cookie: "foo=bar; kitchenos-cookie-consent=true" },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    Object.defineProperty(globalThis, "window", {
      value: ORIGINAL_WINDOW,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, "document", {
      value: ORIGINAL_DOCUMENT,
      configurable: true,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  it("reads the consent cookie", () => {
    expect(hasMarketingConsentCookie()).toBe(true);
  });

  it("grants marketing consent across trackers and emits an event", () => {
    grantMarketingConsent();

    expect(globalThis.window.gtag).toHaveBeenCalledWith(
      "consent",
      "update",
      expect.objectContaining({
        analytics_storage: "granted",
        ad_storage: "granted",
      }),
    );
    expect(globalThis.window.fbq).toHaveBeenCalledWith("consent", "grant");
    expect(globalThis.window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: MARKETING_CONSENT_EVENT }),
    );
  });

  it("denies marketing consent across trackers and emits an event", () => {
    denyMarketingConsent();

    expect(globalThis.window.gtag).toHaveBeenCalledWith(
      "consent",
      "update",
      expect.objectContaining({
        analytics_storage: "denied",
        ad_storage: "denied",
      }),
    );
    expect(globalThis.window.fbq).toHaveBeenCalledWith("consent", "revoke");
    expect(globalThis.window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: MARKETING_CONSENT_EVENT }),
    );
  });
});
