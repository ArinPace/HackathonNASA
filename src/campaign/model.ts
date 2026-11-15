/** SI-assisted career mode. Local progress, fictional mission specs.
 * Source physical constants: JPL astro_par.html and planets/phys_par.html.
 * Analytic circular paths; local docking/descent models are training approximations.
 */
export type World = "earth" | "moon" | "mars";
export const bodies = {
  earth: {
    name: "Earth",
    radius: 6371008.4,
    mu: 3.98600435507e14,
    gravity: 9.8,
    color: "#3989a4",
  },
  moon: {
    name: "Moon",
    radius: 1737400,
    mu: 4.902800118e12,
    gravity: 1.62,
    color: "#9ca7a5",
  },
  mars: {
    name: "Mars",
    radius: 3389500,
    mu: 4.2828375816e13,
    gravity: 3.71,
    color: "#cc7953",
  },
};
export const missions = [
  {
    id: "signal",
    title: "First Signal",
    world: "earth" as World,
    kind: "signal",
    xp: 100,
    badge: "Satellite Operator",
    emoji: "🛰",
    lesson: "Deploy a satellite and make first contact.",
    newSkill: "Solar panels & radio",
    goals: ["Deploy the solar wings", "Send a complete test signal to Earth"],
    story:
      "Your very first satellite is ready. Unfold its solar panels, then let Earth know it survived the ride.",
  },
  {
    id: "orbit",
    title: "Day & Night",
    world: "earth" as World,
    kind: "orbit",
    xp: 160,
    badge: "Orbital Pilot",
    emoji: "🌍",
    lesson: "Keep an Earth-observing satellite working through darkness.",
    newSkill: "Observation, eclipses & battery",
    goals: [
      "Return photos from 2 different areas",
      "Survive 180 simulated seconds of eclipse",
      "Finish with at least 10% battery",
    ],
    story:
      "The satellite now has a camera. Earth blocks the Sun on part of every lap. Collect photographs and bring them home without running the battery flat.",
  },
  {
    id: "station",
    title: "A Place in Space",
    world: "earth" as World,
    kind: "dock",
    xp: 220,
    badge: "Docking Specialist",
    emoji: "🧩",
    lesson: "Deliver the first module to a small space station.",
    newSkill: "Relative motion & docking",
    goals: [
      "Line up with the station’s docking port",
      "Approach slower than 0.8 m/s",
      "Dock without exhausting maneuvering fuel",
    ],
    story:
      "Your station is missing its science module. Bring it in gently: in space, a short engine burst keeps changing where you go even after you release the controls.",
  },
  {
    id: "lunar-orbit",
    title: "Beyond Earth",
    world: "moon" as World,
    kind: "orbit",
    xp: 300,
    badge: "Lunar Pathfinder",
    emoji: "🌕",
    lesson: "Coordinate a complete mission around the Moon.",
    newSkill: "Payload trade-offs & finite storage",
    goals: [
      "Return observations from 3 survey areas",
      "Manage the recorder and Earth contact",
      "Finish with at least 10% battery",
    ],
    story:
      "You are ready to leave home. Explore the lunar polar region and send useful evidence back. Extra pictures are useless if they stay trapped on the spacecraft.",
  },
  {
    id: "landing",
    title: "One Small Landing",
    world: "moon" as World,
    kind: "land",
    xp: 400,
    badge: "Soft Touch",
    emoji: "🚀",
    lesson: "Bring a lander down without breaking it.",
    newSkill: "Gravity, braking & landing accuracy",
    goals: [
      "Touch down inside the marked landing zone",
      "Vertical speed below 3 m/s",
      "Keep sideways speed below 2 m/s",
    ],
    story:
      "There is no runway and no air to slow you down. Use the engine to brake your fall, steer over the pad, and keep enough fuel for the final few meters.",
  },
  {
    id: "mars",
    title: "The Red Frontier",
    world: "mars" as World,
    kind: "mars",
    xp: 600,
    badge: "Interplanetary Commander",
    emoji: "🔴",
    lesson: "Survey Mars, then complete a harder powered landing.",
    newSkill: "Weaker sunlight, slower radio & stronger gravity",
    goals: [
      "Return observations from 4 Martian areas",
      "Preserve power with weaker solar generation",
      "Then land safely with higher gravity",
    ],
    story:
      "Everything you learned comes together. Your panels get less sunlight, your radio returns data more slowly, and the landing engine has to fight more gravity than on the Moon.",
  },
] as const;
export const assignmentNames = [
  ["First Contact", "Relay Duty", "Low-Battery Rescue"],
  ["First Lap", "Night Shift", "Precision Survey"],
  ["Lab Delivery", "Narrow Approach", "Precision Assembly"],
  ["Polar Scout", "Mapping Run", "Data Crunch"],
  ["First Touchdown", "Crater Target", "Fuel-Tight Landing"],
  ["Red Recon", "Long Night", "Expedition Finale"],
];
export const assignments = missions.flatMap((chapter, c) =>
  assignmentNames[c].map((title, tier) => ({
    ...chapter,
    id: `${chapter.id}-${tier}`,
    chapter: c,
    tier,
    title,
    chapterTitle: chapter.title,
    xp: Math.round((chapter.xp * (tier + 1)) / 3),
  })),
);
export type Progress = {
  version: 1;
  best: Record<string, number>;
  launchCertified: boolean;
};
export function parseProgress(text: string | null): Progress {
  try {
    const x = JSON.parse(text || "null");
    if (x?.version !== 1) throw Error();
    const best: Record<string, number> = {};
    for (const m of assignments) {
      const score = x.best?.[m.id];
      if (Number.isInteger(score) && score >= 0 && score <= 100)
        best[m.id] = score;
    }
    return { version: 1, best, launchCertified: x.launchCertified === true };
  } catch {
    return { version: 1, best: {}, launchCertified: false };
  }
}
export const stars = (score: number) => (score >= 90 ? 3 : score >= 75 ? 2 : 1);
export function unlocked(p: Progress, index: number) {
  if (!Number.isInteger(index) || index < 0 || index >= assignments.length)
    return false;
  return (
    index === 0 ||
    (index > 0 &&
      index < assignments.length &&
      p.best[assignments[index - 1].id] !== undefined)
  );
}
export function xp(p: Progress) {
  return assignments.reduce(
    (n, m) =>
      n +
      (p.best[m.id] === undefined ? 0 : m.xp + 20 * (stars(p.best[m.id]) - 1)),
    0,
  );
}
export function award(p: Progress, index: number, score: number): Progress {
  if (
    !unlocked(p, index) ||
    !Number.isFinite(score) ||
    score < 0 ||
    score > 100
  )
    return p;
  const id = assignments[index].id;
  return {
    ...p,
    best: { ...p.best, [id]: Math.max(p.best[id] ?? 0, Math.round(score)) },
  };
}
export function rank(points: number) {
  return points >= 3500
    ? "Interplanetary Commander"
    : points >= 2200
      ? "Lunar Pathfinder"
      : points >= 1100
        ? "Mission Commander"
        : points >= 450
          ? "Orbital Pilot"
          : points >= 60
            ? "Satellite Operator"
            : "Flight Cadet";
}
export type Result = {
  success: boolean;
  score: number;
  reason: string;
  stats: { label: string; value: string }[];
};
export type ControlMode = "observe" | "transmit" | "charge";
export type OrbitState = {
  t: number;
  mode: ControlMode;
  energy: number;
  queue: { cell: number; remaining: number }[];
  seen: number[];
  delivered: number[];
  exposure: number;
  exposureCell: number;
  generated: number;
  sent: number;
  eclipseTime: number;
  ended: boolean;
  reason: string;
};
export const loads = [
  {
    name: "Surveyor",
    battery: 80,
    solar: 90,
    radio: 0.35,
    size: 10,
    load: 38,
    storage: 80,
    quality: 1,
  },
  {
    name: "Detail hunter",
    battery: 65,
    solar: 90,
    radio: 0.18,
    size: 24,
    load: 54,
    storage: 64,
    quality: 1.3,
  },
  {
    name: "Long-haul",
    battery: 120,
    solar: 110,
    radio: 0.55,
    size: 14,
    load: 42,
    storage: 160,
    quality: 1.1,
  },
];
export function orbitPeriod(world: World) {
  const b = bodies[world],
    alt = world === "earth" ? 400000 : 150000;
  return 2 * Math.PI * Math.sqrt((b.radius + alt) ** 3 / b.mu);
}
export function orbitEnvironment(s: OrbitState, world: World) {
  const a =
    (s.t / orbitPeriod(world)) * 2 * Math.PI +
    (world === "earth" ? 0.45 : 4.15);
  const phase = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return {
    angle: a,
    eclipse: phase > Math.PI * 0.7 && phase < Math.PI * 1.3,
    contact: Math.cos(a) > -0.25,
    target: world === "earth" ? Math.sin(a) > 0.35 : Math.sin(a) < -0.7,
    cell: Math.floor((phase / (Math.PI * 2)) * 24),
  };
}
export function newOrbit(load = 0): OrbitState {
  return {
    t: 0,
    mode: "charge",
    energy: loads[load].battery * 0.7,
    queue: [],
    seen: [],
    delivered: [],
    exposure: 0,
    exposureCell: -1,
    generated: 0,
    sent: 0,
    eclipseTime: 0,
    ended: false,
    reason: "",
  };
}
export function orbitGoal(world: World, tier = 0) {
  return (world === "earth" ? 2 : world === "moon" ? 3 : 4) + tier;
}
export function orbitKit(load: number, tier = 0) {
  const l = loads[load];
  return {
    ...l,
    battery: l.battery * (1 - tier * 0.08),
    storage: l.storage * (1 - tier * 0.2),
  };
}
export function orbitStep(
  s: OrbitState,
  world: World,
  load: number,
  seconds: number,
  tier = 0,
) {
  const l = orbitKit(load, tier),
    solarScale = world === "mars" ? 0.5 - tier * 0.05 : 1,
    radioScale = world === "mars" ? 0.22 - tier * 0.04 : 1;
  for (let left = seconds; left > 1e-8 && !s.ended;) {
    const dt = Math.min(2, left);
    left -= dt;
    const e = orbitEnvironment(s, world),
      generation = e.eclipse
        ? 0
        : l.solar * solarScale * (s.mode === "charge" ? 1 : 0.35);
    const demand =
      s.mode === "observe" ? l.load : s.mode === "transmit" ? 30 : 10;
    s.energy = Math.max(
      0,
      Math.min(l.battery, s.energy + ((generation - demand) * dt) / 3600),
    );
    s.t += dt;
    if (s.energy <= 0) {
      s.ended = true;
      s.reason =
        "The battery ran flat. Charge in sunlight before the long dark section.";
      break;
    }
    if (e.eclipse) s.eclipseTime += dt;
    if (s.mode === "observe" && e.target && !s.seen.includes(e.cell)) {
      if (s.exposureCell !== e.cell) {
        s.exposureCell = e.cell;
        s.exposure = 0;
      }
      s.exposure += dt;
      if (
        s.exposure >= 35 &&
        s.queue.reduce((n, p) => n + p.remaining, 0) + l.size <= l.storage
      ) {
        s.queue.push({ cell: e.cell, remaining: l.size });
        s.generated += l.size;
        s.seen.push(e.cell);
        s.exposure = 0;
      }
    }
    if (s.mode === "transmit" && e.contact) {
      let amount = l.radio * radioScale * dt;
      while (amount > 1e-9 && s.queue.length) {
        const p = s.queue[0],
          sent = Math.min(amount, p.remaining);
        p.remaining -= sent;
        s.sent += sent;
        amount -= sent;
        if (p.remaining < 1e-8) {
          if (!s.delivered.includes(p.cell)) s.delivered.push(p.cell);
          s.queue.shift();
        }
      }
    }
    if (
      s.t >
      orbitPeriod(world) * (world === "mars" ? 3 - tier * 0.2 : 2 - tier * 0.15)
    ) {
      s.ended = true;
      s.reason =
        "Mission time ran out. Collect only what you can send, and watch the next Earth-contact window.";
    }
  }
  return s;
}
export function orbitPassed(
  s: OrbitState,
  world: World,
  load: number,
  tier = 0,
) {
  return (
    s.delivered.length >= orbitGoal(world, tier) &&
    (world !== "earth" || s.eclipseTime >= 180 * (tier + 1)) &&
    (world === "earth" || (s.generated > 0 && s.sent >= s.generated * 0.85)) &&
    s.energy >= orbitKit(load, tier).battery * (0.1 + tier * 0.05)
  );
}
export type Motion = {
  t: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  fuel: number;
  throttle: number;
  status: "active" | "success" | "failed";
  impact: number;
  assist: boolean;
};
export function newMotion(
  kind: "dock" | "land",
  world: World = "moon",
  tier = 0,
): Motion {
  return {
    t: 0,
    x: kind === "dock" ? 7 + tier * 5 : -50 - tier * 12,
    y:
      kind === "dock"
        ? 90
        : world === "mars"
          ? 650 + tier * 80
          : 450 + tier * 70,
    vx: kind === "dock" ? -0.08 : 1,
    vy: kind === "dock" ? -0.45 - tier * 0.1 : -8,
    angle: kind === "dock" ? tier * 5 : 0,
    fuel:
      kind === "dock"
        ? 45 - tier * 8
        : world === "mars"
          ? 48 - tier * 5
          : 40 - tier * 5,
    throttle: kind === "dock" ? 0 : 0.3,
    status: "active",
    impact: 0,
    assist: true,
  };
}
export function motionStep(
  s: Motion,
  kind: "dock" | "land",
  world: World,
  dt: number,
  input = { x: 0, y: 0 },
  tier = 0,
) {
  if (s.status !== "active") return s;
  for (let left = Math.min(dt, 0.5); left > 1e-8 && s.status === "active";) {
    const h = Math.min(0.02, left);
    left -= h;
    s.t += h;
    if (kind === "dock") {
      let ax = input.x * 0.3,
        ay = input.y * 0.3;
      if (s.assist) {
        s.angle += (0 - s.angle) * Math.min(1, h * 2);
        ax = Math.max(-0.3, Math.min(0.3, -s.x * 0.055 - s.vx * 0.6));
        const target = -Math.min(0.8, Math.max(0.13, s.y * 0.025));
        ay = Math.max(-0.3, Math.min(0.3, (target - s.vy) * 0.6));
      }
      const usage = (Math.abs(ax) + Math.abs(ay)) * h * 0.9;
      if (s.fuel <= 0) {
        ax = ay = 0;
      }
      s.fuel = Math.max(0, s.fuel - usage);
      s.vx += ax * h;
      s.vy += ay * h;
      s.x += s.vx * h;
      s.y += s.vy * h;
      if (s.y <= 2) {
        s.impact = Math.hypot(s.vx, s.vy);
        s.status =
          Math.abs(s.x) < 2 - tier * 0.4 &&
          s.impact < 0.8 - tier * 0.15 &&
          Math.abs(s.angle) < 8 - tier * 2
            ? "success"
            : "failed";
      }
      if (Math.abs(s.x) > 50 || s.y > 180 || s.t > 230) {
        s.status = "failed";
      }
    } else {
      const gravity = bodies[world].gravity,
        maxThrust = world === "mars" ? 1200 : 600,
        mass = 85 + s.fuel;
      if (s.assist) {
        const targetV = -Math.min(
          world === "mars" ? 15 : 11,
          Math.max(0.65, s.y * 0.045),
        );
        const desiredAx = -s.x * 0.035 - s.vx * 0.55;
        s.angle = Math.max(
          -25,
          Math.min(25, (Math.atan2(desiredAx, gravity) * 180) / Math.PI),
        );
        s.throttle = Math.max(
          0,
          Math.min(
            1,
            (((targetV - s.vy) * 0.7 + gravity) * mass) /
              (maxThrust * Math.cos((s.angle * Math.PI) / 180)),
          ),
        );
      }
      const force = s.fuel > 0 ? s.throttle * maxThrust : 0;
      s.fuel = Math.max(
        0,
        s.fuel - (force / (world === "mars" ? 2800 : 2600)) * h,
      );
      const a = (s.angle * Math.PI) / 180,
        drag = world === "mars" ? 0.001 * s.vy * Math.abs(s.vy) : 0;
      s.vx += ((force * Math.sin(a)) / mass) * h;
      s.vy += ((force * Math.cos(a)) / mass - gravity - drag) * h;
      s.x += s.vx * h;
      s.y += s.vy * h;
      if (s.y <= 0) {
        s.y = 0;
        s.impact = Math.abs(s.vy);
        s.status =
          Math.abs(s.x) < 35 - tier * 10 &&
          s.impact < 3 - tier * 0.5 &&
          Math.abs(s.vx) < 2 &&
          Math.abs(s.angle) < 12
            ? "success"
            : "failed";
      }
      if (Math.abs(s.x) > 500 || s.t > 250) s.status = "failed";
    }
  }
  return s;
}
