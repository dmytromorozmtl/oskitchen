"use client";

/** Lightweight canvas confetti — no external dependency. */
export function fireCelebrationConfetti(durationMs = 2400): void {
  if (typeof document === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.cssText =
    "position:fixed;inset:0;z-index:9999;pointer-events:none;width:100%;height:100%;";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const colors = ["#FF5F1F", "#FFD166", "#06D6A0", "#118AB2", "#EF476F", "#8338EC"];
  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height * 0.4 - canvas.height * 0.2,
    r: 4 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)]!,
    vx: (Math.random() - 0.5) * 6,
    vy: 2 + Math.random() * 4,
    spin: (Math.random() - 0.5) * 0.2,
    angle: Math.random() * Math.PI,
  }));

  const started = performance.now();

  function frame(now: number) {
    const elapsed = now - started;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.angle += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
      ctx.restore();
    }
    if (elapsed < durationMs) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
    }
  }

  requestAnimationFrame(frame);
}
