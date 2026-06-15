function playTone(frequency: number, durationSec: number, gainValue: number) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    gain.gain.value = gainValue;
    osc.start();
    osc.stop(ctx.currentTime + durationSec);
    void ctx.close();
  } catch {
    /* autoplay may be blocked */
  }
}

/** Short chime when a new order lands on the KDS queue. */
export function playKdsNewOrderChime() {
  playTone(880, 0.15, 0.08);
}

/** Soft ping when Realtime reconnects and KDS goes LIVE. */
export function playKdsLiveConnectChime() {
  playTone(660, 0.1, 0.06);
  setTimeout(() => playTone(880, 0.12, 0.06), 120);
}

/** Triple ascending alert when rush mode enters peak. */
export function playKdsRushModeAlert() {
  playTone(523, 0.12, 0.1);
  setTimeout(() => playTone(659, 0.12, 0.1), 140);
  setTimeout(() => playTone(784, 0.18, 0.12), 280);
}

/** Two-tone alert when a ticket crosses the overdue threshold. */
export function playKdsOverdueAlert() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 440;
    gain.gain.value = 0.12;
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 330;
      gain2.gain.value = 0.12;
      osc2.start();
      osc2.stop(ctx.currentTime + 0.35);
      void ctx.close();
    }, 400);
  } catch {
    /* ignore */
  }
}
