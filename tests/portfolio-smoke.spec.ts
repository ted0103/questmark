import { expect, test } from "@playwright/test";
import { fileURLToPath } from "node:url";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("questmark-test-started")) {
      localStorage.removeItem("questmark-state");
      localStorage.removeItem("questmark-guide-dismissed");
      sessionStorage.setItem("questmark-test-started", "true");
    }
  });
  await page.goto("./");
});

test("launches a quest and reveals its evidence form", async ({ page }) => {
  const quest = page.locator("article").filter({ hasText: "Borrow a Founder’s Nerve" });
  const start = quest.locator(".stage-action");
  await expect(start).toHaveAccessibleName("Start this quest");
  await start.click();

  const dialog = page.getByRole("dialog", { name: "Bring back the proof." });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Add one evidence photo")).toBeVisible();
  await expect(page.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(start).toBeFocused();

  await start.click();
  await page.getByLabel("What did you do?").fill("I asked a founder how they made their first difficult decision.");
  await page.getByLabel("What changed in your thinking?").fill("A small specific question created a much more useful conversation.");
  await page.getByRole("button", { name: "Complete quest" }).click();
  const celebration = page.getByRole("dialog", { name: "Borrow a Founder’s Nerve" });
  await expect(celebration).toBeVisible();
  await expect(page.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(celebration).toBeHidden();
  await expect(start).toHaveAccessibleName("Quest complete");
  await expect(start).toBeFocused();
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

test("restores an evidence photo and reflection offline", async ({ page, context }) => {
  test.skip(!process.env.PLAYWRIGHT_PAGES, "export-only offline check");
  const quest = page.locator("article").filter({ hasText: "Borrow a Founder’s Nerve" });
  await quest.locator(".stage-action").click();
  await page.locator('input[type="file"]').setInputFiles(fileURLToPath(new URL("../public/icon-192.png", import.meta.url)));
  await page.getByLabel("What did you do?").fill("I asked one precise question and recorded the answer locally.");
  await page.getByLabel("What changed in your thinking?").fill("A useful story begins with a small and respectful question.");
  await page.getByRole("button", { name: "Complete quest" }).click();
  await expect(page.getByRole("dialog", { name: "Borrow a Founder’s Nerve" })).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await page.waitForFunction(() => localStorage.getItem("questmark-state")?.includes("A useful story begins"));
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: "Proof", exact: true }).click();
  const card = page.locator(".proof-card").filter({ hasText: "A useful story begins" });
  await expect(card).toBeVisible();
  await expect(card.locator("img")).toHaveAttribute("src", /^blob:/);
  await context.setOffline(false);
});
