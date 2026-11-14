import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    "/Users/arainajain/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1060 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:5173");
await page.getByRole("button", { name: "Start guided first mission" }).click();
const coach = page.getByRole("region", { name: "Mission walkthrough" });
const next = () =>
  coach.getByRole("button", { name: "Continue", exact: true }).click();
assert.equal(
  await coach
    .getByRole("button", { name: "Continue", exact: true })
    .isDisabled(),
  true,
);
await page.getByRole("button", { name: /Context imager/ }).click();
await next();
await page.getByRole("button", { name: "Comms", exact: true }).click();
await page.getByRole("button", { name: /High-gain dish/ }).click();
await next();
await page.getByRole("button", { name: "Review mission" }).click();
await next();
await page.getByRole("button", { name: "Commit & deploy" }).click();
await next();
await page.getByRole("button", { name: /Observe.*Point instrument/ }).click();
await page.waitForTimeout(2400);
await next();
await page.getByRole("button", { name: /Downlink.*Point antenna/ }).click();
await page.waitForTimeout(1500);
await next();
await page.getByRole("button", { name: /Charge.*Face solar/ }).click();
await coach.getByRole("button", { name: "Complete flight school" }).click();
await page.screenshot({
  path: "/private/tmp/ols-tutorial-desktop.png",
  fullPage: true,
});
await page.getByLabel("Auto operator").check();
await page.getByRole("button", { name: /Observe.*Point instrument/ }).click();
assert.equal(await page.getByLabel("Auto operator").isChecked(), false);
await page.getByRole("button", { name: /Coast to/ }).click();
assert.equal(
  await page.getByRole("button", { name: "Resume", exact: true }).isVisible(),
  true,
);
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({
  path: "/private/tmp/ols-tutorial-mobile.png",
  fullPage: true,
});
assert.equal(
  await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
  false,
);
assert.deepEqual(errors, []);
console.log(
  "PASS: action-gated tutorial, first science, manual control overrides auto, coast pause, mobile layout, no page errors.",
);
await browser.close();
