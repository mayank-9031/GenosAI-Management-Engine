import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
await p.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });
await p.waitForTimeout(1200);
await p.locator("aside").first().screenshot({ path: "tools/shots/brand.png" });
await b.close();
console.log("done");
