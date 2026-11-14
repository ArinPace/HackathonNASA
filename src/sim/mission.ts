// SI-assisted implementation. Fictional educational spacecraft specifications.
export type Mode = "observe" | "downlink" | "charge" | "safe";
export type Design = {
  camera: "context" | "detail";
  radio: "basic" | "strong";
  solar: "small" | "large";
  battery: "small" | "large";
  storage: "small" | "large";
  orbit: "polar" | "high" | "equatorial";
  launcher: "light" | "heavy";
};
export const initialDesign: Design = {
  camera: "detail",
  radio: "basic",
  solar: "large",
  battery: "large",
  storage: "small",
  orbit: "polar",
  launcher: "light",
};
export const balancedDesign: Design = {
  ...initialDesign,
  camera: "context",
  radio: "strong",
};
export const MU = 4.902800118e12,
  RADIUS = 1737400,
  MIB = 1048576;
export const catalog = {
  camera: [
    {
      id: "context",
      name: "Context imager",
      mass: 8,
      cost: 3,
      power: 12,
      rate: 0.2,
      description:
        "Wide coverage. A compact stream that is easier to bring home.",
    },
    {
      id: "detail",
      name: "High-detail imager",
      mass: 12,
      cost: 6,
      power: 25,
      rate: 1,
      description:
        "Sharper context, five times the data. Your downlink must keep up.",
    },
  ],
  radio: [
    {
      id: "basic",
      name: "Patch antenna",
      mass: 2,
      cost: 1,
      power: 4,
      rate: 0.05,
      description: "Light and inexpensive. Only 0.05 MiB/s reaches Earth.",
    },
    {
      id: "strong",
      name: "High-gain dish",
      mass: 6,
      cost: 3,
      power: 16,
      rate: 0.8,
      description: "A directional link with sixteen times the throughput.",
    },
  ],
  solar: [
    {
      id: "small",
      name: "Compact solar wings",
      mass: 5,
      cost: 1,
      power: 45,
      description:
        "45 W at best incidence. Low mass; less eclipse recovery margin.",
    },
    {
      id: "large",
      name: "Extended solar wings",
      mass: 10,
      cost: 2,
      power: 110,
      description: "110 W at best incidence. More generation, more mass.",
    },
  ],
  battery: [
    {
      id: "small",
      name: "60 Wh battery",
      mass: 4,
      cost: 0.7,
      capacity: 60,
      description: "A lighter reserve for carefully scheduled operations.",
    },
    {
      id: "large",
      name: "160 Wh battery",
      mass: 8,
      cost: 1.2,
      capacity: 160,
      description: "More energy through eclipse and high-load operations.",
    },
  ],
  storage: [
    {
      id: "small",
      name: "128 MiB recorder",
      mass: 1,
      cost: 0.3,
      capacity: 128,
      description: "Small, affordable. Stop acquisition when the buffer fills.",
    },
    {
      id: "large",
      name: "512 MiB recorder",
      mass: 2,
      cost: 0.8,
      capacity: 512,
      description:
        "More room between contacts. Storage alone cannot return science.",
    },
  ],
} as const;
export function vehicle(d: Design) {
  const c = catalog.camera.find((x) => x.id === d.camera)!,
    a = catalog.radio.find((x) => x.id === d.radio)!,
    p = catalog.solar.find((x) => x.id === d.solar)!,
    b = catalog.battery.find((x) => x.id === d.battery)!,
    s = catalog.storage.find((x) => x.id === d.storage)!;
  return {
    mass: 25 + 12 + 8 + c.mass + a.mass + p.mass + b.mass + s.mass,
    cost:
      4 +
      5 +
      1.5 +
      c.cost +
      a.cost +
      p.cost +
      b.cost +
      s.cost +
      (d.launcher === "light" ? 18 : 24),
    capacity: b.capacity,
    storage: s.capacity,
    solar: p.power,
    observeW: 18 + 14 + c.power,
    radioW: 18 + a.power,
    rate: c.rate + 0.02,
    downlink: a.rate,
    detail: d.camera === "detail" ? 1.5 : 1,
    altitude: d.orbit === "high" ? 300000 : 100000,
  };
}
export function period(d: Design) {
  return 2 * Math.PI * Math.sqrt((RADIUS + vehicle(d).altitude) ** 3 / MU);
}
export function review(d: Design) {
  const v = vehicle(d);
  return {
    blockers: [
      ...(v.cost > 40 ? ["Budget exceeds the $40M allocation."] : []),
      ...(v.mass > (d.launcher === "light" ? 100 : 150)
        ? ["Payload exceeds launch-service capacity."]
        : []),
    ],
    risks: [
      ...(d.radio === "basic"
        ? [
            "Acquisition can outpace the patch antenna. Prioritize downlink windows.",
          ]
        : []),
      ...(d.orbit === "equatorial"
        ? ["An equatorial orbit cannot survey the south-polar target."]
        : []),
      ...(d.solar === "small"
        ? ["Limited generation: schedule charging before eclipse."]
        : []),
    ],
  };
}
export type Packet = {
  cell: number;
  kind: "proxy" | "context";
  size: number;
  remaining: number;
  quality: number;
};
export type Event = {
  t: number;
  message: string;
  kind: "info" | "warning" | "success";
};
export type State = {
  t: number;
  mode: Mode;
  slew: number;
  energy: number;
  queue: Packet[];
  generated: number;
  sent: number;
  discarded: number;
  received: Record<string, number>;
  events: Event[];
  full: boolean;
  ended: boolean;
  lastCell: number;
  commands: { t: number; mode: Mode }[];
};
export const createState = (d: Design): State => ({
  t: 0,
  mode: "charge",
  slew: 0,
  energy: vehicle(d).capacity * 0.85,
  queue: [],
  generated: 0,
  sent: 0,
  discarded: 0,
  received: {},
  events: [
    {
      t: 0,
      message: "Spacecraft deployed. Ground control has the signal.",
      kind: "success",
    },
  ],
  full: false,
  ended: false,
  lastCell: -1,
  commands: [],
});
export const queued = (s: State) =>
  s.queue.reduce((n, p) => n + p.remaining, 0);
