"use client";

import { useEffect, useState } from "react";
import CookieConsent from "react-cookie-consent";

import {
  denyMarketingConsent,
  grantMarketingConsent,
  hasMarketingConsentCookie,
} from "@/lib/analytics/marketing-consent";

function isMarketingPath(pathname: string): boolean {
  return (
    !pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/platform") &&
    !pathname.startsWith("/s/") &&
    !pathname.startsWith("/auth")
  );
}

export function CookieConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(isMarketingPath(window.location.pathname));
    if (hasMarketingConsentCookie()) {
      grantMarketingConsent();
    }
  }, []);

  if (!show) return null;

  return (
    <CookieConsent
      location="bottom"
      buttonText="Accept analytics & ads"
      declineButtonText="Essential only"
      enableDeclineButton
      cookieName="kitchenos-cookie-consent"
      style={{
        background: "#1a1a2e",
        color: "#ffffff",
        fontSize: "14px",
        padding: "16px 24px",
        alignItems: "center",
      }}
      buttonStyle={{
        background: "#4f46e5",
        color: "#ffffff",
        fontSize: "13px",
        borderRadius: "6px",
        padding: "8px 20px",
        border: "none",
        fontWeight: 500,
      }}
      declineButtonStyle={{
        background: "transparent",
        color: "#a1a1aa",
        fontSize: "13px",
        borderRadius: "6px",
        padding: "8px 20px",
        border: "1px solid #a1a1aa",
        fontWeight: 400,
      }}
      expires={365}
      onAccept={grantMarketingConsent}
      onDecline={denyMarketingConsent}
    >
      <BannerText />
    </CookieConsent>
  );
}

function BannerText() {
  return (
    <div style={{ maxWidth: "800px" }}>
      We use cookies for analytics and advertising measurement (Google, Meta, LinkedIn when
      configured). Essential cookies always run.{" "}
      <a href="/legal/cookie-policy" style={{ color: "#818cf8", textDecoration: "underline" }}>
        Cookie Policy
      </a>
    </div>
  );
}
