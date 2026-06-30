# Changelog

All notable changes to Dicebound: The Hollow Crown.

## [1.4.0] — Russian: abilities (language stage 3b)

### Added
- **Every ability is now translated** into Russian — all ~75 names and
  descriptions across the eight classes, talent ultimates/granted actives, and
  enemy moves. Ability cards in the combat action bar, the talent tree, and the
  combat log's move names now read in Russian (terms follow the project glossary:
  Сила/Ловкость/Разум/Дух, Фокус, and the status names).

### In progress (staged)
- Next: the combat / shop / journal / party **UI chrome** and the combat-log
  templates; then the lore codex texts and the full story script.

### Tests
- Content-locale suite extended with a no-English-leaks sweep over every ability —
  **101 tests total**, all passing; `tsc --noEmit` clean and the smoke run reports
  zero runtime errors.

## [1.3.0] — Russian: items, enemies & quests (language stage 3a)

### Added
- **All equipment, consumables, materials, enemies and quests are now translated**
  into Russian: every item name & description, every enemy name, and every quest's
  name, summary and objective — so the shop, inventory, party panel, combat target
  labels and the quest journal read in Russian.
- Wired `localizeDef` into the item/ability/enemy/quest getters (abilities will be
  populated next), and made enemy battle emoji key off the stable id rather than
  the display name, so icons are correct in any language.

### In progress (staged)
- Next: ability names & descriptions + the combat/shop/journal UI chrome; then the
  lore codex and the full story script.

### Tests
- Content-locale suite extended (Russian items/enemies/quests, English identity,
  and a no-English-leaks sweep over every item/enemy/quest) — **99 tests total**,
  all passing; `tsc --noEmit` clean and the smoke run reports zero runtime errors.

## [1.2.1] — Ensure English is the default language

### Fixed / hardened
- Confirmed and locked that **a first-time visitor always loads in English** (the
  smoke test now asserts the fresh, no-saved-prefs menu is English before any
  interaction). The language only becomes Russian if you explicitly choose it,
  which is then remembered.
- `loadPrefs` now coerces an unknown/corrupt stored locale back to English, so a
  bad saved value can never strand the UI in another language.

## [1.2.0] — Russian: character creation (language stage 2)

### Added
- **Character creation is now fully Russian** when the language is set to Русский —
  the whole screen (headings, pickers, point-buy, buttons) plus all the content it
  shows: **every class, race, background and trait** (names, blurbs and descriptions).
- **A content-localization layer** (`src/data/locale.ts`, `localizeDef`): content
  defs are translated at the getter boundary by namespace+id, so the localized
  names/descriptions appear everywhere they're shown (creation, party panel, …),
  with English as a clean fallback for anything not yet translated.

### In progress (staged)
- Still to come: combat & shop/journal UI, then the remaining content (items,
  abilities, enemies, quests, lore), then the full story script.

### Tests
- New content-locale suite (English identity, Russian creation content, no
  English leaks in creation, fallback for unknown ids) — **95 tests total**, all
  passing; `tsc --noEmit` clean and the smoke run reports zero runtime errors.

## [1.1.0] — Localization framework + Russian (language stage 1)

### Added
- **A Language setting (English / Русский)** in Settings → the game can now be
  switched to Russian. The choice persists with your other preferences and applies
  instantly. **English remains the default.**
- **A localization engine** (`src/engine/i18n.ts`): every UI string resolves
  through `t(key)` for the active locale, falling back to English (and then the key
  itself) for anything not yet translated — so the game is never broken while
  translation is in progress.
- **Stage 1 Russian translation — the framing screens are fully localized:** the
  title/main menu, the entire Settings screen, and the How-to-Play guide.

### In progress (staged)
- This is the first stage of a full Russian localization. Still to come, in
  installments: character creation & combat UI, then all content (items,
  abilities, enemies, quests, the lore codex), then the full story script. Until
  each lands, those strings fall back to English.

