# Dicebound: The Hollow Crown

An original turn-based dice RPG for Android (and any modern browser). Lead a party
of four through the rotting kingdom of Aldermoor, resolve branching story choices
with **d20 + attribute** skill checks, and fight tactical turn-based battles to put
out the Hollow King's grey crown.

Built to run on handhelds like the **Retroid Pocket 5** as a native Android APK,
wrapped from an HTML5/TypeScript game with [Capacitor](https://capacitorjs.com/).

> **100% original content.** The setting, classes, abilities, enemies and story are
> all original. "Roll a d20 and add a modifier vs a target number" is a generic game
> mechanic, not copyrighted material. No D&D rules text or Baldur's Gate content is
> used.

## Gameplay

- **Core roll** — a d20 plus an attribute modifier vs a target number. Natural 20 always
  hits and crits (double damage dice); natural 1 always misses.
- **Four classes** — Vanguard (tank/control), Arcanist (AoE caster), Shade (crit/poison
  rogue), Warden (healer/support), each with abilities that unlock as they level.
- **Attributes** — Might, Agility, Wits, Spirit drive attacks, defense, checks and Focus.
- **A full adventure** — a town hub with a shop and inn, linked areas, branching
  dice-check choices, treasure, three bosses, XP, leveling, loot, inventory & equipment.
- **Saves** — autosaves to local storage; Continue from the title.

## Project layout

```
src/engine/   pure, testable game logic (dice, rng, character, combat, game state)
src/data/     content: classes, abilities, enemies, items, story nodes
src/main.ts   DOM UI / screen controller
www/          static shell (index.html, styles.css) + bundled app.js (built)
android/      Capacitor Android project (produces the APK)
test/         node:test engine tests + a Playwright browser smoke test
```

## Develop

```bash
npm install
npm run build      # bundle src -> www/app.js (esbuild)
npm test           # engine unit tests
# open www/index.html in a browser to play
```

## Build the APK

Requires the Android SDK (`ANDROID_SDK_ROOT` set, platform-34 & build-tools 34).

```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
# -> android/app/build/outputs/apk/debug/app-debug.apk
```

Copy the resulting `app-debug.apk` to the device and install it (enable "install from
unknown sources"). The debug APK is unsigned-for-store but installs fine for personal
side-loading.

## Play on iOS (iPhone / iPad) — no Mac, no App Store

The game is a Progressive Web App, so it installs straight to the home screen and
runs full-screen and offline — no Xcode, no Delta, no sideloading.

1. The repo includes a GitHub Pages workflow (`.github/workflows/deploy-pwa.yml`).
   One-time: the repo owner enables **Settings → Pages → Source: GitHub Actions**.
   Each push to the default branch then deploys to
   `https://<owner>.github.io/<repo>/`.
2. On the iPhone, open that Pages URL in **Safari**.
3. Tap **Share → Add to Home Screen**. Launch **Dicebound** from the new icon —
   it opens full-screen like a native app and works without a connection.

A self-contained single file is also built to `dist/dicebound-standalone.html`
(`npm run standalone`) — the entire game in one HTML file you can host on any
static host or open directly in a browser.

## Install on a Retroid Pocket 5

1. Copy `app-debug.apk` to the device (USB, SD card, or a download).
2. In Android settings, allow installing unknown apps for your file manager.
3. Tap the APK to install, then launch **Dicebound**.
4. It runs full-screen; the RP5's touchscreen drives the menu/combat UI.
