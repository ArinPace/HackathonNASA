/** Fictional training hardware. Every selectable part changes mission parameters. */
import { assignments } from "./model";
export type Build = {
  solar: "compact" | "wide";
  battery: "light" | "reserve";
  radio: "patch" | "dish";
  recorder: "small" | "large";
  payload: "survey" | "detail";
  booster: "scout" | "heavy";
  upper: "orbital" | "deep";
  fuel: "lean" | "standard" | "extended";
};
export const defaultBuild: Build = {
  solar: "compact",
  battery: "light",
  radio: "patch",
  recorder: "small",
  payload: "survey",
  booster: "scout",
  upper: "orbital",
  fuel: "standard",
};
export function starterBuild(index: number): Build {
  const a = assignments[index];
  return {
    ...defaultBuild,
    ...(index === 2 ? { battery: "reserve" as const } : {}),
    ...(a.chapter >= 3
      ? {
          solar: "wide" as const,
          battery: "reserve" as const,
          radio: "dish" as const,
        }
      : {}),
    booster:
      a.kind === "land" || a.kind === "dock" || a.kind === "mars"
        ? "heavy"
        : "scout",
    upper: a.world === "mars" ? "deep" : "orbital",
  };
}
export function deriveBuild(build: Build, index: number) {
  const a = assignments[index],
    signal = a.kind === "signal",
    surface = a.kind === "land" || a.kind === "mars";
  const fuelScale =
    build.fuel === "lean" ? 0.65 : build.fuel === "extended" ? 1.3 : 1;
  const payloadMass = signal
    ? 8
    : a.kind === "dock"
      ? 95
      : surface
        ? 90
        : a.world === "earth"
          ? 10
          : 20;
  const payloadCost = signal
    ? 1
    : a.kind === "dock"
      ? 5
      : surface
        ? 8
        : a.world === "earth"
          ? 3
          : 7;
  const power =
    build.solar === "wide"
      ? { mass: 9, cost: 2.5, w: 110 }
      : { mass: 5, cost: 1, w: 65 };
  const battery =
    build.battery === "reserve"
      ? { mass: 5, cost: 1.6, wh: signal ? 0.6 : 120 }
      : { mass: 2, cost: 0.6, wh: signal ? 0.25 : 60 };
  const radio =
    build.radio === "dish"
      ? { mass: 6, cost: 3, w: 85, rate: 0.6 }
      : { mass: 2, cost: 1, w: 55, rate: 0.18 };
  const memory =
    build.recorder === "large"
      ? { mass: 3, cost: 1.2, size: 160 }
      : { mass: 1, cost: 0.4, size: 64 };
  const detail = build.payload === "detail" && !signal && a.kind !== "dock";
  const dryMass =
    15 +
    payloadMass +
    power.mass +
    battery.mass +
    radio.mass +
    memory.mass +
    (detail ? 5 : 0);
  const surfaceFuel = surface
    ? (a.world === "mars" ? 48 - a.tier * 5 : 40 - a.tier * 5) * fuelScale
    : 8 * fuelScale;
  const mass = dryMass + surfaceFuel;
  const cost =
    3 +
    payloadCost +
    power.cost +
    battery.cost +
    radio.cost +
    memory.cost +
    (detail ? 3 : 0) +
    (build.booster === "heavy" ? 24 : 18) +
    (build.upper === "deep" ? 5 : 2) +
    (build.fuel === "extended" ? 2 : build.fuel === "lean" ? 0.3 : 1);
  const budget = [31, 36, 42, 44, 49, 56][a.chapter] - a.tier;
  const capacity = build.booster === "heavy" ? 230 : 90;
  return {
    mass,
    dryMass,
    surfaceFuel,
    fuelScale,
    cost,
    budget,
    capacity,
    battery: battery.wh,
    solar: power.w,
    radioW: radio.w,
    radio: radio.rate,
    storage: memory.size,
    load: detail ? 54 : 38,
    size: detail ? 24 : 12,
    quality: detail ? 1.3 : 1,
    name: detail ? "Detailed survey" : "Survey mission",
    rocket: {
      firstFuel: 300000 * fuelScale,
      upperFuel: (build.upper === "deep" ? 110000 : 90000) * fuelScale,
      firstThrust: build.booster === "heavy" ? 9.2e6 : 8e6,
      upperThrust: build.upper === "deep" ? 1.5e6 : 1.3e6,
      firstDry: build.booster === "heavy" ? 40000 : 30000,
      upperDry: 10000,
    },
    blocks: [
      ...(cost > budget
        ? [`Budget exceeded: $${cost.toFixed(1)}M / $${budget}M.`]
        : []),
      ...(mass > capacity
        ? [
            `Payload ${mass.toFixed(0)} kg exceeds the ${capacity} kg launch capacity. Choose Heavy lift or reduce mass.`,
          ]
        : []),
      ...(a.world === "mars" && build.upper !== "deep"
        ? ["Mars delivery requires the deep-space upper stage."]
        : []),
    ],
    risks: [
      ...(radio.w + 8 > power.w
        ? [
            `Radio + computer draw ${radio.w + 8} W; even in full Sun the ${power.w} W panels cannot sustain transmission indefinitely.`,
          ]
        : []),
      ...(build.fuel === "lean"
        ? [
            "Lean propellant reduces mass but leaves less ascent and landing reserve.",
          ]
        : []),
      ...(detail && build.recorder === "small"
        ? [
            "Detailed images fill the small recorder quickly. Plan transmission windows.",
          ]
        : []),
    ],
  };
}
export type FlightKit = ReturnType<typeof deriveBuild>;
export const buildChoices = {
  solar: [
    { id: "compact", name: "Compact solar wings", hint: "65 W · 5 kg · $1M" },
    { id: "wide", name: "Wide solar wings", hint: "110 W · 9 kg · $2.5M" },
  ],
  battery: [
    {
      id: "light",
      name: "Light battery",
      hint: "Less mass and cost; shorter reserve",
    },
    {
      id: "reserve",
      name: "Reserve battery",
      hint: "More stored energy · +3 kg · +$1M",
    },
  ],
  radio: [
    {
      id: "patch",
      name: "Patch radio",
      hint: "0.18 MiB/s · 55 W · 2 kg · $1M",
    },
    {
      id: "dish",
      name: "High-gain radio",
      hint: "0.60 MiB/s · 85 W · 6 kg · $3M",
    },
  ],
  recorder: [
    { id: "small", name: "Small recorder", hint: "64 MiB · 1 kg · $0.4M" },
    { id: "large", name: "Large recorder", hint: "160 MiB · 3 kg · $1.2M" },
  ],
  payload: [
    {
      id: "survey",
      name: "Survey instrument",
      hint: "Wide coverage, modest data generation",
    },
    {
      id: "detail",
      name: "Detailed instrument",
      hint: "Higher detail, twice the image data · +$3M",
    },
  ],
  booster: [
    {
      id: "scout",
      name: "Scout booster",
      hint: "90 kg payload capacity · 8 MN thrust · $18M",
    },
    {
      id: "heavy",
      name: "Heavy-lift booster",
      hint: "230 kg capacity · 9.2 MN thrust · $24M",
    },
  ],
  upper: [
    {
      id: "orbital",
      name: "Orbital upper stage",
      hint: "Earth / Moon delivery · $2M",
    },
    {
      id: "deep",
      name: "Deep-space upper stage",
      hint: "Mars-capable delivery · $5M",
    },
  ],
  fuel: [
    {
      id: "lean",
      name: "Lean tanks",
      hint: "65% propellant · $0.3M · less reserve",
    },
    { id: "standard", name: "Standard tanks", hint: "100% propellant · $1M" },
    {
      id: "extended",
      name: "Extended tanks",
      hint: "130% propellant · $2M · more launch mass",
    },
  ],
} as const;
