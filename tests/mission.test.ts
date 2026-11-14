import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initialDesign,
  balancedDesign,
  vehicle,
  createState,
  advance,
  command,
  queued,
  simulate,
  science,
  env,
  period,
} from "../src/sim/mission.ts";
test("reference mass and budget are independently correct", () => {
  assert.equal(vehicle(initialDesign).mass, 78);
  assert.equal(vehicle(initialDesign).cost, 39);
  assert.equal(vehicle(balancedDesign).mass, 78);
  assert.equal(vehicle(balancedDesign).cost, 38);
});
test("equatorial orbit never observes polar targets", () => {
  const d = { ...balancedDesign, orbit: "equatorial" as const };
  assert.equal(science(simulate(d)).cells, 0);
});
test("energy and data remain bounded with exact byte accounting", () => {
  const s = simulate(initialDesign);
  assert.ok(s.energy >= 0 && s.energy <= 160);
  assert.ok(queued(s) <= 128 + 1e-6);
  assert.ok(Math.abs(s.generated - s.sent - queued(s) - s.discarded) < 1e-5);
  assert.ok(s.ended);
});
test("same command log produces same result independent of chunking", () => {
  const a = createState(balancedDesign),
    b = createState(balancedDesign);
  command(a, "observe");
  command(b, "observe");
  advance(a, balancedDesign, 1000);
  for (let i = 0; i < 100; i++) advance(b, balancedDesign, 10);
  assert.equal(a.energy, b.energy);
  assert.equal(a.generated, b.generated);
  assert.equal(a.t, b.t);
});
test("both automated reference runs complete, balanced design returns science", () => {
  const a = simulate(initialDesign),
    b = simulate(balancedDesign);
  assert.ok(a.ended && b.ended);
  assert.ok(science(b).cells >= 3, JSON.stringify(science(b)));
  assert.ok(science(b).cells > science(a).cells);
});
test("occultation and eclipse exist, orbital period is plausible", () => {
  let dark = false,
    blocked = false;
  for (let t = 0; t < period(initialDesign); t += 10) {
    const e = env(initialDesign, t);
    dark ||= e.eclipse;
    blocked ||= !e.contact;
  }
  assert.ok(dark && blocked);
  assert.ok(period(initialDesign) > 7000 && period(initialDesign) < 8000);
});
test("no science reception without downlink command", () => {
  const s = createState(initialDesign);
  command(s, "observe");
  advance(s, initialDesign, period(initialDesign) * 6);
  assert.equal(s.sent, 0);
  assert.equal(science(s).cells, 0);
});
