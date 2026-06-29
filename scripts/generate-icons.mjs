import { chromium } from "playwright-core";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "www", "icons");
fs.mkdirSync(outDir, { recursive: true });

function findChromium() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  try {
    for (const d of fs.readdirSync(base).filter((x) => x.startsWith("chromium-")).sort()) {
      const p = path.join(base, d, "chrome-linux", "chrome");
      if (fs.existsSync(p)) return p;
    }
  } catch { /* fall through */ }
  return undefined;
}
const exe = findChromium();
const browser = await chromium.launch(exe ? { executablePath: exe } : {});

// crownScale: fraction of the icon the crown glyph occupies (smaller = more safe padding for maskable)
async function makeIcon(file, size, crownScale, fullBleed) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  const radius = fullBleed ? 0 : Math.round(size * 0.22);
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;padding:0;width:${size}px;height:${size}px;overflow:hidden}
    .bg{width:${size}px;height:${size}px;border-radius:${radius}px;
      background:radial-gradient(120% 120% at 50% 18%, #2a1f3d 0%, #1a1326 55%, #0e0b14 100%);
      display:flex;align-items:center;justify-content:center;position:relative}
    .ring{position:absolute;inset:${Math.round(size*0.10)}px;border-radius:${Math.round(size*0.18)}px;
      border:${Math.max(2,Math.round(size*0.012))}px solid rgba(232,182,89,0.35)}
    .crown{font-size:${Math.round(size*crownScale)}px;line-height:1;filter:drop-shadow(0 ${Math.round(size*0.01)}px ${Math.round(size*0.03)}px rgba(0,0,0,0.6))}
  </style></head><body><div class="bg">${fullBleed ? "" : '<div class="ring"></div>'}<div class="crown">👑</div></div></body></html>`;
  await page.setContent(html);
  await page.waitForTimeout(120);
  await page.screenshot({ path: path.join(outDir, file), omitBackground: false });
  await page.close();
  console.log("wrote", file, size + "px");
}

await makeIcon("icon-512.png", 512, 0.56, false);
await makeIcon("icon-192.png", 192, 0.56, false);
await makeIcon("apple-touch-icon-180.png", 180, 0.58, true); // iOS masks corners itself -> full bleed square
await makeIcon("icon-maskable-512.png", 512, 0.44, true);     // generous safe area for Android maskable

await browser.close();
console.log("icons done");
