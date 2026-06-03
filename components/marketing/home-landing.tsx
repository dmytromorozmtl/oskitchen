"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

const FEATURES = [
  {
    icon: "📋",
    title: "Orders",
    body: "Not a single order gets lost. All channels flow into one feed.",
  },
  {
    icon: "🔪",
    title: "Kitchen",
    body: "Chefs see every ticket instantly. Priority routing built in.",
  },
  {
    icon: "🛵",
    title: "Delivery",
    body: "Storefront and WooCommerce today — Uber Eats / DoorDash partner-gated, not live today.",
  },
  {
    icon: "👥",
    title: "Staff",
    body: "Scheduling, time tracking, shift notes — all in one place.",
  },
  {
    icon: "📊",
    title: "Analytics",
    body: "Data that helps you decide. Live, not in Excel.",
  },
  {
    icon: "🔌",
    title: "Integrations",
    body: "Connect your existing tools. No rip-and-replace.",
  },
] as const;

const STEPS = [
  { n: "1", title: "Create Account", body: "Sign up free. No credit card." },
  { n: "2", title: "Connect Channels", body: "Link POS, delivery apps, website." },
  { n: "3", title: "Invite Team", body: "Role-based access. Instant onboarding." },
  { n: "4", title: "Go Live", body: "Start taking orders. Watch everything flow." },
] as const;

const FAQS = [
  {
    q: "Do I need to buy hardware?",
    a: "No. Any device with a browser works.",
  },
  {
    q: "How long does setup take?",
    a: "15 minutes. No IT team needed.",
  },
  {
    q: "Which delivery apps integrate?",
    a: "WooCommerce and Shopify connect today. Uber Eats and DoorDash are partner-gated on our roadmap — not sold as live integrations yet.",
  },
  {
    q: "Can I use my existing POS?",
    a: "Yes. We connect to most systems or use ours.",
  },
  {
    q: "Is there a contract?",
    a: "No. Month-to-month. Cancel anytime.",
  },
  {
    q: "What support do you offer?",
    a: "Email (4h response), Chat (Pro), Dedicated (Enterprise).",
  },
] as const;

const TESTIMONIALS = [
  {
    quote:
      "We stopped firefighting lost tickets. One screen replaced three tablets and a printer stack. Setup took one lunch rush.",
    name: "Maria Chen",
    role: "Owner",
    venue: "Northside Kitchen",
    initials: "MC",
  },
  {
    quote:
      "Delivery apps used to mean chaos. Now every order lands in the same feed. My team finally has clarity during peak hours.",
    name: "James Okonkwo",
    role: "Operations Lead",
    venue: "Urban Prep Co.",
    initials: "JO",
  },
  {
    quote:
      "I was skeptical about another system. Fifteen minutes in, menus were live and the kitchen display just worked. No extra hardware.",
    name: "Elena Vasquez",
    role: "General Manager",
    venue: "La Mesa Group",
    initials: "EV",
  },
] as const;

const BRANDS = ["Urban Eats", "PrepLab", "Northside", "GhostLine", "Table & Co", "FreshRoute", "Metro Bowl", "Shift Kitchen"];

