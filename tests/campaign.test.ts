import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assignments,
  parseProgress,
  unlocked,
  award,
  xp,
  rank,
  newOrbit,
  orbitKit,
  orbitEnvironment,
  orbitStep,
  orbitPassed,
  newMotion,
  motionStep,
  orbitGoal,
} from "../src/campaign/model.ts";
test("18 assignments unlock sequentially, failed/out-of-order attempts grant no XP", () => {
  let p = parseProgress(null);
  assert.equal(assignments.length, 18);
  assert.ok(unlocked(p, 0));
  assert.equal(unlocked(p, 1), false);
  assert.equal(award(p, 5, 100), p);
  for (let i = 0; i < 18; i++) {
    assert.ok(unlocked(p, i));
    p = award(p, i, 80);
    if (i < 17) assert.ok(unlocked(p, i + 1));
  }
  assert.equal(Object.keys(p.best).length, 18);
  assert.ok(xp(p) > 0);
});
test("replaying cannot farm XP; improving mastery awards only the difference", () => {
  const p = award(parseProgress(null), 0, 70),
    same = award(p, 0, 65),
    better = award(p, 0, 95);
  assert.equal(xp(p), xp(same));
  assert.equal(xp(better) - xp(p), 40);
  assert.equal(xp(award(better, 0, 95)), xp(better));
});
test("stored career validates scores and survives a JSON round trip", () => {
  const p = award(parseProgress(null), 0, 100);
  assert.deepEqual(parseProgress(JSON.stringify(p)), p);
  assert.equal(xp(parseProgress("broken")), 0);
  assert.deepEqual(
    parseProgress(
      '{"version":1,"best":{"signal-0":999,"signal-1":-1,"other":100}}',
    ).best,
    {},
  );
});
test("each orbital tier is winnable using real resources and distinct observations", () => {
  for (const world of ["earth", "moon", "mars"] as const)
    for (let tier = 0; tier < 3; tier++) {
      const load = world === "earth" ? 0 : 2,
        l = orbitKit(load, tier),
        s = { ...newOrbit(load), energy: l.battery * (0.7 - tier * 0.06) };
      for (
        let i = 0;
        i < 20000 && !s.ended && !orbitPassed(s, world, load, tier);
        i++
      ) {
        const e = orbitEnvironment(s, world),
          queued = s.queue.reduce((n, p) => n + p.remaining, 0);
        s.mode =
          s.energy < l.battery * 0.3
            ? "charge"
            : e.target &&
                !s.seen.includes(e.cell) &&
                queued + l.size <= l.storage
              ? "observe"
              : e.contact && queued > 0
                ? "transmit"
                : "charge";
        orbitStep(s, world, load, 2, tier);
      }
      assert.ok(
        orbitPassed(s, world, load, tier),
        JSON.stringify({
          world,
          tier,
          energy: s.energy,
          seen: s.seen,
          delivered: s.delivered,
          reason: s.reason,
        }),
      );
      assert.ok(
        Math.abs(
          s.generated - s.sent - s.queue.reduce((n, p) => n + p.remaining, 0),
        ) < 1e-5,
      );
      assert.equal(s.delivered.length, new Set(s.delivered).size);
      assert.ok(s.energy >= 0 && s.energy <= l.battery);
    }
});
test("every docking assignment can be completed with assistance", () => {
  for (let tier = 0; tier < 3; tier++) {
    const s = newMotion("dock", "earth", tier);
    for (let i = 0; i < 5000 && s.status === "active"; i++)
      motionStep(s, "dock", "earth", 0.1, { x: 0, y: 0 }, tier);
    assert.equal(s.status, "success", JSON.stringify(s));
    assert.ok(s.fuel >= 0);
  }
});
test("Moon and Mars landing tiers are completable with assistance", () => {
  for (const world of ["moon", "mars"] as const)
    for (let tier = 0; tier < 3; tier++) {
      const s = newMotion("land", world, tier);
      for (let i = 0; i < 4000 && s.status === "active"; i++)
        motionStep(s, "land", world, 0.1, { x: 0, y: 0 }, tier);
      assert.equal(s.status, "success", JSON.stringify({ world, tier, ...s }));
      assert.ok(s.impact < 3 - tier * 0.5);
      assert.ok(s.fuel >= 0);
    }
});
test("harder tiers tighten actual docking / landing tolerances", () => {
  const easy = newMotion("dock");
  easy.x = 1.5;
  easy.y = 2.001;
  easy.vx = 0;
  easy.vy = -0.1;
  easy.assist = false;
  const hard = { ...easy };
  motionStep(easy, "dock", "earth", 0.1, { x: 0, y: 0 }, 0);
  motionStep(hard, "dock", "earth", 0.1, { x: 0, y: 0 }, 2);
  assert.equal(easy.status, "success");
  assert.equal(hard.status, "failed");
  assert.equal(orbitGoal("mars", 2), 6);
});
