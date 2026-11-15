/** Deliberately compressed training exercises, not orbit determination or rover engineering. */
import { assignments, type World, type Result } from "./model";
import type { FlightKit } from "./workshop";
export type Status = "active" | "ready" | "failed";
export function missionRating(
  results: Pick<Result, "score" | "success" | "assisted">[],
) {
  if (!results.length || results.some((r) => !r.success)) return 0;
  return Math.min(
    results.some((r) => r.assisted) ? 79 : 100,
    Math.round(results.reduce((n, r) => n + r.score, 0) / results.length),
  );
}
export type FlightPhase =
  "commission" | "navigation" | "play" | "surface" | "explore";
export function missionStages(
  index: number,
): { id: FlightPhase; label: string }[] {
  const a = assignments[index];
  return [
    { id: "commission", label: "Payload release" },
    ...(a.chapter > 0
      ? [{ id: "navigation" as const, label: "Insertion burn" }]
      : []),
    {
      id: "play",
      label:
        a.kind === "dock"
          ? "Dock module"
          : a.kind === "land"
            ? "Powered descent"
            : a.kind === "signal"
              ? "First contact"
              : "Orbital science",
    },
    ...(a.kind === "mars"
      ? [{ id: "surface" as const, label: "Powered descent" }]
      : []),
    ...(a.kind === "mars" || a.kind === "land"
      ? [{ id: "explore" as const, label: "Rover expedition" }]
      : []),
  ];
}
export const wrap = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;
export type Deployment = {
  t: number;
  started: boolean;
  angle: number;
  rate: number;
  torque: number;
  propellant: number;
  fairing: boolean;
  released: boolean;
  status: Status;
  reason: string;
};
export function newDeployment(tier: number, kit: FlightKit): Deployment {
  return {
    t: 0,
    started: false,
    angle: -25 - tier * 8,
    rate: 6 + tier * 2,
    torque: 0,
    propellant: 100 * kit.fuelScale,
    fairing: true,
    released: false,
    status: "active",
    reason: "",
  };
}
export function deploymentAligned(s: Deployment, tier: number) {
  return (
    Math.abs(s.rate) <= 1.5 - tier * 0.3 && Math.abs(s.angle) <= 12 - tier * 2
  );
}
export function releasePayload(s: Deployment, tier: number) {
  if (!s.started || s.status !== "active") return;
  if (s.fairing || !deploymentAligned(s, tier)) {
    s.status = "failed";
    s.reason = s.fairing
      ? "The payload struck the closed fairing. Jettison the protective shell before release."
      : "The payload was released while spinning or misaligned. Use opposite torque to brake, then release inside the green attitude zone.";
  } else {
    s.released = true;
    s.status = "ready";
    s.torque = 0;
  }
}
export function deploymentStep(s: Deployment, tier: number, seconds: number) {
  if (!s.started || s.status !== "active" || !Number.isFinite(seconds)) return;
  for (let left = Math.min(seconds, 1); left > 1e-8 && s.status === "active";) {
    const dt = Math.min(0.02, left);
    left -= dt;
    s.t += dt;
    const torque = s.propellant > 0 ? Math.max(-1, Math.min(1, s.torque)) : 0;
    s.rate += torque * (3.6 - tier * 0.3) * dt;
    s.angle = wrap(s.angle + s.rate * dt);
    s.propellant = Math.max(0, s.propellant - Math.abs(torque) * 4 * dt);
    if (
      s.t >= 75 - tier * 10 ||
      (s.propellant <= 0 && !deploymentAligned(s, tier))
    ) {
      s.status = "failed";
      s.reason =
        "Commissioning missed its control window. Neutral torque does not stop a spin: push the opposite way to brake. Release only when angle and spin rate are green.";
    }
  }
}
export type Navigation = {
  t: number;
  started: boolean;
  heading: number;
  throttle: number;
  burning: boolean;
  dv: number;
  fuel: number;
  status: Status;
  reason: string;
};
export function navigationSpec(world: World, tier: number, kit: FlightKit) {
  const required = world === "earth" ? 1600 : world === "moon" ? 700 : 1100;
  return {
    required,
    capacity: required * 1.65 * kit.fuelScale,
    rate: world === "earth" ? 140 : world === "moon" ? 70 : 105,
    opens: 8,
    closes: 32 - tier * 3,
    tolerance: 0.05 - tier * 0.01,
    altitude: world === "earth" ? 400 : world === "moon" ? 150 : 250,
  };
}
export function newNavigation(
  world: World,
  tier: number,
  kit: FlightKit,
): Navigation {
  return {
    t: 0,
    started: false,
    heading: 0,
    throttle: 0.85,
    burning: false,
    dv: 0,
    fuel: navigationSpec(world, tier, kit).capacity,
    status: "active",
    reason: "",
  };
}
export function navigationAligned(
  s: Navigation,
  world: World,
  tier: number,
  kit: FlightKit,
) {
  const p = navigationSpec(world, tier, kit);
  return Math.abs(s.dv / p.required - 1) <= p.tolerance && !s.burning;
}
export function navigationStep(
  s: Navigation,
  world: World,
  tier: number,
  kit: FlightKit,
  seconds: number,
) {
  if (!s.started || s.status !== "active" || !Number.isFinite(seconds)) return;
  const p = navigationSpec(world, tier, kit);
  for (let left = Math.min(seconds, 1); left > 1e-8 && s.status === "active";) {
    const dt = Math.min(0.02, left);
    left -= dt;
    s.t += dt;
    if (s.burning) {
      const spent = Math.min(
        s.fuel,
        p.rate * Math.max(0, Math.min(1, s.throttle)) * dt,
      );
      s.fuel -= spent;
      const inWindow = s.t >= p.opens && s.t <= p.closes;
      s.dv +=
        spent *
        Math.cos((wrap(s.heading - 90) * Math.PI) / 180) *
        (inWindow ? 1 : 0.08);
    }
    if (navigationAligned(s, world, tier, kit)) s.status = "ready";
    else if (s.t > p.closes || s.dv > p.required * 1.35 || s.fuel <= 1e-8) {
      s.status = "failed";
      s.reason =
        s.dv > p.required * 1.35
          ? "The burn overshot the orbit contract. Cut thrust in the green band; a smaller throttle gives finer control."
          : s.fuel <= 1e-8
            ? "Insertion propellant exhausted. Point toward 90° prograde and burn inside the timing window. Off-axis or early burns waste your reserve."
            : "The insertion window closed before the orbit was secured. Align before arrival, ignite in the window, and cut thrust at the target.";
    }
  }
}
export const fieldSites = [
  { x: 170, y: 125, name: "Ridge basalt" },
  { x: 300, y: 305, name: "Crater sediment" },
  { x: 440, y: 105, name: "Bright outcrop" },
  { x: 495, y: 325, name: "Ancient channel" },
];
export const fieldRocks = [
  { x: 265, y: 160, r: 31 },
  { x: 380, y: 255, r: 33 },
];
export const fieldGoal = (tier: number) => 2 + tier;
export type Field = {
  t: number;
  started: boolean;
  x: number;
  y: number;
  battery: number;
  health: number;
  samples: number[];
  received: number;
  work: number;
  site: number;
  mode: "drive" | "sample" | "charge" | "send";
  status: Status;
  reason: string;
};
export function newField(): Field {
  return {
    t: 0,
    started: false,
    x: 60,
    y: 225,
    battery: 100,
    health: 100,
    samples: [],
    received: 0,
    work: 0,
    site: -1,
    mode: "drive",
    status: "active",
    reason: "",
  };
}
export const atLander = (s: Field) => Math.hypot(s.x - 60, s.y - 225) < 48;
export const nearbySite = (s: Field) =>
  fieldSites.findIndex((p) => Math.hypot(s.x - p.x, s.y - p.y) < 24);
