// Capture a clean hero screenshot for the README. Uses the system Chrome via
// puppeteer-core (no Chromium download). Seeds an API key so the settings modal
// stays closed, and forces reduced motion so entrance animations are settled.
import puppeteer from "puppeteer-core";

const EXE = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const URL = process.env.SHOT_URL || "http://localhost:3000";
const OUT = process.env.SHOT_OUT || "docs/hero.png";

const browser = await puppeteer.launch({
  headless: "new",
  executablePath: EXE,
  args: ["--no-sandbox", "--force-prefers-reduced-motion", "--hide-scrollbars"],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 760, deviceScaleFactor: 2 });
  await page.evaluateOnNewDocument(() => { try { localStorage.setItem("rt_k", "seed"); } catch (e) {} });
  await page.goto(URL, { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 900)); // let fonts/icons settle
  await page.screenshot({ path: OUT });
  console.log("saved " + OUT);
} finally {
  await browser.close();
}
