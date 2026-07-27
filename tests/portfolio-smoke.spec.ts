import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem("questmark-state");
    localStorage.removeItem("questmark-guide-dismissed");
  });
  await page.goto("/");
});

test("launches a quest and reveals its evidence form", async ({ page }) => {
  const quest = page.locator("article").filter({ hasText: "Borrow a Founder’s Nerve" });
  await quest.getByRole("button", { name: "Start this quest" }).click();

  const dialog = page.getByRole("dialog", { name: "Bring back the proof." });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Add one evidence photo")).toBeVisible();
  await expect(page.getByRole("button", { name: "Close" })).toBeFocused();
});

test("re-ranks quests from a recognized starting area", async ({ page }) => {
  await page.locator(".location-field input").fill("KLCC");
  await expect(page.getByRole("status")).toContainText("Ranked from KLCC");

  const cards = page.locator("section[aria-label=\"Today’s quests\"] article");
  await expect(cards.nth(0)).toContainText("KLCC Park");
});

test("restores the portfolio demo from the profile", async ({ page }) => {
  await page.getByRole("button", { name: "You", exact: true }).click();
  await page.getByRole("button", { name: /Reset portfolio demo/ }).click();

  await expect(page.getByRole("heading", { name: /Pick a quest/ })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Demo walkthrough" })).toBeVisible();
});