export function beginSampling(s: Field) {
  const site = nearbySite(s);
  if (
    s.status !== "active" ||
    !s.started ||
    site < 0 ||
    s.samples.includes(site)
  )
    return false;
  s.site = site;
  s.work = 0;
  s.mode = "sample";
  return true;
}
export function fieldStep(
  s: Field,
  tier: number,
  kit: FlightKit,
  seconds: number,
  input: { x: number; y: number },
) {
  if (!s.started || s.status !== "active" || !Number.isFinite(seconds)) return;
  for (let left = Math.min(seconds, 1); left > 1e-8 && s.status === "active";) {
    const dt = Math.min(0.02, left);
    left -= dt;
    s.t += dt;
    const norm = Math.max(1, Math.hypot(input.x, input.y)),
      moving = input.x !== 0 || input.y !== 0;
    if (moving) {
      s.mode = "drive";
      s.work = 0;
      s.x = Math.max(20, Math.min(580, s.x + (input.x / norm) * 36 * dt));
      s.y = Math.max(35, Math.min(385, s.y + (input.y / norm) * 36 * dt));
    }
    const shadow = s.x > 350 && s.y < 190;
    const drain = moving
      ? 1.05
      : s.mode === "sample"
        ? 2.2
        : s.mode === "send"
          ? 1.4
          : 0.12;
    s.battery = Math.max(
      0,
      Math.min(
        100,
        s.battery +
          ((s.mode === "charge" && !shadow ? kit.solar / 15 : 0) - drain) *
            (120 / kit.battery) *
            dt,
      ),
    );
    if (
      moving &&
      fieldRocks.some((p) => Math.hypot(s.x - p.x, s.y - p.y) < p.r)
    )
      s.health = Math.max(0, s.health - 15 * dt);
    if (
      s.mode === "sample" &&
      nearbySite(s) === s.site &&
      !s.samples.includes(s.site)
    ) {
      s.work += dt;
      if (s.work >= 3 + tier * 0.5) {
        s.samples.push(s.site);
        s.mode = "drive";
        s.work = 0;
      }
    }
    if (s.mode === "send" && atLander(s))
      s.received = Math.min(s.samples.length, s.received + dt * kit.radio * 2);
    if (s.received >= fieldGoal(tier) && atLander(s)) s.status = "ready";
    else if (s.battery <= 0 || s.health <= 0 || s.t > 150 - tier * 20) {
      s.status = "failed";
      s.reason =
        s.battery <= 0
          ? "The rover exhausted its battery away from a successful downlink. Stop in sunlight to recharge before driving farther."
          : s.health <= 0
            ? "The rover was damaged in rocky terrain. Steer around the marked boulder fields."
            : "The surface window closed. Collect unique samples, return to the lander, then send the evidence before time runs out.";
    }
  }
}
