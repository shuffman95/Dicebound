# CLAUDE.md — Working agreement for Dicebound: The Hollow Crown

You are the **lead designer, gameplay programmer, systems designer, UI/UX
designer, writer, and QA lead** for *Dicebound: The Hollow Crown* — an original,
commercial-quality turn-based dice RPG, inspired by classic D&D / Baldur's Gate,
built as an installable **Progressive Web App for iPhone Safari** (also runs on
Android/desktop browsers and wraps to an APK via Capacitor).

## Hard rules
- **100% original content.** Setting (Aldermoor / the Hollowing), classes,
  abilities, items, story, art, audio are all original. "Roll a d20 + a modifier
  vs a target number" is a generic mechanic and fine; never copy D&D rules text,
  stat blocks, named spells/monsters, or Baldur's Gate content.
- **No placeholders.** No TODOs, mock data, stubbed systems, or "future feature"
  notes in committed code. Every mechanic you add must be fully implemented.
- **Be honest about scope.** This is a large, multi-session build. Ship it in
  finished, tested **installments** — never claim the whole game is "done."

## How to work (the loop that's been running)
Build in small, shippable installments. For each one:
1. Implement the engine logic first (pure, in `src/engine` + data in `src/data`).
2. Wire the UI (`src/main.ts`, styles in `www/styles.css`).
3. Keep it green: `npx tsc --noEmit` clean, `npm test` all passing, and
   `npm run smoke` (Playwright) with **zero runtime errors**.
4. Add/extend tests for the new system (engine unit tests + content-integrity
   checks that ids resolve).
5. Bump the version (`package.json` + the `VERSION` const in `src/main.ts`),
   update `CHANGELOG.md`, run `npm run standalone`. (`npm run build` auto-stamps
   the same version into `www/sw.js` so the PWA cache busts on each release —
   build before committing so the committed `sw.js` stays in sync.)
6. Commit with a clear message and **push** (this repo is your scope now).
7. Tell the user what shipped, with the test count, and what's next.

Default behavior when the user says "continue as you see fit": pick the next
roadmap item below, build it to completion as above, commit/push, and report.

## Tech / commands
- TypeScript bundled with esbuild (`npm run build` → `www/app.js`).
- `npm test` — Node test runner via tsx (engine/data only; no DOM).
- `npm run smoke` — Playwright loads `www/index.html`, plays a full encounter,
  asserts no console/page errors. Chromium is preinstalled in Claude Code web at
  `/opt/pw-browsers/...`; if launching fails, set `executablePath` accordingly.
- `npm run standalone` — single self-contained HTML at
  `dist/dicebound-standalone.html` (handy to hand the user a playable build).
- PWA: manifest + service worker + icons in `www/`; GitHub Pages workflow in
  `.github/workflows/deploy-pwa.yml` (owner enables Pages → Source: GitHub
  Actions; deploys from `main`).
- Commit message footer: `Co-Authored-By: Claude <noreply@anthropic.com>`.

## Architecture map
- `src/engine/` — `rng`, `dice`, `types`, `character`, `combat`, `loot`,
  `audio`, `game` (state/persistence). Pure and testable.
- `src/data/` — `classes`, `races`, `backgrounds`, `traits`, `abilities`,
  `talents`, `items`, `affixes`, `sets`, `enemies`, `recipes`, `quests`, `lore`,
  `story` (the node graph).
- `src/engine/i18n.ts` — localization: `t(key)` UI strings (en/ru) + locale state.
- `src/data/locale.ts` — content translations + `localizeDef(ns, def)` (used in getters).
- `src/main.ts` — screen controller / all DOM UI and input.
- `test/` — engine + content + smoke tests.

## Status (as of v1.10.0)
**Done & tested (101 tests):**
- Foundation: character creation (race/class/background/point-buy/traits), save
  slots + import/export, procedural audio + settings, loot (rarity/affixes/sets/
  durability/repair), deep talent trees (9 nodes/class, ultimates + talent-granted
  actives), 8 classes, crafting + gathering.
- Combat depth: defend/counter, elemental damage + resistances, elemental
  reactions (Shatter/Ignite + Chill), multi-phase bosses, boss auras, per-enemy
  AI personalities.
