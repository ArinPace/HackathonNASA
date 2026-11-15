import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { dismissCoach } from "./launch-flow.mjs";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    "/Users/arainajain/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl"],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:5173");
await page.getByRole("button", { name: "Begin level 1" }).click();
await page
  .getByRole("button", { name: "Build spacecraft & rocket", exact: true })
  .click();
const popup = page.getByRole("dialog", {
  name: "Interactive mission walkthrough",
});
await popup.waitFor();
await page.getByRole("button", { name: "Next tip", exact: true }).click();
const bounds = await popup.boundingBox();
assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 390);
assert.ok(bounds.y >= 0 && bounds.y + bounds.height <= 844);
assert.equal(
  await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
  false,
);
await page.screenshot({
  path: "/private/tmp/ols-workshop-mobile-guide.png",
  fullPage: true,
});
await dismissCoach(page);
await page
  .getByRole("combobox", { name: "Build radio", exact: true })
  .selectOption("dish");
await page.getByText(/cannot sustain transmission indefinitely/).waitFor();
await page.getByRole("button", { name: "Rocket", exact: true }).click();
await page
  .getByRole("combobox", { name: "Build booster", exact: true })
  .selectOption("heavy");
assert.equal(
  await page
    .getByRole("button", { name: "Launch this design", exact: true })
    .isDisabled(),
  true,
);
await page.getByRole("button", { name: /Lunar sandbox/ }).click();
await page.screenshot({
  path: "/private/tmp/ols-basics-mobile.png",
  fullPage: true,
});
await page.getByRole("button", { name: /Enter the assembly bay/ }).click();
await page.getByRole("button", { name: "Review mission" }).click();
await page.getByRole("button", { name: "Go to launchpad" }).click();
await dismissCoach(page);
await page.getByRole("slider", { name: "Engine throttle" }).fill("70");
assert.equal(
  await page.getByRole("checkbox", { name: /Flight assistance/ }).isChecked(),
  false,
);
await page.getByRole("button", { name: "Steer right" }).click();
await page.getByRole("checkbox", { name: /Flight assistance/ }).check();
await page.getByRole("button", { name: "Start countdown" }).click();
await page.getByRole("button", { name: "Pause", exact: true }).click();
await page.waitForTimeout(1500);
assert.equal(
  await page
    .getByRole("region", { name: "Rocket launch" })
    .getByText("4", { exact: true })
    .isVisible(),
  true,
);
await page.screenshot({
  path: "/private/tmp/ols-launch-mobile.png",
  fullPage: true,
});
assert.equal(
  await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
  false,
);
assert.deepEqual(errors, []);
console.log(
  "PASS: mobile workshop/guide stays in viewport, hardware changes warnings and budget blocks, beginner explanation, launch layout, manual throttle, steering, pause freezes countdown, no page errors.",
);
await browser.close();
