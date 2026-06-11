// Genera gli screenshot per la scheda Play Store dal sito live
import puppeteer from "puppeteer";
import { mkdirSync } from "fs";

const BASE = "https://www.lasoffittadelcollezionista.it";
const OUT = "play-store-assets";
mkdirSync(OUT, { recursive: true });

const PAGES = [
  { path: "/", name: "home", scroll: 0 },
  { path: "/products", name: "catalogo", scroll: 400 },
  { path: "/products?category=fumetti", name: "fumetti", scroll: 400 },
  { path: "/contatti", name: "contatti", scroll: 0 },
];

const DEVICES = [
  { label: "phone", width: 540, height: 960, scale: 2 },      // 1080x1920
  { label: "tablet7", width: 600, height: 960, scale: 2 },    // 1200x1920
  { label: "tablet10", width: 800, height: 1280, scale: 2 },  // 1600x2560
];

const browser = await puppeteer.launch({ headless: "new" });

for (const device of DEVICES) {
  const page = await browser.newPage();
  await page.setViewport({ width: device.width, height: device.height, deviceScaleFactor: device.scale });
  // Nascondi banner cookie e benvenuto
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem("cookie_consent", "accepted");
    localStorage.setItem("soffitta_welcome_seen", "1");
  });

  for (const p of PAGES) {
    await page.goto(BASE + p.path, { waitUntil: "networkidle2", timeout: 60000 });
    if (p.scroll) {
      await page.evaluate(s => window.scrollTo({ top: s, behavior: "instant" }), p.scroll);
    }
    await new Promise(r => setTimeout(r, 1500)); // attendi animazioni/immagini
    const file = `${OUT}/${device.label}-${p.name}.png`;
    await page.screenshot({ path: file });
    console.log(`✓ ${file}`);
  }
  await page.close();
}

await browser.close();
console.log("\nFatto! Screenshot in " + OUT);
