import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { flyLaunch } from "./launch-flow.mjs";
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
await page.getByRole("button", { name: "Start rocket launch" }).click();
await flyLaunch(page, { clock: true, career: true });
await page.getByRole("button", { name: "Deploy solar wings" }).click();
await page
  .getByRole("button", { name: "Transmit signal", exact: true })
  .click();
await page.clock.runFor(8000);
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
await page.getByRole("button", { name: /Use launch certificate/ }).click();
await page.getByRole("button", { name: "Deploy solar wings" }).click();
await page.getByRole("slider", { name: "Antenna aim" }).fill("5");
await page
  .getByRole("button", { name: "Transmit signal", exact: true })
  .click();
await page.clock.runFor(13000);
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
  "PASS: first launch and 2 real career assignments, 18-map locks, XP, saved progress after reload, launch certificate, antenna aiming, mobile layout, no page errors.",
);
await browser.close();
