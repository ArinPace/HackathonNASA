import { flyLaunch } from "./launch-flow.mjs";
import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    "/Users/arainajain/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1060 } });
await page.clock.install();
await page.goto("http://127.0.0.1:5173");
await page.getByRole("button", { name: "Enter the assembly bay" }).click();
await page.getByRole("button", { name: "Load reference" }).click();
await page.getByRole("button", { name: "Review mission" }).click();
await flyLaunch(page, { clock: true });
await page.getByLabel("Simulation speed").selectOption("600");
await page.getByLabel("Auto operator").check();
await page.clock.runFor(80000);
await page.getByRole("heading", { name: "Evidence, delivered." }).waitFor();
await page.screenshot({
  path: "/private/tmp/one-last-signal-complete.png",
  fullPage: true,
});
console.log("Full six-orbit browser mission completed successfully.");
await browser.close();
