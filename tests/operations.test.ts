import { test } from "node:test";
import assert from "node:assert/strict";
import {
  newLaunch,
  launchStep,
  flightWarning,
  separate,
} from "../src/sim/launch.ts";
import { starterBuild, deriveBuild } from "../src/campaign/workshop.ts";
import { assignments } from "../src/campaign/model.ts";
import {
  missionStages,
  missionRating,
  newDeployment,
  deploymentStep,
  deploymentAligned,
  releasePayload,
  newNavigation,
  navigationStep,
  navigationSpec,
  newField,
  fieldStep,
  fieldSites,
  fieldGoal,
  beginSampling,
  atLander,
} from "../src/campaign/operations.ts";

test("the reported 65-degree empty-booster trajectory warns and fails if uncorrected", () => {
  const s = newLaunch();
  Object.assign(s, {
    status: "flying",
    assist: false,
    altitude: 47900,
    maxAltitude: 47900,
    velocity: 722,
    pitch: 65,
    fuel: [0, 90000],
  });
  assert.match(flightWarning(s), /OFF COURSE/);
  for (let i = 0; i < 60 && s.status === "flying"; i++) launchStep(s, 0.1, 41);
  assert.equal(s.status, "failed");
  assert.match(s.reason, /corridor|loads/);
});
test("responding to a steering warning gives a real recovery path", () => {
  const s = newLaunch();
  Object.assign(s, {
    status: "flying",
    assist: false,
    altitude: 47900,
    maxAltitude: 47900,
    velocity: 722,
    pitch: 65,
    fuel: [0, 90000],
  });
  for (let i = 0; i < 20; i++) launchStep(s, 0.1, 41);
  assert.ok(s.offCourse > 0);
  s.pitch = 0;
  assert.ok(separate(s));
  for (let i = 0; i < 500 && s.status === "flying"; i++) launchStep(s, 0.1, 41);
  assert.equal(s.status, "handoff", JSON.stringify(s));
  assert.equal(s.offCourse, 0);
});
test("insufficient pad thrust and extreme aerodynamic load have explicit failure reasons", () => {
  const stalled = newLaunch();
  stalled.status = "flying";
  stalled.assist = false;
  stalled.throttle = 0;
  for (let i = 0; i < 70; i++) launchStep(stalled, 0.1, 41);
  assert.equal(stalled.status, "failed");
  assert.match(stalled.reason, /thrust|launchpad/);
  const loaded = newLaunch();
  Object.assign(loaded, {
    status: "flying",
    assist: false,
    altitude: 5000,
    maxAltitude: 5000,
    velocity: 1900,
  });
  for (let i = 0; i < 100 && loaded.status === "flying"; i++)
    launchStep(loaded, 0.1, 41);
  assert.equal(loaded.status, "failed");
  assert.match(loaded.reason, /loads/);
});
test("all starter rockets remain capable of a safe staged ascent", () => {
  for (let index = 0; index < 18; index++) {
    const kit = deriveBuild(starterBuild(index), index),
      s = newLaunch(kit.rocket);
    s.status = "flying";
    for (let i = 0; i < 3000 && s.status === "flying"; i++) {
      if (s.stage === 1 && s.fuel[0] <= s.config.firstFuel * 0.05) separate(s);
      launchStep(s, 0.1, kit.mass);
    }
    assert.equal(s.status, "handoff", JSON.stringify({ index, s }));
  }
});
test("unsafe payload release and neglected spin control fail; every tier has a manual control solution", () => {
  for (let tier = 0; tier < 3; tier++) {
    const kit = deriveBuild(starterBuild(tier), tier),
      bad = newDeployment(tier, kit);
    bad.started = true;
    releasePayload(bad, tier);
    assert.equal(bad.status, "failed");
    assert.match(bad.reason, /fairing/);
    const idle = newDeployment(tier, kit);
    idle.started = true;
    for (let i = 0; i < 1600; i++) deploymentStep(idle, tier, 0.05);
    assert.equal(idle.status, "failed");
    const s = newDeployment(tier, kit);
    s.started = true;
    s.fairing = false;
    for (let i = 0; i < 1400 && s.status === "active"; i++) {
      s.torque = Math.max(-1, Math.min(1, -0.06 * s.angle - 0.35 * s.rate));
      deploymentStep(s, tier, 0.05);
      if (deploymentAligned(s, tier)) releasePayload(s, tier);
    }
    assert.equal(s.status, "ready", JSON.stringify({ tier, s }));
    assert.ok(s.propellant > 0);
  }
});
test("navigation requires timing, direction and cutoff; all worlds/tiers are manually completable", () => {
  for (const index of [3, 4, 5, 9, 10, 11, 15, 16, 17]) {
    const a = assignments[index],
      kit = deriveBuild(starterBuild(index), index),
      p = navigationSpec(a.world, a.tier, kit),
      s = newNavigation(a.world, a.tier, kit);
    s.started = true;
    s.heading = 90;
    for (let i = 0; i < 1800 && s.status === "active"; i++) {
      s.burning = s.t >= p.opens && s.dv < p.required;
      navigationStep(s, a.world, a.tier, kit, 0.02);
    }
    assert.equal(s.status, "ready", JSON.stringify({ index, s }));
    assert.ok(s.fuel > 0);
  }
  const kit = deriveBuild(starterBuild(3), 3),
    bad = newNavigation("earth", 0, kit);
  bad.started = true;
  bad.burning = true;
  for (let i = 0; i < 1800 && bad.status === "active"; i++)
    navigationStep(bad, "earth", 0, kit, 0.02);
  assert.equal(bad.status, "failed");
  assert.match(bad.reason, /propellant|window/);
  const overshoot = newNavigation("earth", 0, kit);
  overshoot.started = true;
  overshoot.heading = 90;
  for (let i = 0; i < 2000 && overshoot.status === "active"; i++) {
    overshoot.burning = overshoot.t >= 8;
    navigationStep(overshoot, "earth", 0, kit, 0.02);
  }
  assert.equal(overshoot.status, "failed");
  assert.match(overshoot.reason, /overshot/);
});
test("rover expeditions require distinct samples and return to lander; every tier is achievable", () => {
  for (let tier = 0; tier < 3; tier++) {
    const kit = deriveBuild(starterBuild(12 + tier), 12 + tier),
      s = newField();
    s.started = true;
    const targetCount = fieldGoal(tier);
    for (let i = 0; i < 6000 && s.status === "active"; i++) {
      let input = { x: 0, y: 0 };
      if (s.samples.length < targetCount) {
        const p = fieldSites[s.samples.length],
          dx = p.x - s.x,
          dy = p.y - s.y;
        if (Math.hypot(dx, dy) > 5)
          input = { x: dx / Math.hypot(dx, dy), y: dy / Math.hypot(dx, dy) };
        else if (s.mode !== "sample") assert.ok(beginSampling(s));
      } else if (!atLander(s)) {
        const dx = 60 - s.x,
          dy = 225 - s.y;
        input = { x: dx / Math.hypot(dx, dy), y: dy / Math.hypot(dx, dy) };
      } else s.mode = "send";
      fieldStep(s, tier, kit, 0.02, input);
    }
    assert.equal(s.status, "ready", JSON.stringify({ tier, s }));
    assert.equal(s.samples.length, targetCount);
    assert.ok(s.health > 0);
    assert.ok(s.battery > 0);
  }
});
test("rover collisions, shadow charging and missing surface deadlines are real", () => {
  const kit = deriveBuild(starterBuild(12), 12),
    s = newField();
  s.started = true;
  s.x = 265;
  s.y = 160;
  fieldStep(s, 0, kit, 1, { x: 0.01, y: 0 });
  assert.ok(s.health < 100);
  s.x = 440;
  s.y = 105;
  s.mode = "charge";
  s.battery = 40;
  fieldStep(s, 0, kit, 1, { x: 0, y: 0 });
  assert.ok(s.battery < 40);
  s.x = 100;
  s.y = 200;
  s.mode = "charge";
  fieldStep(s, 0, kit, 1, { x: 0, y: 0 });
  assert.ok(s.battery > 40);
  for (let i = 0; i < 200 && s.status === "active"; i++)
    fieldStep(s, 0, kit, 1, { x: 0, y: 0 });
  assert.equal(s.status, "failed");
  assert.match(s.reason, /window/);
});
test("career stage plans require deployment, insertion and post-landing work where relevant", () => {
  for (let i = 0; i < 18; i++) {
    const stages = missionStages(i);
    assert.equal(stages[0].id, "commission");
    assert.equal(
      stages.some((s) => s.id === "navigation"),
      i >= 3,
    );
    assert.equal(
      stages.some((s) => s.id === "explore"),
      i >= 12,
    );
  }
  assert.deepEqual(
    missionStages(15).map((s) => s.id),
    ["commission", "navigation", "play", "surface", "explore"],
  );
});
test("mission ratings cannot bypass an assisted stage cap or reward an incomplete run", () => {
  const manual = { success: true, score: 100 },
    assisted = { success: true, score: 79, assisted: true };
  assert.equal(missionRating([manual, manual, assisted, manual]), 79);
  assert.equal(missionRating([manual, manual]), 100);
  assert.equal(missionRating([manual, { success: false, score: 0 }]), 0);
  assert.equal(missionRating([]), 0);
});
