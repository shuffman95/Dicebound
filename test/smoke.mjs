import { chromium } from "playwright-core";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = "file://" + path.join(__dirname, "..", "www", "index.html");
const shotDir = path.join(__dirname, "..", "shots");
import fs from "fs";
fs.mkdirSync(shotDir, { recursive: true });

// Resolve a preinstalled Chromium across environments (the version dir varies),
// falling back to Playwright's own default if none is found.
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

const errors = [];
const exe = findChromium();
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: 412, height: 820 }, deviceScaleFactor: 2 });
page.on("console", (m) => { if (m.type() === "error") errors.push("console.error: " + m.text()); });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

const log = (...a) => console.log("•", ...a);
async function clickText(text) {
  const el = page.locator(`button:has-text(${JSON.stringify(text)})`).first();
  await el.waitFor({ state: "visible", timeout: 5000 });
  await el.click();
}
async function settle(ms = 700) { await page.waitForTimeout(ms); }
async function skipDice() {
  // tap the dice overlay if visible to speed things up
  for (let i = 0; i < 6; i++) {
    const visible = await page.locator("#dice-layer:not(.hidden)").count();
    if (!visible) break;
    await page.locator("#dice-layer").click({ force: true }).catch(() => {});
    await page.waitForTimeout(120);
  }
}

await page.goto(url);
await settle(400);
await page.screenshot({ path: path.join(shotDir, "00-splash.png") });
// dismiss the launch splash (also exercises tap-to-skip), then reveal the title
await page.locator("#splash").click({ force: true }).catch(() => {});
await settle(300);
await page.screenshot({ path: path.join(shotDir, "01-title.png") });
log("title loaded");

// exercise the accessibility settings: toggle High Contrast on, then off,
// asserting the <body> class follows each way.
await clickText("Settings");
await settle(200);
await page.locator('[data-key="highContrast"]').click();
await settle(150);
const hcOn = await page.evaluate(() => document.body.classList.contains("high-contrast"));
await page.locator('[data-key="highContrast"]').click();
await settle(120);
const hcOff = await page.evaluate(() => document.body.classList.contains("high-contrast"));
if (!hcOn || hcOff) { console.error("\n❌ accessibility toggle failed:", { hcOn, hcOff }); process.exit(1); }
await page.locator('[data-act="close-modal"]').first().click();
await settle(150);
log("accessibility toggle applied & reverted");

// language: switch to Russian, confirm the title localizes, then switch back.
await page.locator('[data-act="settings"]').click();
await settle(150);
await page.locator('[data-act="set-locale"][data-lang="ru"]').click();
await settle(150);
await page.locator('[data-act="close-modal"]').first().click();
await settle(150);
const ruText = await page.locator('[data-act="new-game"]').innerText();
if (!ruText.includes("Новое")) { console.error("\n❌ Russian locale did not apply:", ruText); process.exit(1); }
await page.locator('[data-act="settings"]').click();
await settle(150);
await page.locator('[data-act="set-locale"][data-lang="en"]').click();
await settle(150);
await page.locator('[data-act="close-modal"]').first().click();
await settle(150);
log("language toggle (en↔ru) verified");

await clickText("New Adventure");
await settle(300);
await page.screenshot({ path: path.join(shotDir, "02-setup.png") });
log("setup screen");

await clickText("Begin the Adventure");
await settle(300);
await clickText("Begin the journey");
await settle(300);
await page.screenshot({ path: path.join(shotDir, "03-town.png") });
log("reached town");

// exercise the world-deepening UI: the Journal/codex, then the Greyhollow
// commons (talk to an NPC, read a salvaged book, return to the fire).
await page.locator('[data-act="open-journal"]').click();
await settle(250);
await page.locator('[data-act="close-modal"]').first().click();
await settle(150);
await clickText("Sit with the survivors");
await settle(250);
await clickText("Talk with Maren");
await settle(200);
await clickText("Step away");
await settle(150);
await clickText("A Child's Primer");
await settle(200);
await clickText("Rejoin the fire later");
await settle(200);
log("explored commons & journal");

// open party panel to exercise that UI, then close
await page.locator('[data-act="open-party"]').click();
await settle(300);
await page.screenshot({ path: path.join(shotDir, "04-party.png") });
await page.locator('[data-act="close-modal"]').first().click();
await settle(200);

// open shop, buy nothing, leave
await clickText("Visit the apothecary");
await settle(300);
await page.screenshot({ path: path.join(shotDir, "05-shop.png") });
await page.locator('[data-act="close-modal"]').first().click();
await settle(200);

// head into the first fight
await clickText("Take the Sunken Road south");
await settle(400);
await clickText("Stand and fight");
await settle(700);
await skipDice();
await page.screenshot({ path: path.join(shotDir, "06-combat.png") });
log("combat started");

// Auto-battle: keep using the first enabled ability and targeting until resolved.
let combatGuard = 0;
let result = "unknown";
while (combatGuard++ < 120) {
  await skipDice();
  // victory?
  if (await page.locator('[data-act="victory-continue"]').count()) { result = "victory"; break; }
  // defeat / ending node?
  if (await page.locator('[data-act="to-title"]').count()) { result = "ending"; break; }
  // back on a story node (fled or finished)?
  if (await page.locator('[data-act="choice"]').count()) { result = "story"; break; }

  // if a target prompt is up, click a highlighted unit
  const targetable = page.locator(".unit.targetable, .unit.heal-target").first();
  if (await targetable.count()) { await targetable.click({ force: true }); await settle(500); continue; }

  // otherwise pick the first usable ability
  const ability = page.locator(".ability-btn:not([disabled])").first();
  if (await ability.count()) { await ability.click(); await settle(500); continue; }

  await settle(400); // enemy turn animating
}
log("combat ended with:", result, "after", combatGuard, "iterations");
await page.screenshot({ path: path.join(shotDir, "07-after-combat.png") });

await browser.close();

if (errors.length) {
  console.error("\n❌ Runtime errors detected:");
  for (const e of errors) console.error("   " + e);
  process.exit(1);
}
if (!["victory", "story", "ending"].includes(result)) {
  console.error("\n❌ Combat did not resolve (got:", result, ")");
  process.exit(1);
}
console.log("\n✅ Smoke test passed — no runtime errors, combat resolved:", result);
