import { expect } from "@playwright/test";
export async function dismissCoach(page) {
  const skip = page.getByRole("button", {
    name: "Skip walkthrough",
    exact: true,
  });
  if (await skip.isVisible()) await skip.click();
}
export async function openWorkshop(page) {
  await page
    .getByRole("button", { name: "Build spacecraft & rocket", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Launch this design", exact: true }),
  ).toBeVisible();
  await dismissCoach(page);
}
export async function deployDesign(page) {
  await openWorkshop(page);
  await page
    .getByRole("button", {
      name: "Use certificate to deploy this design",
      exact: true,
    })
    .click();
  await dismissCoach(page);
}
export async function flyLaunch(
  page,
  { clock = false, capture = false, career = false } = {},
) {
  if (!career)
    await page.getByRole("button", { name: "Go to launchpad" }).click();
  await expect(
    page.getByRole("button", { name: "Start countdown" }),
  ).toBeVisible();
  await dismissCoach(page);
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
    .getByRole("button", { name: /Set course for/ })
    .click({ timeout: 60000 });
  if (clock) await page.clock.runFor(8000);
  await page
    .getByRole("button", { name: "Deploy explorer & take control" })
    .click({ timeout: 20000 });
}
