import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import {
  flyLaunch,
  dismissCoach,
  openWorkshop,
  deployDesign,
} from "./launch-flow.mjs";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    "/Users/arainajain/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1060 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.clock.install();
await page.goto("http://127.0.0.1:5173");
await page.screenshot({
  path: "/private/tmp/ols-career-map.png",
  fullPage: true,
});
assert.equal(
  await page
    .getByRole("region", { name: "Career mission chapters" })
    .getByRole("button")
    .count(),
  18,
);
const level2 = page.getByRole("button", { name: /Relay Duty/ });
assert.ok(await level2.isDisabled());
await page.getByRole("button", { name: "Begin level 1" }).click();
await openWorkshop(page);
await page.getByRole("button", { name: "Rocket", exact: true }).click();
await page
  .getByRole("combobox", { name: "Build booster", exact: true })
  .selectOption("heavy");
await expect(
  page.getByRole("button", { name: "Launch this design" }),
).toBeDisabled();
await expect(page.getByText(/Budget exceeded:/)).toBeVisible();
await page
  .getByRole("combobox", { name: "Build booster", exact: true })
  .selectOption("scout");
await expect(
  page.getByRole("button", { name: "Launch this design" }),
).toBeEnabled();
await page.screenshot({
  path: "/private/tmp/ols-rocket-workshop.png",
  fullPage: true,
});
await page
  .getByRole("button", { name: "Launch this design", exact: true })
  .click();
await expect(
  page.getByRole("checkbox", { name: /Flight assistance/ }),
).not.toBeChecked();
await flyLaunch(page, { clock: true, career: true });
// Reading a popup must neither consume the contact window nor operate controls.
await expect(
  page.getByRole("dialog", { name: "Interactive mission walkthrough" }),
).toBeVisible();
await page.clock.runFor(80000);
await expect(page.locator('[data-guide="signal-time"] b')).toHaveText("60s");
await expect(
  page.getByRole("button", { name: "Complete satellite assignment" }),
).toBeDisabled();
await page.getByRole("button", { name: "Next tip", exact: true }).click();
await expect(
  page.getByRole("heading", { name: "Your battery is a limited reserve." }),
).toBeVisible();
await page.screenshot({
  path: "/private/tmp/ols-signal-walkthrough.png",
  fullPage: true,
});
await page.keyboard.press("Tab");
await expect(
  page.getByRole("button", { name: "Close walkthrough", exact: true }),
).toBeFocused();
await page.keyboard.press("Escape");
await expect(page.getByRole("dialog")).toHaveCount(0);
// A genuinely bad operating decision fails the first assignment.
await page
  .getByRole("button", { name: "Transmit signal", exact: true })
  .click();
await page.clock.runFor(10000);
await expect(
  page.getByRole("heading", { name: "One more attempt." }),
).toBeVisible();
const failed = await page.evaluate(() =>
  JSON.parse(localStorage.getItem("ols-career-v1")),
);
assert.equal(failed.best["signal-0"], undefined);
assert.ok(
  await page.getByRole("button", { name: /Redesign spacecraft/ }).isVisible(),
);
await page.getByRole("button", { name: /Retry from this checkpoint/ }).click();
await page.getByRole("button", { name: "Deploy solar wings" }).click();
await page
  .getByRole("button", { name: "Transmit signal", exact: true })
  .click();
await page.clock.runFor(13000);
await page
  .getByRole("button", { name: "Complete satellite assignment" })
  .click();
await expect(
  page.getByRole("heading", { name: "Assignment complete." }),
).toBeVisible();
const saved = await page.evaluate(() =>
  JSON.parse(localStorage.getItem("ols-career-v1")),
);
assert.ok(saved.best["signal-0"] >= 0);
assert.ok(saved.launchCertified);
await page.screenshot({
  path: "/private/tmp/ols-career-levelup.png",
  fullPage: true,
});
await page.getByRole("button", { name: /Unlock level 2/ }).click();
await deployDesign(page);
await page.getByRole("button", { name: "Deploy solar wings" }).click();
await page.getByRole("slider", { name: "Antenna aim" }).fill("5");
await page
  .getByRole("button", { name: "Transmit signal", exact: true })
  .click();
await page.clock.runFor(24000);
await page
  .getByRole("button", { name: "Complete satellite assignment" })
  .click();
await page.reload();
await expect(
  page.getByRole("button", { name: /Continue level 3/ }),
).toBeVisible();
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({
  path: "/private/tmp/ols-career-mobile.png",
  fullPage: true,
});
assert.equal(
  await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
  false,
);
assert.deepEqual(errors, []);
console.log(
  "PASS: real workshop budget blocks, manual launch, walkthrough pauses and Escape, level-1 battery failure without progress, retry to earn XP, 2 career assignments, locks, saves, antenna aiming, mobile layout, no page errors.",
);
await browser.close();
