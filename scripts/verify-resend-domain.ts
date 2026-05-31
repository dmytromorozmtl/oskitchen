#!/usr/bin/env tsx
/**
 * Phase 7 — verify Resend API + FROM domain deliverability prerequisites.
 * Usage: RESEND_API_KEY=… RESEND_FROM_EMAIL=noreply@yourdomain.com npm run storefront:verify-resend
 */
import { Resend } from "resend";

const from = process.env.RESEND_FROM_EMAIL?.trim();
const apiKey = process.env.RESEND_API_KEY?.trim();
const probeTo = process.env.RESEND_PROBE_TO?.trim();

async function main() {
  let fail = 0;

  if (!apiKey) {
    console.error("✗ RESEND_API_KEY missing");
    fail = 1;
  } else {
    console.log("✓ RESEND_API_KEY set");
  }

  if (!from) {
    console.error("✗ RESEND_FROM_EMAIL missing");
    fail = 1;
  } else if (!from.includes("@")) {
    console.error("✗ RESEND_FROM_EMAIL invalid");
    fail = 1;
  } else {
    console.log(`✓ RESEND_FROM_EMAIL=${from}`);
  }

  if (apiKey && from) {
    const resend = new Resend(apiKey);
    try {
      const domains = await resend.domains.list();
      const domainPart = from.split("@")[1]?.toLowerCase();
      const verified = domains.data?.data?.some(
        (d) => d.name?.toLowerCase() === domainPart && d.status === "verified",
      );
      if (verified) {
        console.log(`✓ Resend domain verified: ${domainPart}`);
      } else {
        console.warn(`⚠ Domain ${domainPart} not verified in Resend (invite emails may bounce)`);
      }
    } catch (e) {
      console.warn("⚠ Could not list Resend domains:", e instanceof Error ? e.message : e);
    }

    if (probeTo) {
      const { error } = await resend.emails.send({
        from,
        to: probeTo,
        subject: "OS Kitchen storefront invite probe",
        text: "Resend probe — safe to ignore.",
      });
      if (error) {
        console.error("✗ Probe send failed:", error.message);
        fail = 1;
      } else {
        console.log(`✓ Probe email sent to ${probeTo}`);
      }
    } else {
      console.log("→ Set RESEND_PROBE_TO=you@company.com to send a live probe");
    }
  }

  process.exit(fail);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
