import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import {
  openWorkshop,
  dismissCoach,
  completeDeployment,
  completeNavigation,
  deployDesign,
} from "./launch-flow.mjs";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    "/Users/arainajain/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl"],
});
const ids = [
  "signal",
  "orbit",
  "station",
  "lunar-orbit",
  "landing",
  "mars",
].flatMap((id) => [0, 1, 2].map((t) => `${id}-${t}`));
const errors = [];
async function scenario(prefix = 0, certificate = true) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1060 },
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(
    ({ ids, prefix, certificate }) =>
      localStorage.setItem(
        "ols-career-v1",
        JSON.stringify({
          version: 1,
          best: Object.fromEntries(ids.slice(0, prefix).map((id) => [id, 80])),
          launchCertified: certificate,
        }),
      ),
    { ids, prefix, certificate },
  );
  await page.clock.install();
  await page.goto("http://127.0.0.1:5173");
  return page;
}
const launch = await scenario(0, false);
await launch.getByRole("button", { name: "Begin level 1" }).click();
await openWorkshop(launch);
await launch
  .getByRole("button", { name: "Launch this design", exact: true })
  .click();
await dismissCoach(launch);
await launch
  .getByRole("slider", { name: "Rocket lean angle", exact: true })
  .fill("65");
await launch
  .getByRole("button", { name: "Start countdown", exact: true })
  .click();
await launch.clock.runFor(5000);
await expect(launch.getByRole("alert")).toContainText("OFF COURSE");
await launch.screenshot({
  path: "/private/tmp/ols-launch-off-course.png",
  fullPage: true,
});
await launch.clock.runFor(6000);
await expect(
  launch.getByRole("button", { name: "Retry launch", exact: true }),
).toBeVisible();
await expect(launch.getByRole("alert")).toContainText("FLIGHT LOST");
await launch.getByRole("button", { name: "Retry launch", exact: true }).click();
await expect(
  launch.getByRole("slider", { name: "Rocket lean angle", exact: true }),
).toHaveValue("0");
await launch.close();
console.log(
  "PASS: real launch UI warns at a dangerous lean, fails, explains and resets for retry.",
);
const deploy = await scenario();
await deploy.getByRole("button", { name: "Begin level 1" }).click();
await openWorkshop(deploy);
await deploy
  .getByRole("button", {
    name: "Use certificate to deploy this design",
    exact: true,
  })
  .click();
await dismissCoach(deploy);
await deploy
  .getByRole("button", { name: "Start commissioning", exact: true })
  .click();
await deploy.getByRole("button", { name: /Release payload/ }).click();
await deploy.clock.runFor(100);
await expect(
  deploy.getByRole("heading", { name: "One more attempt.", exact: true }),
).toBeVisible();
assert.equal(
  await deploy.evaluate(
    () => JSON.parse(localStorage.getItem("ols-career-v1")).best["signal-0"],
  ),
  undefined,
);
await deploy
  .getByRole("button", { name: /Retry from this checkpoint/ })
  .click();
await completeDeployment(deploy);
await expect(
  deploy.getByRole("heading", {
    name: "Bring your satellite online.",
    exact: true,
  }),
).toBeVisible();
assert.equal(
  await deploy.evaluate(
    () => JSON.parse(localStorage.getItem("ols-career-v1")).best["signal-0"],
  ),
  undefined,
);
await deploy.close();
console.log(
  "PASS: unsafe payload release fails with no XP; manual torque recovery reaches first-contact stage without an early unlock.",
);
const nav = await scenario(3);
await nav
  .getByRole("region", { name: "Career mission chapters" })
  .getByRole("button", { name: /First Lap/ })
  .click();
await openWorkshop(nav);
await nav
  .getByRole("button", {
    name: "Use certificate to deploy this design",
    exact: true,
  })
  .click();
await completeDeployment(nav);
await dismissCoach(nav);
await nav
  .getByRole("button", { name: "Begin insertion approach", exact: true })
  .click();
await nav
  .getByRole("button", { name: "Ignite insertion engine", exact: true })
  .click();
await nav.clock.runFor(34000);
await expect(
  nav.getByRole("heading", { name: "One more attempt.", exact: true }),
).toBeVisible();
await nav.getByRole("button", { name: /Retry from this checkpoint/ }).click();
await expect(
  nav.getByRole("heading", { name: "Burn for a stable orbit.", exact: true }),
).toBeVisible();
await completeNavigation(nav);
await expect(
  nav.getByRole("button", { name: "Observe", exact: true }),
).toBeVisible();
assert.equal(
  await nav.evaluate(
    () => JSON.parse(localStorage.getItem("ols-career-v1")).best["orbit-0"],
  ),
  undefined,
);
await nav.close();
console.log(
  "PASS: bad burn wastes fuel and fails; retry returns to insertion, a controlled burn reaches orbital operations without granting mission XP.",
);
const mobile = await scenario(12);
await mobile
  .getByRole("region", { name: "Career mission chapters" })
  .getByRole("button", { name: /First Touchdown/ })
  .click();
await deployDesign(mobile);
await mobile.getByRole("checkbox", { name: /Landing assistance/ }).check();
await mobile.clock.runFor(130000);
await mobile.setViewportSize({ width: 390, height: 844 });
await expect(
  mobile.getByRole("dialog", { name: "Interactive mission walkthrough" }),
).toBeVisible();
const box = await mobile.getByRole("dialog").boundingBox();
assert.ok(
  box.x >= 0 &&
    box.y >= 0 &&
    box.x + box.width <= 390 &&
    box.y + box.height <= 844,
);
await dismissCoach(mobile);
await mobile
  .getByRole("button", { name: "Start surface expedition", exact: true })
  .click();
const before = await mobile
  .locator('[data-guide="rover-position"]')
  .textContent();
await mobile.keyboard.down("d");
await mobile.clock.runFor(700);
await mobile.keyboard.up("d");
assert.notEqual(
  await mobile.locator('[data-guide="rover-position"]').textContent(),
  before,
);
await mobile
  .getByRole("button", { name: "Pause operation", exact: true })
  .click();
await mobile.screenshot({
  path: "/private/tmp/ols-rover-mobile.png",
  fullPage: true,
});
assert.equal(
  await mobile.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  ),
  false,
);
assert.deepEqual(errors, []);
await mobile.close();
console.log(
  "PASS: mobile rover walkthrough fits the viewport, driving changes position, pause works and no layout overflow or JS errors.",
);
await browser.close();
