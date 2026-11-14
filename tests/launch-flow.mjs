import { expect } from "@playwright/test";
export async function flyLaunch(page, { clock = false, capture = false } = {}) {
  await page.getByRole("button", { name: "Go to launchpad" }).click();
  await page.getByRole("button", { name: "Start countdown" }).click();
  if (capture) {
    await page.waitForTimeout(5500);
    await page.screenshot({
      path: "/private/tmp/ols-rocket-liftoff.png",
      fullPage: true,
    });
  }
  if (clock) await page.clock.runFor(30000);
  const separate = page.getByRole("button", {
    name: "Separate booster",
    exact: false,
  });
  await expect(separate).toBeEnabled({ timeout: 60000 });
  await separate.click();
  if (clock) await page.clock.runFor(15000);
  await page
    .getByRole("button", { name: "Set course for the Moon" })
    .click({ timeout: 60000 });
  if (clock) await page.clock.runFor(8000);
  await page
    .getByRole("button", { name: "Deploy explorer & take control" })
    .click({ timeout: 20000 });
}
