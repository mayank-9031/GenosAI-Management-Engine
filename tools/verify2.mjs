import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("tools/shots", { recursive: true });
const BASE = "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1512, height: 950 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

// 1) Support — long believable conversation
await page.goto(BASE + "/support", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const msgCount = await page.evaluate(() => document.querySelectorAll("main .rounded-xl.border").length);
await page.screenshot({ path: "tools/shots/support-2.png", fullPage: true });
console.log("support conversation bubbles visible:", msgCount);

// 2) Call transcript (call-33)
await page.goto(BASE + "/calling/call-33", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const transcriptLines = await page.evaluate(() => {
  const h = [...document.querySelectorAll("h2")].find((e) => e.textContent?.includes("Transcript"));
  return h ? (h.textContent?.match(/(\d+) lines/)?.[1] ?? "?") : "no transcript";
});
await page.screenshot({ path: "tools/shots/call-33.png", fullPage: true });
console.log("call-33 transcript lines:", transcriptLines);

// 3a) Add Lead dialog opens
await page.goto(BASE + "/leads", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.getByRole("button", { name: "Add Lead" }).click();
await page.waitForTimeout(500);
const leadDialog = await page.getByRole("dialog").isVisible();
await page.screenshot({ path: "tools/shots/add-lead-dialog.png" });
console.log("add-lead dialog visible:", leadDialog);
// Fill + submit
await page.getByPlaceholder("Jordan Rivera").fill("Test Buyer");
await page.getByPlaceholder("jordan@email.com").fill("test.buyer@email.com");
const leadsBefore = await page.evaluate(() => document.body.innerText.match(/(\d+) leads/)?.[1]);
await page.getByRole("dialog").getByRole("button", { name: "Add Lead" }).click();
await page.waitForTimeout(800);
const leadsAfter = await page.evaluate(() => document.body.innerText.match(/(\d+) leads/)?.[1]);
console.log("leads before/after add:", leadsBefore, "->", leadsAfter);

// 3b) Add Property dialog + submit
await page.goto(BASE + "/properties", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const propsBefore = await page.evaluate(() => document.querySelectorAll("main a[href^='/properties/']").length);
await page.getByRole("button", { name: "Add Property" }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: "tools/shots/add-property-dialog.png" });
await page.getByPlaceholder("Maple Residence").fill("Test Villa");
await page.getByPlaceholder("123 Maple St, Austin, TX").fill("99 Test Ave, Austin, TX");
await page.getByRole("dialog").getByRole("button", { name: "Add Property" }).click();
await page.waitForTimeout(800);
const propsAfter = await page.evaluate(() => document.querySelectorAll("main a[href^='/properties/']").length);
console.log("properties before/after add:", propsBefore, "->", propsAfter);
await page.screenshot({ path: "tools/shots/properties-2.png", fullPage: true });

console.log("console errors:", errors.length ? errors.slice(0, 8) : "none");
await browser.close();