export function env(d: Design, t: number) {
  const v = vehicle(d),
    a = (t / period(d)) * Math.PI * 2,
    r = RADIUS + v.altitude;
  return {
    angle: a,
    contact: !(Math.cos(a) < 0 && Math.abs(r * Math.sin(a)) < RADIUS),
    eclipse: Math.sin(a) < 0 && Math.abs(r * Math.cos(a)) < RADIUS,
    target: d.orbit !== "equatorial" && Math.sin(a) < -0.92,
    cell: Math.floor(((a / (2 * Math.PI)) % 1) * 24) % 24,
    orbit: Math.min(6, Math.floor(t / period(d)) + 1),
  };
}
function note(s: State, message: string, kind: Event["kind"] = "info") {
  s.events.push({ t: s.t, message, kind });
  if (s.events.length > 120) s.events.shift();
}
export function command(s: State, mode: Mode) {
  if (s.ended || s.mode === mode) return;
  s.mode = mode;
  s.slew = 8;
  s.commands.push({ t: s.t, mode });
  note(s, `Command: ${mode.toUpperCase()}. Eight-second attitude slew.`);
}
export function science(s: State) {
  let cells = 0,
    quality = 0;
  for (let i = 0; i < 24; i++) {
    const a = s.received[`${i}-proxy`],
      b = s.received[`${i}-context`];
    if (a && b) {
      cells++;
      quality += (a + b) / 2;
    }
  }
  return {
    cells,
    quality,
    score: Math.min(
      100,
      Math.round((cells / 3) * 85 + Math.max(0, quality - cells) * 20),
    ),
  };
}
// Fixed <=1-second substeps preserve thresholds across rendering rates/time warp.
export function advance(s: State, d: Design, seconds: number) {
  const v = vehicle(d),
    end = period(d) * 6;
  for (let left = seconds; left > 1e-8 && !s.ended;) {
    let dt = Math.min(1, left, end - s.t);
    if (dt <= 0) {
      s.ended = true;
      break;
    }
    left -= dt;
    const e = env(d, s.t);
    const slewing = s.slew > 0;
    s.slew = Math.max(0, s.slew - dt);
    const active = !slewing;
    const incidence =
      s.mode === "charge" || s.mode === "safe"
        ? 1
        : s.mode === "observe"
          ? 0.32
          : 0.5;
    const generation = e.eclipse ? 0 : v.solar * incidence;
    let load = s.mode === "safe" ? 5 : 18;
    if (active && s.mode === "observe" && e.target) load = v.observeW;
    if (active && s.mode === "downlink" && e.contact) load = v.radioW;
    const availableW = (s.energy * 3600) / dt + generation;
    const powered = availableW >= load;
    if (!powered) {
      if (s.mode !== "safe") {
        note(
          s,
          "Energy exhausted. Entering safe mode; science paused.",
          "warning",
        );
        s.mode = "safe";
      }
      load = Math.min(5, availableW);
    }
    s.energy = Math.max(
      0,
      Math.min(v.capacity, s.energy + ((generation - load) * dt) / 3600),
    );
    if (active && powered && s.mode === "observe" && e.target) {
      const room = v.storage - queued(s),
        amount = v.rate * dt;
      if (room + 1e-8 >= amount) {
        const orbitCell = e.cell;
        const proxy = 0.02 * dt,
          context = (v.rate - 0.02) * dt;
        s.queue.push(
          {
            cell: orbitCell,
            kind: "proxy",
            size: proxy,
            remaining: proxy,
            quality: 1,
          },
          {
            cell: orbitCell,
            kind: "context",
            size: context,
            remaining: context,
            quality: v.detail,
          },
        );
        s.generated += amount;
        if (s.lastCell !== orbitCell) {
          note(
            s,
            `Survey cell ${orbitCell}: hydrogen proxy + context acquired.`,
          );
          s.lastCell = orbitCell;
        }
        s.full = false;
      } else if (!s.full) {
        note(
          s,
          "Recorder full. New observations paused until downlink frees space.",
          "warning",
        );
        s.full = true;
      }
    }
    if (active && powered && s.mode === "downlink" && e.contact) {
      let allowance = v.downlink * dt;
      while (allowance > 1e-9 && s.queue.length) {
        const p = s.queue[0],
          amount = Math.min(p.remaining, allowance);
        p.remaining -= amount;
        allowance -= amount;
        s.sent += amount;
        if (p.remaining < 1e-9) {
          const key = `${p.cell}-${p.kind}`;
          s.received[key] = Math.max(s.received[key] || 0, p.quality);
          s.queue.shift();
        }
      }
      if (s.full && queued(s) < v.storage - 1) s.full = false;
    }
    s.t += dt;
    if (s.t >= end - 1e-6) {
      s.ended = true;
      note(
        s,
        `Mission complete. ${science(s).cells} paired survey cells received.`,
        science(s).cells >= 3 ? "success" : "warning",
      );
    }
  }
  return s;
}
export function autoMode(s: State, d: Design): Mode {
  const e = env(d, s.t),
    v = vehicle(d);
  if (s.energy < v.capacity * 0.2) return "charge";
  if (e.contact && queued(s) > 1) return "downlink";
  if (e.target && queued(s) < v.storage - 3) return "observe";
  return "charge";
}
export function simulate(d: Design) {
  const s = createState(d);
  while (!s.ended) {
    command(s, autoMode(s, d));
    advance(s, d, 10);
  }
  return s;
}

// A real operations decision: deliver first-of-kind records before repeats.
export function prioritizeDiscoveries(s: State) {
  const seen = new Set<string>();
  const ranked = s.queue.map((packet, index) => {
    const key = `${packet.cell}-${packet.kind}`;
    const rank = s.received[key] ? 2 : seen.has(key) ? 1 : 0;
    seen.add(key);
    return { packet, index, rank };
  });
  ranked.sort((a, b) => a.rank - b.rank || a.index - b.index);
  s.queue = ranked.map((x) => x.packet);
  note(
    s,
    "Ground control reprioritized unique evidence ahead of repeated observations.",
  );
}
