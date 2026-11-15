import { flyLaunch } from "./launch-flow.mjs";
import { chromium } from "@playwright/test";
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
await page.getByRole("button", { name: /Lunar sandbox/ }).click();
await page.getByRole("button", { name: "Enter the assembly bay" }).click();
await page.waitForTimeout(1500);
await page.screenshot({
  path: "/private/tmp/one-last-signal-build.png",
  fullPage: true,
});
await page.getByRole("button", { name: "Load reference" }).click();
await page.getByRole("button", { name: "Review mission" }).click();
await flyLaunch(page);
await page.getByLabel("Simulation speed").selectOption("600");
await page.getByLabel("Auto operator").check();
await page.waitForTimeout(3000);
await page.screenshot({
  path: "/private/tmp/one-last-signal-flight.png",
  fullPage: true,
});
await page
  .getByRole("button", { name: "End mission & inspect results" })
  .click();
await page
  .getByRole("button", { name: "Compute automated comparison" })
  .click();
await page.getByRole("button", { name: "Redesign & fly again" }).click();
await page.getByRole("button", { name: "Save design", exact: true }).click();
await page.getByRole("button", { name: "Load saved" }).click();
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({
  path: "/private/tmp/one-last-signal-mobile.png",
  fullPage: true,
});
console.log(
  JSON.stringify({
    errors,
    overflow: await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    title: await page.title(),
  }),
);
await browser.close();
if (errors.length) process.exitCode = 1;
