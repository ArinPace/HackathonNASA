import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assignments,
  newOrbit,
  orbitEnvironment,
  orbitStep,
  orbitPassed,
  orbitKit,
  newMotion,
  motionStep,
} from "../src/campaign/model.ts";
import { deriveBuild, starterBuild } from "../src/campaign/workshop.ts";
import {
  newSignal,
  signalStep,
  signalEnvironment,
  signalScore,
} from "../src/campaign/signal.ts";
import { newLaunch, launchStep, separate } from "../src/sim/launch.ts";
test("first level can fail by neglecting the contact deadline", () => {
  const kit = deriveBuild(starterBuild(0), 0),
    s = newSignal(kit, 0);
  for (let i = 0; i < 1300 && s.status === "active"; i++)
    signalStep(s, kit, 0, 0.05);
  assert.equal(s.status, "failed");
  assert.match(s.reason, /window|battery/i);
  assert.equal(s.signal, 0);
});
test("transmitting before opening panels can kill the first spacecraft", () => {
  const kit = deriveBuild(starterBuild(0), 0),
    s = newSignal(kit, 0);
  s.tx = true;
  for (let i = 0; i < 250 && s.status === "active"; i++)
    signalStep(s, kit, 0, 0.05);
  assert.equal(s.status, "failed");
  assert.equal(s.energy, 0);
  assert.ok(s.signal < 2);
  assert.match(s.reason, /radio|battery/i);
});
test("planning power before transmission wins; all three signal tiers remain completable", () => {
  for (let tier = 0; tier < 3; tier++) {
    const kit = deriveBuild(starterBuild(tier), tier),
      s = newSignal(kit, tier);
    s.panels = true;
    for (let i = 0; i < 1200 && s.status === "active"; i++) {
      s.aim = signalEnvironment(s, tier).target;
      s.tx = tier === 2 ? s.t >= 10 : true;
      signalStep(s, kit, tier, 0.05);
    }
    assert.equal(s.status, "ready", JSON.stringify({ tier, kit, signal: s }));
    assert.ok(s.energy > 0);
  }
});
test("changing components changes real power, energy, radio, mass and cost", () => {
  const base = starterBuild(0),
    a = deriveBuild(base, 0),
    b = deriveBuild({ ...base, radio: "dish", battery: "reserve" }, 0);
  assert.ok(b.radio > a.radio);
  assert.ok(b.radioW > a.radioW);
  assert.ok(b.battery > a.battery);
  assert.ok(b.mass > a.mass);
  assert.ok(b.cost > a.cost);
});
test("three-star signal mastery is attainable through feasible design and operation", () => {
  for (let tier = 0; tier < 3; tier++) {
    const kit = deriveBuild(
      { ...starterBuild(tier), solar: "wide", battery: "light", fuel: "lean" },
      tier,
    );
    assert.equal(kit.blocks.length, 0);
    const s = newSignal(kit, tier);
    s.panels = true;
    for (let i = 0; i < 1200 && s.status === "active"; i++) {
      s.aim = signalEnvironment(s, tier).target;
      s.tx = s.t >= (tier === 2 ? 10 : 0);
      signalStep(s, kit, tier, 0.05);
    }
    assert.equal(s.status, "ready");
    assert.ok(
      signalScore(s, kit, tier) >= 90,
      JSON.stringify({ tier, s, score: signalScore(s, kit, tier) }),
    );
  }
});
test("preflight blocks over-budget builds, overloaded launchers and wrong Mars delivery", () => {
  assert.ok(
    deriveBuild(
      {
        ...starterBuild(0),
        booster: "heavy",
        radio: "dish",
        upper: "deep",
        solar: "wide",
      },
      0,
    ).blocks.length > 0,
  );
  assert.match(
    deriveBuild({ ...starterBuild(6), booster: "scout" }, 6).blocks.join(" "),
    /capacity/,
  );
  assert.match(
    deriveBuild({ ...starterBuild(15), upper: "orbital" }, 15).blocks.join(" "),
    /Mars/,
  );
  for (let i = 0; i < 18; i++)
    assert.equal(
      deriveBuild(starterBuild(i), i).blocks.length,
      0,
      `starter build ${i} must be feasible`,
    );
});
test("rocket modules change actual thrust and propellant, not just artwork", () => {
  const a = deriveBuild(starterBuild(0), 0),
    b = deriveBuild(
      { ...starterBuild(0), booster: "heavy", fuel: "extended" },
      0,
    ),
    sa = newLaunch(a.rocket),
    sb = newLaunch(b.rocket);
  assert.ok(sb.fuel[0] > sa.fuel[0]);
  assert.ok(sb.config.firstThrust > sa.config.firstThrust);
  sa.status = sb.status = "flying";
  sa.assist = sb.assist = false;
  for (let i = 0; i < 20; i++) {
    launchStep(sa, 0.1, a.mass);
    launchStep(sb, 0.1, b.mass);
  }
  assert.notEqual(sa.altitude, sb.altitude);
});
test("default designed orbital missions are winnable across all later tiers", () => {
  for (const index of [3, 4, 5, 9, 10, 11, 15, 16, 17]) {
    const a = assignments[index],
      kit = deriveBuild({ ...starterBuild(index), recorder: "large" }, index),
      l = orbitKit(0, a.tier, kit),
      s = { ...newOrbit(), energy: l.battery * (0.7 - a.tier * 0.06) };
    for (
      let i = 0;
      i < 24000 && !s.ended && !orbitPassed(s, a.world, 0, a.tier, kit);
      i++
    ) {
      const e = orbitEnvironment(s, a.world),
        queued = s.queue.reduce((n, p) => n + p.remaining, 0);
      s.mode =
        s.energy < l.battery * 0.3
          ? "charge"
          : e.target && !s.seen.includes(e.cell) && queued + l.size <= l.storage
            ? "observe"
            : e.contact && queued > 0
              ? "transmit"
              : "charge";
      orbitStep(s, a.world, 0, 2, a.tier, kit);
    }
    assert.ok(
      orbitPassed(s, a.world, 0, a.tier, kit),
      JSON.stringify({
        index,
        energy: s.energy,
        delivered: s.delivered,
        why: s.reason,
      }),
    );
  }
});
test("designed landers can touch down with their actual dry mass and selected reserves", () => {
  for (const index of [12, 13, 14, 15, 16, 17]) {
    const a = assignments[index],
      kit = deriveBuild(starterBuild(index), index),
      s = {
        ...newMotion("land", a.world, a.tier),
        dryMass: kit.dryMass,
        fuel: kit.surfaceFuel,
        assist: true,
      };
    for (let i = 0; i < 3000 && s.status === "active"; i++)
      motionStep(s, "land", a.world, 0.1, { x: 0, y: 0 }, a.tier);
    assert.equal(s.status, "success", JSON.stringify({ index, kit, s }));
  }
});