### Tests
- New i18n suite (locale switching, placeholder substitution, English-parity for
  the translated keys, safe fallback) and the smoke test now switches to Russian,
  asserts the title localizes, and switches back — **91 tests total**, all passing;
  `tsc --noEmit` clean and the Playwright smoke run reports zero runtime errors.

## [1.0.0] — The Hollow Crown (1.0 release)

The first full release. Productionization is complete — accessibility, offline
PWA hardening, a green campaign-wide QA sweep, and now a launch screen — atop a
finished campaign with two optional regions, deep talent trees, and a living,
reactive world.

### Added
- **A branded launch splash.** A brief crest-and-title screen on load that fades
  into the menu. It ships in the page markup so it appears instantly before the
  bundle boots, can be **tapped to skip**, auto-dismisses, and respects the
  **Reduce motion** preference (it appears and clears without animation).

### Notes — what 1.0 contains
- Character creation (race/class/background/point-buy/traits), 8 classes with deep
  9-node talent trees and talent-granted actives, save slots + import/export.
- Tactical combat: elemental damage/resistances, reactions (Shatter/Ignite/Chill),
  defend/counter, multi-phase bosses, arena auras, per-enemy AI.
- The main campaign (Sunken Road → Drowned Chapel → Ashen Keep → Hollow King) with
  per-area secrets and a reactive epilogue; two optional regions (Rimewood,
  Blightfen); quests, journal and a deep lore codex; a living Greyhollow hub.
- Procedural audio, crafting & gathering, loot with affixes/sets/durability.
- Installable PWA (offline-capable, update-safe service worker) plus a
  single-file standalone build. Accessibility: larger text, high contrast, large
  touch targets, reduced motion.

### Tests
- **86 tests**, all passing; `tsc --noEmit` clean; Playwright smoke (now including
  the splash, accessibility toggle, commons/journal UI and a full encounter)
  reports zero runtime errors.

## [0.20.0] — Final QA sweep (Productionize milestone 3)

### Added
- **A headless campaign QA suite that actually plays the game.** It walks the
  whole story graph from the start and asserts **every non-ending node is
  reachable** and no node is a dead end, then drives **real combat through the
  engine**: every defined enemy fights to a clean resolution (no throws, no
  stalls), a leveled party defeats **every boss** — exercising multi-phase
  transitions, arena auras and elemental reactions that the unit tests never
  reached — and a representative multi-enemy encounter resolves cleanly.
- **The smoke test now exercises the world-deepening UI too**: the Journal/codex
  and the Greyhollow Commons (talking to an NPC and reading a salvaged book),
  alongside the existing accessibility-toggle and full-encounter checks.

### Notes
- The sweep found no defects — all content (regions, quests, bosses, talents,
  reactions) resolves correctly end to end.

### Tests
- **86 tests total**, all passing; `tsc --noEmit` clean and the Playwright smoke
  run reports zero runtime errors.

## [0.19.0] — Offline/PWA hardening (Productionize milestone 2)

### Fixed
- **Installed PWAs were stuck on old builds.** The service worker used a static
  cache name and a pure cache-first strategy, so once `app.js`/`styles.css` were
  cached, an installed home-screen copy would never pick up a new release. The
  cache name is now **stamped with the app version at build time** (single source
  of truth: `package.json`), so every release installs into a fresh cache and the
  `activate` step purges the previous one.

### Changed
- **Update-safe fetch strategy.** Navigations are now **network-first** (an online
  player always gets the latest deploy, with the cached shell as the offline
  fallback); other same-origin assets use **stale-while-revalidate** (instant from
  cache, refreshed in the background). Cross-origin requests are left untouched,
  and the worker accepts a `SKIP_WAITING` message to take over promptly.

### Tests
- New service-worker suite asserting the cache is versioned (no static name), the
  worker is stamped to match `package.json`, the precache lists the app shell, and
  install/activate/fetch/message handlers behave update-safely — **80 tests total**,
  all passing; `tsc --noEmit` clean and the Playwright smoke run reports zero
  runtime errors.

