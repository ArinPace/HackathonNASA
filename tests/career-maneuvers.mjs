import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
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
async function scenario(prefix) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1060 },
  });
  await page.addInitScript(
    ({ ids, prefix }) => {
      localStorage.setItem(
        "ols-career-v1",
        JSON.stringify({
          version: 1,
          best: Object.fromEntries(ids.slice(0, prefix).map((id) => [id, 80])),
          launchCertified: true,
        }),
      );
    },
    { ids, prefix },
  );
  await page.clock.install();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5173");
  return { page, errors };
}
const docking = await scenario(6);
await docking.page
  .getByRole("region", { name: "Career mission chapters" })
  .getByRole("button", { name: /Lab Delivery/ })
  .click();
await docking.page
  .getByRole("button", { name: /Use launch certificate/ })
  .click();
await docking.page
  .getByRole("checkbox", { name: /Docking assistance/ })
  .check();
await docking.page.clock.runFor(60000);
await expect(
  docking.page.getByRole("heading", { name: "Assignment complete." }),
).toBeVisible();
assert.deepEqual(docking.errors, []);
await docking.page.screenshot({
  path: "/private/tmp/ols-station-complete.png",
  fullPage: true,
});
await docking.page.close();
console.log("PASS: station module docks under actual motion constraints.");
const lunar = await scenario(12);
await lunar.page
  .getByRole("region", { name: "Career mission chapters" })
  .getByRole("button", { name: /First Touchdown/ })
  .click();
await lunar.page
  .getByRole("button", { name: /Use launch certificate/ })
  .click();
await lunar.page.screenshot({
  path: "/private/tmp/ols-lunar-landing.png",
  fullPage: true,
});
await lunar.page.clock.runFor(65000);
await expect(
  lunar.page.getByRole("heading", { name: "Assignment complete." }),
).toBeVisible();
assert.deepEqual(lunar.errors, []);
await lunar.page.close();
console.log("PASS: Moon descent, safe touchdown and level completion.");
const mars = await scenario(15);
await mars.page
  .getByRole("region", { name: "Career mission chapters" })
  .getByRole("button", { name: /Red Recon/ })
  .click();
await mars.page.getByRole("button", { name: /Use launch certificate/ }).click();
await mars.page.getByRole("button", { name: "Observe", exact: true }).click();
await mars.page.clock.runFor(17000);
await mars.page.getByRole("button", { name: "Send home", exact: true }).click();
await mars.page.clock.runFor(14000);
await expect(
  mars.page.getByRole("button", { name: "Complete orbital mission" }),
).toBeEnabled();
await mars.page
  .getByRole("button", { name: "Complete orbital mission" })
  .click();
await mars.page.getByRole("checkbox", { name: /Landing assistance/ }).check();
await mars.page.clock.runFor(85000);
await expect(
  mars.page.getByRole("heading", { name: "Assignment complete." }),
).toBeVisible();
await expect(mars.page.getByText(/Orbital survey complete/)).toBeVisible();
await mars.page.screenshot({
  path: "/private/tmp/ols-mars-expedition.png",
  fullPage: true,
});
assert.deepEqual(mars.errors, []);
await mars.page.close();
console.log(
  "PASS: Mars survey -> actual received evidence -> powered landing -> combined expedition result.",
);
await browser.close();
