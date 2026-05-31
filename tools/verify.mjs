import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("tools/shots", { recursive: true });
const BASE = "http://localhost:3000";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1512, height: 950 } });

const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

async function shot(path, file) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `tools/shots/${file}.png`, fullPage: true });
  console.log(`shot ${path} -> ${file}.png`);
}

// Real-time check on dashboard.
await page.goto(BASE + "/dashboard", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

const feedText = async () =>
  page.evaluate(() => {
    const heads = [...document.querySelectorAll("h2")];
    const h = heads.find((e) => e.textContent?.includes("Activity Feed"));
    const card = h?.closest(".glass");
    return card ? card.innerText.slice(0, 300) : "";
  });

const t0 = await feedText();
const newLeads0 = await page.evaluate(() => document.body.innerText.match(/New Leads Today/i) ? true : false);
await page.waitForTimeout(11000); // > 2 sim ticks (4.5s each)
const t1 = await feedText();

console.log("KPI present:", newLeads0);
console.log("realtime changed:", t0 !== t1);
console.log("feed@t0:", JSON.stringify(t0.split("\n").slice(0, 3)));
console.log("feed@t1:", JSON.stringify(t1.split("\n").slice(0, 3)));

await page.screenshot({ path: "tools/shots/dashboard.png", fullPage: true });

for (const [p, f] of [
  ["/leads", "leads"],
  ["/leads/lead-1", "lead-detail"],
  ["/calling", "calling"],
  ["/calling/call-1", "call-detail"],
  ["/appointments", "appointments"],
  ["/support", "support"],
  ["/properties", "properties"],
  ["/properties/prop-1", "property-detail"],
  ["/analytics", "analytics"],
  ["/insights", "insights"],
  ["/team", "team"],
  ["/settings", "settings"],
]) {
  await shot(p, f);
}

console.log("console errors:", errors.length ? errors.slice(0, 10) : "none");
await browser.close();
