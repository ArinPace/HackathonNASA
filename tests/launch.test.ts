import { test } from "node:test";
import assert from "node:assert/strict";
import { newLaunch, launchStep, separate } from "../src/sim/launch.ts";
test("countdown does not use fuel or move rocket", () => {
  const s = newLaunch();
  s.status = "countdown";
  launchStep(s, 1, 78);
  assert.equal(s.countdown, 3);
  assert.equal(s.altitude, 0);
  assert.equal(s.fuel[0], 300000);
});
test("assisted rocket climbs, waits for separation, and reaches space on second stage", () => {
  const s = newLaunch();
  s.status = "flying";
  for (let i = 0; i < 1000 && s.fuel[0] > 0; i++) launchStep(s, 0.1, 78);
  assert.equal(s.status, "flying");
  assert.ok(s.altitude > 0);
  const time = s.time;
  launchStep(s, 0.1, 78);
  assert.equal(s.time, time);
  assert.ok(separate(s));
  assert.equal(separate(s), false);
  for (let i = 0; i < 1000 && s.status === "flying"; i++)
    launchStep(s, 0.1, 78);
  assert.equal(s.status, "handoff", JSON.stringify(s));
  assert.ok(s.altitude >= 100000);
  assert.ok(s.fuel[1] >= 0);
  assert.ok(s.burn2 >= 8);
});
test("manual throttle changes climb and fuel use", () => {
  const a = newLaunch(),
    b = newLaunch();
  a.status = b.status = "flying";
  a.assist = b.assist = false;
  a.throttle = 1;
  b.throttle = 0.5;
  for (let i = 0; i < 50; i++) {
    launchStep(a, 0.1, 78);
    launchStep(b, 0.1, 78);
  }
  assert.ok(a.altitude > b.altitude);
  assert.ok(a.fuel[0] < b.fuel[0]);
});
test("separating a full booster is blocked and does not alter state", () => {
  const s = newLaunch();
  s.status = "flying";
  assert.equal(separate(s), false);
  assert.equal(s.stage, 1);
  assert.equal(s.fuel[0], 300000);
});
test("fuel cannot be negative and invalid time cannot corrupt state", () => {
  const s = newLaunch();
  s.status = "flying";
  launchStep(s, NaN, 78);
  assert.equal(s.time, 0);
  for (let i = 0; i < 5000; i++) {
    if (s.fuel[0] <= 15000 && s.stage === 1) separate(s);
    launchStep(s, 0.1, 78);
  }
  assert.ok(s.fuel.every((f) => f >= 0));
  assert.ok(Number.isFinite(s.altitude));
});
