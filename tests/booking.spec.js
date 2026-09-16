const { test, expect } = require("@playwright/test");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");

const host = "#chicco-booking-widget";
const fixtureUrl = pathToFileURL(join(__dirname, "fixtures", "mock-host.html")).href;

async function openBooking(page) {
  await page.goto(fixtureUrl);
  await page.getByRole("button", { name: "Schedule an appointment" }).click();
  await expect(page.locator(`${host} .modal`)).toBeVisible();
}

test("patient completes a booking request from the static host", async ({ page }) => {
  const externalRequests = [];
  page.on("request", request => {
    if (!request.url().startsWith("file:")) externalRequests.push(request.url());
  });

  await openBooking(page);
  await expect(page.locator(`${host} .widget-logo`)).toHaveAttribute("src", /assets\/chicco-logo\.png$/);

  const continueButton = page.locator(`${host} .next`);
  await expect(continueButton).toBeDisabled();

  await page.locator(`${host} .branch[data-id="kanata"]`).click();
  await page.locator(`${host} .service[data-id="exam"]`).click();
  await expect(continueButton).toBeEnabled();
  await expect(continueButton).toBeVisible();
  await continueButton.click();

  await expect(page.locator(`${host} #booking-title`)).toHaveText("Pick a time that fits.");
  await page.locator(`${host} .day:not(.empty):not([disabled])`).first().click();
  await page.locator(`${host} .time`).first().click();
  await expect(continueButton).toBeEnabled();
  await continueButton.click();

  await expect(page.locator(`${host} #booking-title`)).toHaveText("A few final details.");
  await page.locator(`${host} #patient-name`).fill("Jamie Demo");
  await page.locator(`${host} #patient-email`).fill("jamie@example.com");
  await page.locator(`${host} #patient-phone`).fill("6135550123");
  await expect(continueButton).toBeEnabled();
  await continueButton.click();

  await expect(page.locator(`${host} #booking-title`)).toHaveText("You're ready, Jamie.");
  const emailHref = await page.locator(`${host} a`, { hasText: "Email booking" }).getAttribute("href");
  const smsHref = await page.locator(`${host} a`, { hasText: "Text booking" }).getAttribute("href");

  expect(emailHref).toMatch(/^mailto:pejisystems@gmail\.com\?/);
  expect(decodeURIComponent(emailHref)).toContain("Patient: Jamie Demo");
  expect(decodeURIComponent(emailHref)).toContain("Location: Kanata");
  expect(smsHref).toMatch(/^sms:3439982681\?/);
  expect(decodeURIComponent(smsHref)).toContain("jamie@example.com");
  expect(externalRequests).toEqual([]);
});

test("required choices and patient fields gate progression", async ({ page }) => {
  await openBooking(page);
  const continueButton = page.locator(`${host} .next`);

  await page.locator(`${host} .branch[data-id="downtown"]`).click();
  await expect(continueButton).toBeDisabled();
  await page.locator(`${host} .service[data-id="contacts"]`).click();
  await continueButton.click();

  await page.locator(`${host} .day:not(.empty):not([disabled])`).first().click();
  await expect(continueButton).toBeDisabled();
  await page.locator(`${host} .time`).last().click();
  await continueButton.click();

  await page.locator(`${host} #patient-name`).fill("J");
  await page.locator(`${host} #patient-email`).fill("not-an-email");
  await page.locator(`${host} #patient-phone`).fill("123");
  await expect(continueButton).toBeDisabled();

  await page.locator(`${host} #patient-name`).fill("Jordan Lee");
  await page.locator(`${host} #patient-email`).fill("jordan@example.com");
  await page.locator(`${host} #patient-phone`).fill("3439982681");
  await expect(continueButton).toBeEnabled();
});

test("Escape closes the modal and restores focus to the opener", async ({ page }) => {
  await openBooking(page);
  await page.keyboard.press("Escape");

  await expect(page.locator(`${host} .modal`)).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Schedule an appointment" })).toBeFocused();
});
