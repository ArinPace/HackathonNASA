import type { FlightKit } from "./workshop";
export type SignalState = {
  panels: boolean;
  tx: boolean;
  energy: number;
  signal: number;
  t: number;
  aim: number;
  status: "active" | "ready" | "failed";
  reason: string;
};
export const signalDuration = (tier: number) => 60 - tier * 8;
export function signalScore(s: SignalState, kit: FlightKit, tier: number) {
  if (s.status !== "ready") return 0;
  return Math.min(
    100,
    Math.round(
      70 + (s.energy / kit.battery) * 25 + (1 - s.t / signalDuration(tier)) * 5,
    ),
  );
}
export function newSignal(kit: FlightKit, tier: number): SignalState {
  return {
    panels: false,
    tx: false,
    energy: kit.battery * (tier === 2 ? 0.2 : 0.55),
    signal: 0,
    t: 0,
    aim: 0,
    status: "active",
    reason: "",
  };
}
export function signalEnvironment(s: SignalState, tier: number) {
  return {
    target: tier === 2 ? Math.sin(s.t * 0.32) * 7 : 5,
    aligned:
      tier === 0 ||
      Math.abs(s.aim - (tier === 2 ? Math.sin(s.t * 0.32) * 7 : 5)) < 3,
    dark: tier === 2 && s.t % 18 > 11,
  };
}
export function signalStep(
  s: SignalState,
  kit: FlightKit,
  tier: number,
  seconds: number,
) {
  for (let left = Math.min(seconds, 5); left > 1e-8 && s.status === "active";) {
    const dt = Math.min(0.05, left);
    left -= dt;
    const e = signalEnvironment(s, tier);
    const generation = s.panels && !e.dark ? kit.solar : 0,
      demand = 8 + (s.tx ? kit.radioW : 0);
    s.energy = Math.min(
      kit.battery,
      Math.max(0, s.energy + ((generation - demand) * dt) / 3600),
    );
    s.t += dt;
    if (s.energy <= 1e-9) {
      s.status = "failed";
      s.reason =
        s.tx && !s.panels
          ? "The radio exhausted the battery before the solar wings were opened. Deploy power first, or choose a larger battery."
          : e.dark
            ? "The battery ran flat in shadow. Store more energy or pause the radio through darkness."
            : "The battery ran flat. Compare solar output with computer + radio demand, and avoid transmitting off-target.";
      break;
    }
    if (s.tx && e.aligned)
      s.signal = Math.min(2 + tier * 2, s.signal + kit.radio * dt);
    if (s.signal >= 2 + tier * 2 && s.panels) {
      s.status = "ready";
      s.tx = false;
      break;
    }
    if (s.t >= signalDuration(tier)) {
      s.status = "failed";
      s.reason = `The ${signalDuration(tier)}-second contact window closed before the message was returned. Align the antenna and transmit while you still have power.`;
    }
  }
  return s;
}
