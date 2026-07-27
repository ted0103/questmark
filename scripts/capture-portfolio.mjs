import { chromium } from "@playwright/test";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { tmpdir } from "node:os";

const output = fileURLToPath(new URL("../docs/", import.meta.url));
const videoOutput = await mkdtemp(join(tmpdir(), "questmark-video-"));
await mkdir(output, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir: videoOutput, size: { width: 1280, height: 720 } },
});
const page = await context.newPage();
await page.addInitScript(() => {
  localStorage.removeItem("questmark-state");
  localStorage.removeItem("questmark-guide-dismissed");
});
await page.goto("http://127.0.0.1:3000");
await page.waitForTimeout(700);
await page.screenshot({ path: join(output, "questmark-quests.png"), fullPage: true });

const walkthrough = page.getByRole("button", { name: "Dismiss demo walkthrough" });
if (await walkthrough.isVisible()) await walkthrough.click();
const founderQuest = page.locator("article").filter({ hasText: "Borrow a Founder’s Nerve" });
await founderQuest.getByRole("button", { name: "Start this quest" }).click();
await page.waitForTimeout(1100);
await page.getByRole("button", { name: "Close" }).click();
await page.waitForTimeout(400);
await page.evaluate(() => window.scrollTo(0, 0));
await page.getByRole("button", { name: "Growth", exact: true }).click();
await page.waitForTimeout(1200);
await page.screenshot({ path: join(output, "questmark-growth.png") });

const recording = page.video();
await context.close();
if (recording) await recording.saveAs(join(output, "questmark-demo.webm"));
await rm(videoOutput, { recursive: true, force: true });

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.addInitScript(() => localStorage.clear());
await mobile.goto("http://127.0.0.1:3000");
await mobile.waitForTimeout(500);
await mobile.screenshot({ path: join(output, "questmark-mobile.png"), fullPage: true });
await mobile.close();
await browser.close();

console.log("Portfolio screenshots and demo video captured in docs/");
