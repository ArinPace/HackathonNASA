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
  await completeDeployment(page);
  if (
    await page
      .getByRole("heading", { name: "Burn for a stable orbit.", exact: true })
      .isVisible()
  )
    await completeNavigation(page);
  await dismissCoach(page);
}
export async function completeDeployment(page) {
  await expect(
    page.getByRole("heading", {
      name: "Release it. Keep it steady.",
      exact: true,
    }),
  ).toBeVisible();
  await dismissCoach(page);
  await page.screenshot({
    path: "/private/tmp/ols-payload-commissioning.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Start commissioning", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Jettison protective fairing", exact: true })
    .click();
  for (let i = 0; i < 160; i++) {
    const values = await page
      .locator('[data-guide="attitude-readouts"] b')
      .allTextContents();
    const angle = parseFloat(values[0]),
      rate = parseFloat(values[1]);
    if (
      (await page
        .getByRole("button", { name: "Release payload · READY", exact: true })
        .count()) > 0
    ) {
      await page
        .getByRole("button", { name: "Release payload · READY", exact: true })
        .click();
      break;
    }
    const torque =
      Math.round(Math.max(-1, Math.min(1, -0.06 * angle - 0.35 * rate)) * 20) /
      20;
    await page
      .getByRole("slider", { name: "Attitude torque", exact: true })
      .fill(String(torque));
    await page.clock.runFor(250);
  }
  await expect(
    page.getByRole("button", {
      name: "Continue after deployment",
      exact: true,
    }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Continue after deployment", exact: true })
    .click();
}
export async function completeNavigation(page) {
  await dismissCoach(page);
  await page
    .getByRole("slider", { name: "Insertion heading", exact: true })
    .fill("90");
  await page.screenshot({
    path: "/private/tmp/ols-orbit-insertion.png",
    fullPage: true,
  });
  const values = await page.locator(".maneuver-stats b").allTextContents();
  const target = parseFloat(values[1]),
    rate = target === 1600 ? 140 : target === 700 ? 70 : 105;
  await page
    .getByRole("button", { name: "Begin insertion approach", exact: true })
    .click();
  await page.clock.runFor(8100);
  await page
    .getByRole("button", { name: "Ignite insertion engine", exact: true })
    .click();
  await page.clock.runFor(Math.round((target / (rate * 0.85)) * 1000));
  await page
    .getByRole("button", { name: "Cut insertion engine", exact: true })
    .click();
  await page.clock.runFor(100);
  await expect(
    page.getByRole("button", { name: "Confirm stable orbit", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Confirm stable orbit", exact: true })
    .click();
}
export async function completeField(page, count = 2) {
  await expect(
    page.getByRole("heading", {
      name: "Touchdown was the start.",
      exact: true,
    }),
  ).toBeVisible();
  await dismissCoach(page);
  await page.screenshot({
    path: "/private/tmp/ols-rover-operation.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Start surface expedition", exact: true })
    .click();
  async function driveTo(x, y) {
    for (const axis of [0, 1]) {
      const pos = (
        await page.locator('[data-guide="rover-position"]').textContent()
      )
        .split(",")
        .map(parseFloat);
      const delta = (axis === 0 ? x : y) - pos[axis];
      const key =
        axis === 0 ? (delta >= 0 ? "d" : "a") : delta >= 0 ? "s" : "w";
      await page.keyboard.down(key);
      await page.clock.runFor((Math.abs(delta) / 36) * 1000);
      await page.keyboard.up(key);
    }
  }
  for (const [x, y] of [
    [170, 125],
    [300, 305],
    [440, 105],
    [495, 325],
  ].slice(0, count)) {
    await driveTo(x, y);
    await page
      .getByRole("button", { name: "Collect geological sample", exact: true })
      .click();
    await page.clock.runFor(4200);
    const battery = parseInt(
      await page.locator('[data-guide="rover-battery"]').textContent(),
    );
    if (battery < 60 && !(x > 350 && y < 190)) {
      await page
        .getByRole("button", {
          name: "Park & recharge in sunlight",
          exact: true,
        })
        .click();
      await page.clock.runFor(7000);
    }
  }
  await driveTo(60, 225);
  await page
    .getByRole("button", { name: "Send surface evidence", exact: true })
    .click();
  await page.clock.runFor(10000);
  await expect(
    page.getByRole("button", {
      name: "Complete surface expedition",
      exact: true,
    }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Complete surface expedition", exact: true })
    .click();
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
  if (career) await completeDeployment(page);
}
