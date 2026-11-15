/** SI-assisted educational launch model. SI units; compressed game time.
 * Two point-mass stages, vertical gravity, simple drag and pitch control.
 * Reaching 100km is NOT orbit: the contracted service handles insertion/transfer.
 */
export type RocketConfig = {
  firstFuel: number;
  upperFuel: number;
  firstThrust: number;
  upperThrust: number;
  firstDry: number;
  upperDry: number;
};
export const stockRocket: RocketConfig = {
  firstFuel: 300000,
  upperFuel: 90000,
  firstThrust: 8e6,
  upperThrust: 1.3e6,
  firstDry: 30000,
  upperDry: 10000,
};
export type LaunchState = {
  config: RocketConfig;
  time: number;
  altitude: number;
  velocity: number;
  fuel: [number, number];
  stage: 1 | 2;
  pitch: number;
  throttle: number;
  burn2: number;
  maxAltitude: number;
  status: "ready" | "countdown" | "flying" | "handoff" | "failed";
  countdown: number;
  assist: boolean;
  stagedAt: number | null;
};
export function newLaunch(config: Partial<RocketConfig> = {}): LaunchState {
  const cfg = { ...stockRocket, ...config };
  return {
    config: cfg,
    time: 0,
    altitude: 0,
    velocity: 0,
    fuel: [cfg.firstFuel, cfg.upperFuel],
    stage: 1,
    pitch: 0,
    throttle: 0.86,
    burn2: 0,
    maxAltitude: 0,
    status: "ready",
    countdown: 4,
    assist: true,
    stagedAt: null,
  };
}
export function separate(s: LaunchState) {
  if (
    s.status !== "flying" ||
    s.stage !== 1 ||
    s.fuel[0] > s.config.firstFuel * 0.05
  )
    return false;
  s.stage = 2;
  s.stagedAt = s.time;
  return true;
}
export function launchStep(s: LaunchState, realDt: number, payloadKg: number) {
  if (!Number.isFinite(realDt) || realDt <= 0) return s;
  if (s.status === "countdown") {
    s.countdown = Math.max(0, s.countdown - realDt);
    if (s.countdown === 0) s.status = "flying";
    return s;
  }
  if (s.status !== "flying") return s;
  // Flight assistance holds at separation, giving a beginner time to act.
  if (s.assist && s.stage === 1 && s.fuel[0] <= 0) return s;
  for (
    let left = Math.min(realDt, 0.25) * 4;
    left > 1e-8 && s.status === "flying";
  ) {
    const dt = Math.min(0.04, left);
    left -= dt;
    s.time += dt;
    if (s.assist) {
      s.pitch +=
        (Math.min(15, s.altitude / 8000) - s.pitch) * Math.min(1, dt * 2);
      s.throttle = 0.86;
    }
    const idx = s.stage - 1,
      thrust = s.stage === 1 ? s.config.firstThrust : s.config.upperThrust,
      flow = s.stage === 1 ? 3600 * (thrust / 8e6) : 360 * (thrust / 1.3e6);
    const burn = Math.min(s.fuel[idx], flow * s.throttle * dt);
    s.fuel[idx] -= burn;
    const firing = burn / (flow * dt);
    const mass =
      payloadKg +
      s.config.upperDry +
      s.fuel[1] +
      (s.stage === 1 ? s.config.firstDry + s.fuel[0] : 0);
    const gravity = 9.80665 * (6371000 / (6371000 + s.altitude)) ** 2;
    const density = Math.exp(-s.altitude / 8500);
    const drag =
      (0.5 * 1.225 * density * 12 * s.velocity * Math.abs(s.velocity)) / mass;
    const acceleration =
      (thrust * firing * Math.cos((s.pitch * Math.PI) / 180)) / mass -
      gravity -
      drag;
    s.velocity += acceleration * dt;
    s.altitude += s.velocity * dt;
    if (s.stage === 2 && burn > 0) s.burn2 += dt;
    if (s.altitude < 0) {
      s.altitude = 0;
      if (s.maxAltitude > 50) {
        s.status = "failed";
        break;
      }
      s.velocity = 0;
    }
    s.maxAltitude = Math.max(s.maxAltitude, s.altitude);
    if (s.altitude >= 100000 && s.stage === 2 && s.burn2 >= 8 && s.velocity > 0)
      s.status = "handoff";
    if (s.fuel[1] <= 0 && s.velocity <= 0) s.status = "failed";
  }
  return s;
}