## [0.18.0] — Accessibility pass (Productionize milestone 1)

### Added
- **A Display & Accessibility section in Settings**, with four toggles that persist
  to local storage and apply instantly:
  - **Larger text** — scales the main reading surfaces (story, choices, lists).
  - **High contrast** — brighter ink, deeper ground and stronger lines, re-skinned
    cleanly through the theme's CSS variables.
  - **Large touch targets** — taller buttons and controls, easier to tap on a phone.
  - **Reduce motion** — minimises animations/transitions and makes the dice roll
    near-instant.
- **Automatic OS respect**: the stylesheet honours `prefers-reduced-motion: reduce`
  even before any toggle is touched.

### Tests
- New prefs unit suite (class mapping, settings-row integrity, storage round-trip,
  graceful fallback) and the **smoke test now drives the High-Contrast toggle on
  and off**, asserting the `<body>` class follows — **76 tests total**, all passing;
  `tsc --noEmit` clean and the Playwright smoke run reports zero runtime errors.

## [0.17.0] — A reactive epilogue (World deepening milestone 3)

### Added
- **The victory now reflects your journey.** When the Hollow King falls, a quiet
  denouement gathers the optional threads you actually resolved — the **Rimewood**
  freed, the **Blightfen** quieted, the **three who fled south** given their last
  page — each an optional reflection shown only if you earned it, before the true
  ending. Doing the optional content now pays off narratively, not just in loot.
- Flags set at each optional clear (`rimewood_cleared`, `blightfen_cleared`, and
  the existing Unhollowed flag) drive the reflections; the path to the ending is
  **never gated** behind optional content, so any playthrough still ends cleanly.

### Tests
- New epilogue suite: the Hollow King routes through the epilogue, each clear sets
  its flag, every reflection is gated/exists/loops back, and an ungated ending is
  always offered — **70 tests total**, all passing; `tsc --noEmit` clean and the
  Playwright smoke run reports zero runtime errors.

## [0.16.0] — Stories in the stones (World deepening milestone 2)

### Added
- **Environmental storytelling across the whole main campaign.** Every main area
  now offers an optional **examine** beat that uncovers a piece of Aldermoor's
  history without slowing the march: the drowning Old King's Road and the dead
  salt-caravans on the Sunken Road; the corrupted hymnal and the warded reliquary
  of Saint Illa in the Drowned Chapel; the frozen Iron Garrison and the grey
  candle-magic of the hollow mages in the Ashen Keep.
- **Six new codex entries**, read at the moment of discovery and kept in the
  Journal. Each examine marks itself read (flag-tracked, save-safe) so it won't
  clutter a node you've already searched, and never blocks the way forward.

### Tests
- New environs suite: every main-area node exposes its examine beat, examining
  records the right codex entry and then hides, and no beat blocks the path —
  **66 tests total**, all passing; `tsc --noEmit` clean and the Playwright smoke
  run reports zero runtime errors.

## [0.15.0] — Greyhollow comes alive (World deepening milestone 1)

### Added
- **Greyhollow is now a living hub.** A new "Sit with the survivors" option at all
  three town stages opens a **Commons** where you can talk with a recurring cast —
  **Maren** the apothecary, **Pip** the child, and **Garrow** the lamed guardsman —
  whose dialogue **evolves with the campaign**: fearful when you arrive, cautiously
  hopeful after the Warden of Thorns falls, and steeled on the last night before
  the Ashen Keep.
- **Readable salvaged books** — a small shelf you can read at the fire, adding four
  new codex entries that flesh out Aldermoor (*A Child's Primer of Aldermoor*, *The
  Greyhollow Ledger*, *The Last Almanac*, *Field-Notes of a Warden*). Reading marks
  each as read so the shelf stays tidy.
- **One optional, one-time gift** — Garrow's patrol-charm (a Warding Eye trinket)
  for those who stop to listen — gated by a flag so it can't be farmed.