export function HomeLanding({ afterHero }: { afterHero?: ReactNode }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <main>
        {/* HERO */}
        <section className="dark-section section" style={{ paddingTop: "var(--space-20)" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <h1
              className="reveal visible"
              style={{
                color: "var(--color-text-inverse)",
                maxWidth: "14ch",
                margin: "0 auto",
                animation: "fadeInUp 0.8s ease forwards",
              }}
            >
              Your Restaurant. One Screen.
            </h1>
            <p
              className="reveal visible"
              style={{
                maxWidth: "640px",
                margin: "var(--space-6) auto 0",
                fontSize: "var(--text-lg)",
                animation: "fadeInUp 0.8s ease 0.1s forwards",
              }}
            >
              OS Kitchen replaces the chaos of tablets, printers, and spreadsheets with a single
              operating system. No extra hardware. No complexity. Just control.
            </p>
            <div
              className="reveal visible"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                justifyContent: "center",
                marginTop: "var(--space-10)",
              }}
            >
              <Link href="/signup" className="btn btn-primary btn-lg">
                Start Free — 14 Days, No Card
              </Link>
              <Link href="/demo" className="btn btn-secondary btn-lg">
                Watch Demo
              </Link>
            </div>

            <div
              className="reveal"
              style={{
                marginTop: "var(--space-16)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--dark-border)",
                background: "var(--dark-surface)",
                padding: "var(--space-12)",
                minHeight: "280px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p style={{ color: "var(--dark-text-muted)", fontSize: "var(--text-sm)" }}>
                Dashboard preview — orders, kitchen, and delivery in one view
              </p>
            </div>

            <div
              className="grid-3 reveal"
              style={{
                marginTop: "var(--space-12)",
                maxWidth: "900px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              {[
                { stat: "1,200+", label: "Venues" },
                { stat: "94%", label: "Fewer Lost Orders" },
                { stat: "15 Min", label: "Setup" },
              ].map((s) => (
                <div key={s.label}>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-3xl)",
                      fontWeight: 800,
                      color: "var(--color-text-inverse)",
                    }}
                  >
                    {s.stat}
                  </p>
                  <p style={{ marginTop: "0.25rem", fontSize: "var(--text-sm)" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {afterHero}

        {/* SOCIAL PROOF */}
        <section className="section" style={{ paddingTop: "var(--space-12)", paddingBottom: "var(--space-12)" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              Trusted by restaurants, ghost kitchens, and chains worldwide
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "2rem",
                justifyContent: "center",
                marginTop: "var(--space-8)",
              }}
            >
              {BRANDS.map((b) => (
                <span
                  key={b}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    color: "var(--color-text-muted)",
                    opacity: 0.55,
                    fontSize: "var(--text-sm)",
                  }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* PROBLEM / SOLUTION */}
        <section className="section">
          <div className="container">
            <div className="section-header reveal">
              <h2>Stop Juggling. Start Running.</h2>
            </div>
            <div className="grid-2">
              <div
                className="card reveal"
                style={{ borderColor: "rgba(239, 68, 68, 0.25)", background: "rgba(254, 242, 242, 0.5)" }}
              >
                <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-4)" }}>
                  Before OS Kitchen
                </h3>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {[
                    "Orders lost between tablets and printers",
                    "Staff juggling spreadsheets and chat threads",
                    "No real-time view during the rush",
                    "Delivery apps in separate silos",
                  ].map((t) => (
                    <li key={t} style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
                      ✕ {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="card reveal"
                style={{ borderColor: "rgba(34, 197, 94, 0.25)", background: "rgba(240, 253, 244, 0.6)" }}
              >
                <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-4)" }}>
                  With OS Kitchen
                </h3>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {[
                    "One feed for every channel",
                    "Kitchen sees tickets in real time",
                    "Clarity for managers in minutes",
                    "Control without extra hardware",
                  ].map((t) => (
                    <li key={t} style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
                      ✓ {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="section">
          <div className="container">
            <div className="section-header reveal">
              <span className="section-label">Platform</span>
              <h2>Everything Your Venue Needs</h2>
            </div>
            <div className="grid-3">
              {FEATURES.map((f) => (
                <article
                  key={f.title}
                  className="card reveal"
                  style={{ transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 30px var(--color-accent-glow)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "";
                  }}
                >
                  <span style={{ fontSize: "1.75rem" }} aria-hidden>
                    {f.icon}
                  </span>
                  <h3 style={{ marginTop: "var(--space-4)", fontSize: "var(--text-xl)" }}>{f.title}</h3>
                  <p style={{ marginTop: "var(--space-2)", fontSize: "var(--text-sm)" }}>{f.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section" style={{ background: "var(--color-bg-secondary)" }}>
          <div className="container">
            <div className="section-header reveal">
              <span className="section-label">Onboarding</span>
              <h2>Live in 15 Minutes</h2>
            </div>
            <div className="grid-4">
              {STEPS.map((s) => (
                <div key={s.n} className="reveal" style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "var(--color-accent-light)",
                      color: "var(--color-accent)",
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                    }}
                  >
                    {s.n}
                  </div>
                  <h4 style={{ marginTop: "var(--space-4)" }}>{s.title}</h4>
                  <p style={{ marginTop: "var(--space-2)", fontSize: "var(--text-sm)" }}>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="section" style={{ background: "var(--color-bg-secondary)" }}>
          <div className="container">
            <div className="section-header reveal">
              <span className="section-label">Pricing</span>
              <h2>Plans That Scale With You</h2>
            </div>
            <div className="grid-3">
              {[
                {
                  name: "Starter",
                  price: "$79",
                  features: ["5 staff seats", "Orders & kitchen display", "Basic analytics"],
                  cta: "Start Free Trial",
                  featured: false,
                },
                {
                  name: "Pro",
                  price: "$199",
                  features: ["Unlimited staff", "All channels", "Full analytics & API"],
                  cta: "Start Free Trial",
                  featured: true,
                },
                {
                  name: "Enterprise",
                  price: "Custom",
                  features: ["Multi-venue", "SSO & SLA", "Dedicated support"],
                  cta: "Talk to Sales",
                  featured: false,
                  href: "/contact",
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className="card reveal"
                  style={{
                    position: "relative",
                    borderColor: plan.featured ? "var(--color-accent)" : undefined,
                    boxShadow: plan.featured ? "var(--shadow-lg)" : undefined,
                  }}
                >
                  {plan.featured ? (
                    <span
                      style={{
                        position: "absolute",
                        top: "-12px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "var(--color-accent)",
                        color: "#fff",
                        fontSize: "var(--text-xs)",
                        fontWeight: 600,
                        padding: "0.25rem 0.75rem",
                        borderRadius: "999px",
                      }}
                    >
                      Most Popular
                    </span>
                  ) : null}
                  <h3 style={{ fontSize: "var(--text-xl)" }}>{plan.name}</h3>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-4xl)",
                      fontWeight: 800,
                      marginTop: "var(--space-4)",
                      color: "var(--color-text)",
                    }}
                  >
                    {plan.price}
                    {plan.price.startsWith("$") ? (
                      <span style={{ fontSize: "var(--text-sm)", fontWeight: 400 }}>/mo</span>
                    ) : null}
                  </p>
                  <ul style={{ marginTop: "var(--space-6)", listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
                        ✓ {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href ?? "/signup"}
                    className={`btn ${plan.featured ? "btn-primary" : "btn-secondary"}`}
                    style={{ width: "100%", marginTop: "var(--space-8)" }}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="section">
          <div className="container">
            <div className="grid-3">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="card reveal">
                  <p style={{ color: "var(--color-accent)", letterSpacing: "0.1em" }} aria-hidden>
                    ★★★★★
                  </p>
                  <p style={{ marginTop: "var(--space-4)", fontSize: "var(--text-sm)" }}>&ldquo;{t.quote}&rdquo;</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "var(--space-6)" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: "var(--color-accent-light)",
                        color: "var(--color-accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: "var(--text-sm)",
                      }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "var(--text-sm)" }}>
                        {t.name}
                      </p>
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                        {t.role} · {t.venue}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" style={{ background: "var(--color-bg-secondary)" }}>
          <div className="container-narrow">
            <div className="section-header reveal">
              <h2>Questions</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {FAQS.map((item, i) => (
                <div
                  key={item.q}
                  className="reveal"
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    background: "#FFFFFF",
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "1.25rem 1.5rem",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      fontWeight: 600,
                      fontSize: "var(--text-base)",
                      color: "var(--color-text)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {item.q}
                    <span style={{ color: "var(--color-accent)" }}>{openFaq === i ? "−" : "+"}</span>
                  </button>
                  {openFaq === i ? (
                    <p style={{ padding: "0 1.5rem 1.25rem", fontSize: "var(--text-sm)" }}>{item.a}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="dark-section section">
          <div className="container" style={{ textAlign: "center" }}>
            <h2 style={{ color: "var(--color-text-inverse)" }}>Ready to Stop Fighting Fires?</h2>
            <p style={{ maxWidth: "480px", margin: "var(--space-4) auto 0" }}>
              Launch OS Kitchen in 15 minutes. First 14 days free.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                justifyContent: "center",
                marginTop: "var(--space-10)",
              }}
            >
              <Link href="/signup" className="btn btn-primary btn-lg">
                Start Free
              </Link>
              <Link href="/contact" className="btn btn-secondary btn-lg">
                Talk to Our Team
              </Link>
            </div>
          </div>
        </section>
    </main>
  );
}