- World & story: quest + journal + lore codex; the main campaign (Sunken Road →
  Drowned Chapel → Ashen Keep → Hollow King) with optional flag-gated secrets in
  each area (the cross-area *Unhollowed* questline), plus **two** optional regions
  — the **Rimewood** (Frozen Vigil quest, Hoarfrost Knight mini-boss) and the
  **Blightfen** (Blighted Roots quest, the Rotcrowned mini-boss, poison/Ignite).
- World deepening: Greyhollow is a living hub — a recurring named cast (Maren,
  Pip, Garrow) whose Commons dialogue evolves across the campaign's three stages,
  plus readable salvaged books; and optional **examine** beats in every main area
  that uncover Aldermoor's history (codex entries), never blocking the march. The
  victory ends on a **reactive epilogue** that reflects the optional threads you
  resolved (Rimewood / Blightfen / Unhollowed), gated on flags set at each clear.

## Roadmap (continue here, in order)
1. **Content fill** — expand toward the larger spec: more enemies/abilities/items
   per region, a second optional region + boss, more side quests & secrets,
   more talents per class. Keep balance fair (no grind walls / dead skills).
2. **World deepening** — more NPC dialogue, books/journals, environmental
   storytelling, reputation-flavored choices.
3. **Productionize to v1.0** — **DONE (v1.0.0).** Accessibility pass (v0.18.0,
   Settings → Display & Accessibility), offline/PWA hardening (v0.19.0,
   version-stamped update-safe service worker), campaign-wide QA sweep (v0.20.0,
   headless story reachability + real-combat resolution for every enemy/boss), and
   a launch splash (v1.0.0). No debug code.

## Localization (in progress — continue here)
Russian language support is being built in stages behind a Settings toggle
(English default). Engine: `src/engine/i18n.ts` — `t(key)` for UI strings; content
via `src/data/locale.ts` `localizeDef(ns, def)` applied inside the getters
(getClass/getRace/getBackground/getTrait, with getItem/getAbility/getEnemy/
getQuest/getLore to follow) — English fallback throughout; locale stored in
`prefs`. **Done:** v1.1.0 title/menu, Settings, How-to-Play; v1.2.0 creation (UI +
classes/races/backgrounds/traits); v1.3.0 items/enemies/quests; v1.4.0 abilities.
All content getters (getItem/getAbility/getEnemy/getQuest/getClass/getRace/
getBackground/getTrait) are localized. **Next, in order:** (1) combat/shop/journal/
party UI chrome (`src/main.ts`) + combat-log templates in `src/engine/combat.ts`
(route through `t()`); (2) lore codex texts (localize `getLore` + entries); (3) the
full story script (`src/data/story.ts`, a custom node localizer for title/text/
choices). Keep a consistent **glossary**:
- Might→Сила, Agility→Ловкость, Wits→Разум, Spirit→Дух; Focus→Фокус; DC→СЛ; HP→ОЗ.
- Statuses: Poison→Яд, Burn→Ожог, Chill→Озноб, Stun→Оглушение, Weaken→Ослабление,
  Rally→Воодушевление, Fortify→Укрепление, Shield→Щит, Regen→Регенерация.
- Warden→Хранитель; the Hollowing→Опустошение; Hollow King→Полый Король; the
  Wardens' Oath→Клятва Хранителей. Regions: Rimewood→Морозный лес,
  Blightfen→Гнилотопь, Ashen Keep→Пепельная Цитадель, Drowned Chapel→Утонувшая
  Часовня, Sunken Road→Затонувшая Дорога. Bosses: Warden of Thorns→Хранитель
  Терний, Pale Bishop→Бледный Епископ, Hoarfrost Knight→Рыцарь Изморози,
  Rotcrowned→Гнилоувенчанная. NPCs: Maren→Марен, Pip→Пип, Garrow→Гэрроу,
  Hesken→Хескен, Sedge→Седж, Mother Wyste→Матушка Виста, Wick→Вик.
- Aldermoor→Алдермур, Greyhollow→Грейхоллоу (proper names). "Dicebound" /
  "The Hollow Crown" stay as the brand title.
- Native-speaker proofreading is welcome — flag any awkward lines to refine.

## Post-1.0 ideas
- More content: a third optional region/boss, more side quests & enemies.
- Deeper systems: reputation-flavored choices, New Game+, difficulty options.
- Polish: more procedural audio variety, additional accessibility (screen-reader
  labels), perf profiling on low-end devices.

Treat this as heading toward a paid-quality indie RPG 1.0. Quality and stability
over raw volume; depth and systems that interact.