### Notes
- Pure world-building: nothing here gates the main road, and all dialogue/reading
  is flag-tracked so it persists correctly across save/load.

### Tests
- New Greyhollow suite: town↔commons wiring, the full cast present and routed at
  every stage, book-reading codex unlocks, and the one-time charm gift — **63 tests
  total**, all passing; `tsc --noEmit` clean and the Playwright smoke run reports
  zero runtime errors.

## [0.14.0] — The Unhollowed (Content fill: secrets in the main campaign)

### Added
- **A new side quest, *The Unhollowed*, woven through all three main-campaign
  areas** — giving the Sunken Road, Drowned Chapel and Ashen Keep the optional
  depth the side regions already had. Maren the apothecary (now named) sends you
  to learn the fate of three Greyhollow folk who fled south; each area hides one
  discovery, in three different styles:
  - **Sunken Road** — a somber find (the Reed Mother) with loot + lore.
  - **Drowned Chapel** — a **Spirit skill check** that branches between saving the
    pilgrim (better reward) and a too-late mercy, either way advancing the tale.
  - **Ashen Keep** — an **optional fight** with a new tragic enemy, *the
    Candlewright*, that completes the quest and grants the **Pilgrim's Keepsake**.
- The secrets are **flag-gated**: they stay hidden until you accept the quest from
  Maren, and each vanishes once resolved (using the existing flag system, so they
  persist correctly across save/load).
- **Four codex entries** (Maren of Greyhollow, the Reed Mother, the Last Pilgrim,
  Wick the Candlewright) and a new reward trinket that joins the loot/shop pool.

### Tests
- New *Unhollowed* suite covering flag gating (hidden pre-quest, shown after),
  each area's discovery, quest completion + reward at the keep, and the new
  enemy/lore resolving — **58 tests total**, all passing; `tsc --noEmit` clean and
  the Playwright smoke run reports zero runtime errors.

## [0.13.0] — Deeper talent trees (Content fill: build variety)

### Added
- **Every class talent tree expanded from 6 to 9 nodes** (24 new talents total),
  keeping all existing nodes and the point economy intact (still fully spec-able
  by the level cap; no grind walls).
- **Eight new talent-granted active abilities — one per class**, so talents now
  expand a hero's kit, not just their stats: Vanguard **Crushing Blow** (heavy
  single-target + Weaken), Arcanist **Aether Lance** (single-target nuke), Shade
  **Eviscerate** (finisher), Warden **Entangle** (its first AoE crowd control),
  Berserker **Bloodbath** (sustaining AoE), Ranger **Venom Arrow** (poison, an
  Ignite enabler), Necromancer **Soul Rend** (big drain), Cleric **Sanctify**
  (party heal + Regen).
- **New passive/combat build axes** per class — e.g. a crit path for the Vanguard,
  spell-vamp for the Arcanist, a second crit stack for the Berserker, and extra
  survivability for the casters — all with real, implemented effects.

### Tests
- Extended the talent suite to assert every tree is deepened, exposes a
  non-ultimate ability talent that resolves, and that learning it actually adds
  the active to the hero's kit; the parameterized "full-spec" checks cover the
  larger trees — **54 tests total**, all passing; `tsc --noEmit` clean and the
  Playwright smoke run reports zero runtime errors.

## [0.12.0] — The Blightfen (Content fill: second optional region)

### Added
- **A second optional region — the Blightfen**, reachable from Greyhollow: an NPC
  (Old Sedge) who gives the side quest **Blighted Roots**, a branching sunken
  causeway with Agility/Might/Wits checks, a **hidden drowned stillroom** (Wits
  check) with loot and lore, two combat encounters, a gathering spot, and a
  **multi-phase mini-boss, the Rotcrowned** (Mother Wyste — poison, weak to fire,
  phases into a spore cloud with a poison aura). Built so poison-stackers + a
  fire-user can trigger **Ignite** for big bursts, mirroring the Rimewood's
  Chill/Shatter design.
- **New blight enemies** (Mire Spore, Blight Hound, Rot Shaman, Plague Thrall) and
  abilities (Blight Spit, Corrosive Touch, Miasma) that lean on Poison/Weaken.
- **New reward gear**: Mirecrown Scepter (caster weapon) from the boss, and the
  Witch's Phylactery (trinket) from the quest; both join the loot/shop pool.
- **A new consumable, the Cleansing Brew** (heals and cures Poison/Burn) plus a
  **new material, the Blightcap**, with an alchemy recipe (Blightcap + Moonherb →
  Cleansing Brew). The Brew is also stocked by the apothecary.
- **Two codex entries** (the Blightfen, the Lost Herbalist).

### Tests
- The parameterized content/story/quest/crafting integrity checks now cover the new
  region, enemies, items, recipe, quest and lore, plus a dedicated **Blightfen
  suite** (hub wiring, a full quest playthrough, and the boss's design contract) —
  **52 tests total**, all passing; `tsc --noEmit` clean and the Playwright smoke run
  reports zero runtime errors.

## [0.11.0] — The Rimewood (World & story milestone 2)

### Added
- **A new optional region — the Rimewood**, reachable from Greyhollow: an NPC
  (Old Hesken) who gives the side quest **The Frozen Vigil**, a branching frozen
  trail with Agility/Might/Wits checks, a **hidden Warden's cache** (Wits check)
  with loot and lore, two combat encounters, a gathering spot, and a **mini-boss,
  the Hoarfrost Knight** (frost, weak to fire, phases into a blizzard with an
  ice aura).
- **New frost enemies** (Frost Wisp, Rime Stalker, Frozen Thrall) and abilities
  (Frostbite, Ice Shard, Frost Nova) that lean on Chill/Shatter.
- **New reward gear**: Winter's Edge (weapon) from the boss, and Rimeheart
  (trinket) from the quest; both join the loot/shop pool.
- **Two codex entries** (the Rimewood, the Frozen Wardens).

### Tests
- Extended content integrity (enemy loot & phase-ability ids resolve); story and
  quest reachability checks cover the new region — 48 tests total, all passing.

> Note: this version was developed in the original sandbox and handed off as a
> clean project; it is the first version intended to live in its own repository.

## [0.10.0] — Quests, journal & codex (World & story milestone 1)

### Added
- **Quest system** — a tracked main quest (*The Hollow Crown*) plus side quests
  (*Echoes of the Warden*, *The Drowned Faithful*, *Silver of the Keep*) that
  start and complete through the story and pay out gold/XP/loot on completion.
- **Journal** (topbar) listing active and completed quests with summaries and
  objectives, plus a **Codex** of unlockable lore entries (the Hollowing, the
  Wardens' Oath, the Pale Bishop, the Grey Crown).
- **Toast notifications** (now stacking, non-interactive) announce quest starts,
  completions, and codex updates as you explore.
- Story choices/nodes can now start/complete quests and unlock lore via effects.

### Tests
- Quest suite (reward-once, story-driven start/complete via onEnter, save/load
  roundtrip, and integrity checks that every referenced quest/lore id exists and
  every quest is reachable) — 47 tests total, all passing.

## [0.9.0] — Combat depth II (Combat-depth milestone complete ✓)

### Added
- **Elemental reactions**:
  - **Shatter** — striking a Chilled foe with a physical or ice hit deals bonus
    damage and consumes the chill.
  - **Ignite** — a fire hit on a Poisoned foe bursts the remaining poison into
    instant fire damage.
  - Frost Lance now applies **Chill** (a slow that lowers attack and sets up
    Shatter).
- **Boss arena auras** — the Hollow King radiates the Hollowing (party-wide dark
  damage each round after phasing); the Pale Bishop's drowned whispers sap the
  party with Weaken.
- **Per-enemy AI personalities** — aggressive, tactician, support, berserker, and
  default behaviors: healers mend wounded allies, tacticians favor AoE/debuffs
  and target your casters, aggressors pick their hardest hit on your weakest hero.

### Tests
- Reaction/aura suite (Shatter, Ignite, Chill application, boss aura) — 42 tests
  total, all passing.

**Combat-depth milestone complete** (defend/counter, elements, reactions, phases,
auras, AI personalities). Next milestone: world & story scale-up.

## [0.8.0] — Combat depth I (Combat-depth milestone 1)

### Added
- **Defend action** — brace for −50% incoming damage until your next turn and
  **counterattack** melee (physical) attackers.
- **Elemental damage types** (fire/ice/lightning/poison/holy/dark) with per-enemy
  **resistances & weaknesses**; damage scales and the log calls out "Weak!" /
  "Resisted". Abilities now show an element badge.
- **Multi-phase bosses** — the Warden of Thorns, Pale Bishop, and Hollow King
  transition mid-fight (a roaring message, a self-buff, partial heal, and—where
  fitting—new abilities) when dropped below a HP threshold.
- **Smarter enemy AI** — favors AoE against a grouped party, targets the weakest
  hero, and avoids walking into a defender's counter.

### Tests
- New combat-depth suite (elemental weakness vs resistance, guard reduction &
  counters, boss phase transition, and a full mixed-class battle) — 38 tests
  total, all passing.

## [0.7.0] — Crafting & gathering (Foundation 5/5 ✓ milestone complete)

### Added
- **Crafting** at the Workshop (in the Apothecary & Smith): **Alchemy** brews
  consumables and **Smithing** forges gear, including set pieces so a crafter can
  complete a set. 12 recipes with material + gold costs and live have/need checks.
- **Gathering** — flag-gated one-time gather choices during exploration (forage
  the waystation, salvage the wagon, loot the hall, …) grant the materials that
  feed crafting; materials also drop from combat.
- Story choices now support flag filtering (requires/hide), enabling one-time
  and conditional options.

### Tests
- Crafting suite (recipe validity, insufficient-material guard, consumable &
  gear output, gold cost) and a **story-integrity** test that verifies every
  choice's target node and granted item resolves — 34 tests total, all passing.

**Foundation & systems milestone complete** (creation, saves, audio/settings,
loot, talents, classes, crafting). Next milestone: combat depth.

## [0.6.0] — Class & ability expansion (Foundation 4/5)

### Added
- **Four new playable classes**, each with a distinct kit, ability set, talent
  tree, ultimate, and starting gear:
  - **Berserker** (Might) — rage/lifesteal bruiser; ultimate *Ragnarok*.
  - **Ranger** (Agility) — ranged multi-hit & control; ultimate *Rain of Arrows*.
  - **Necromancer** (Wits) — drain/plague caster; ultimate *Apocalypse*.
  - **Cleric** (Spirit) — holy heals, shields, smite & raise dead; ultimate
    *Divine Judgment*.
- **~26 new abilities** (all mechanically distinct — no renamed duplicates),
  four new starting weapons, and four new talent trees.
- Generalized revive (abilities specify a revive %; Cleric's Resurrection brings
  allies back at 75% vs the Warden's 50%).

### Tests
- New content-integrity suite validates all 8 classes build, every ability/item
  id resolves, every talent tree's ultimate is reachable and grants a real
  ability, enemy abilities resolve, and no two abilities share a name — 29 tests
  total, all passing.

## [0.5.0] — Talent / skill trees (Foundation 3/5)

### Added
- **Per-class talent trees** (Vanguard/Arcanist/Shade/Warden), each with four
  tiers of passive nodes, combat modifiers, and a granted **ultimate ability**
  (Earthshaker, Singularity, Thousand Cuts, Sanctuary).
- **Talent points** earned 1 per level; higher tiers gate on points already
  spent in the tree. Every node has a real effect:
  - passive stat bonuses (HP/Focus/attack/damage/defense/attributes),
  - **crit-range** widening (crit on 19-20 / 18-20),
  - **lifesteal** (heal a % of damage dealt).
- Talents UI in the party panel with point counter, tier locks, and Learn
  buttons; a points-available badge surfaces when you can spend.

### Changed
- Attack rolls support a crit threshold; combat applies talent crit & lifesteal.
- Derived stats now fold in talent bonuses alongside gear.

### Tests
- New talent suite (point accrual, tier gating, ultimate unlock, crit/lifesteal,
  overspend guard) — 23 tests total, all passing.

## [0.4.0] — Loot system (Foundation 2/5)

Items are now rolled **instances**, not static ids. Every system tested.

### Added
- **Rarity tiers** (Common→Legendary) with color coding and scaling value.
- **Random affixes** — a pool of prefixes/suffixes (Vicious, Keen, Arcane,
  of the Bear, of Ruin, …) whose magnitude scales with item level; affix count
  scales with rarity. Names read like "Cruel Lifebough Staff of the Bear".
- **Item sets** (Vigil of the Warden, Emberwrought) with 2- and 3-piece bonuses.
- **Durability & repair** — equipped gear wears down each fight; broken gear
  gives half stats; the smith repairs all gear for gold.
- **Loot drops** — enemies drop rolled gear (bosses always drop rare+), plus
  materials/treasures; the shop stocks freshly generated gear per town.
- Inventory split into stackables (consumables/materials) and unique gear
  instances; equip/unequip, sell gear, and a richer party & shop UI with
  rarity colors, affix lists, durability, and set bonuses.

### Tests
- New loot test suite (affix counts, broken-gear scaling, set thresholds,
  equip stat changes, repair cost, victory wear) — 17 tests total, all passing.

## [0.3.0] — Foundation & Systems: creation, saves, audio

The first installment of the "Foundation & systems" milestone toward a
full-length RPG. Every system below is fully implemented and tested.

### Added
- **Deep character creation.** Each of the four heroes now chooses a **race**,
  **class**, **background**, a **starting trait (feat)**, and distributes
  **point-buy attribute points** — with a live preview of HP/Focus/Defense and
  active traits. Per-hero tabs, randomize, and naming.
- **Races** (6) with real mechanical effects: Aldermoorian, Sylvan Elf,
  Stoutkin, Orcborn, Feykin, Revenant.
- **Backgrounds** (6): Soldier, Scholar, Outlaw, Acolyte, Noble, Wanderer —
  each grants starting gold/items and a trait.
- **Trait system** with implemented hooks: skill-check bonuses, flat HP/Focus,
  combat focus-regen (Mana Spring), low-HP damage (Bloodrage), once-per-battle
  self-revive (Undying), and start-of-battle shield (Warded).
- **Save slots** (Auto + 3 manual) with metadata (party, level, location, gold,
  timestamp), plus **import/export** to a JSON file and robust load **validation**.
- **Procedural audio engine** (Web Audio): six adaptive music tracks
  (title/town/explore/battle/boss/victory) and a full SFX set, all synthesized
  at runtime — no audio files. iOS-autoplay-safe (unlocks on first tap).
- **Settings menu**: master/music/SFX volume sliders and mute, persisted.

### Changed
- Hero stats now fold in race + background + trait + point-buy bonuses.
- Party panel shows race, background, and active traits.

### Tests
- Engine unit tests cover hero builds, trait/race bonuses, and save
  serialize → validate → import roundtrips (10 passing).
- Browser smoke test plays a full encounter to victory with zero runtime errors.

## [0.2.0] — iOS/Android PWA
- Installable PWA: manifest, icons, offline service worker, iOS standalone meta,
  GitHub Pages deploy, single-file standalone build.

## [0.1.0] — Initial game
- Typed engine: d20 checks, 4 classes, turn-based combat, status effects,
  leveling, items/shop, branching story; Android APK via Capacitor.
