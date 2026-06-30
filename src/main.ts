import { Game, SaveSlot } from "./engine/game.js";
import { Combat, LogEntry } from "./engine/combat.js";
import { Ability, Attr, ATTRS, Combatant, EquipSlot, HeroBuild, ItemInstance, RecipeDef, StatusEffect, StoryNode } from "./engine/types.js";
import { CLASS_LIST, CLASSES } from "./data/classes.js";
import { RACE_LIST, getRace } from "./data/races.js";
import { BACKGROUND_LIST, getBackground } from "./data/backgrounds.js";
import { getTrait, STARTING_TRAITS } from "./data/traits.js";
import { getAbility } from "./data/abilities.js";
import { getItem, ITEMS, SHOP_CONSUMABLES } from "./data/items.js";
import { getEnemy } from "./data/enemies.js";
import { RECIPE_LIST } from "./data/recipes.js";
import { QUEST_LIST, getQuest } from "./data/quests.js";
import { getLore } from "./data/lore.js";
import { CREATION_POINTS, MAX_ALLOC_PER_ATTR, createHero, effectiveAttributes, defenseOf, equippedInstances, traitsOf, classTree, talentPointsAvailable, talentPointsSpent, canLearnTalent, learnTalent } from "./engine/character.js";
import { generateGear, instanceMods, instanceName, setBonuses, sellValue, buyValue, repairCost, RARITY } from "./engine/loot.js";
import { modifier } from "./engine/dice.js";
import { describeStatus } from "./engine/combat.js";
import { audio, SfxName } from "./engine/audio.js";
import { DisplayPrefs, PrefKey, PREF_META, ALL_PREF_CLASSES, prefsBodyClasses, loadPrefs, savePrefs } from "./engine/prefs.js";

const app = document.getElementById("app")!;
const diceLayer = document.getElementById("dice-layer")!;
const diceDie = document.getElementById("dice-die")!;
const diceCaption = document.getElementById("dice-caption")!;

const game = new Game();
function sfx(n: SfxName) { audio.sfx(n); }

// ---- transient UI state ----
type SlotSetup = HeroBuild;
let setup: SlotSetup[] = defaultParty();
let creationIndex = 0; // which party member is being edited
let combatMeta: { enemies: string[]; victoryNode: string; defeatNode?: string } | null = null;
let selectedAbility: Ability | null = null;
let combatItemMode: string | null = null; // consumable id awaiting target in combat
let busy = false;

const NAME_POOL = ["Garrok", "Brannis", "Sable", "Maelis", "Corvin", "Thessa", "Roan", "Ysolde", "Dain", "Wren", "Halric", "Pip", "Auria", "Kestrel", "Bram", "Ingrid"];
function randName() { return NAME_POOL[Math.floor(Math.random() * NAME_POOL.length)]; }

function defaultParty(): SlotSetup[] {
  return [
    { classId: "vanguard", raceId: "stout", backgroundId: "soldier", name: "Garrok", allocations: {}, traitId: "tough" },
    { classId: "arcanist", raceId: "feykin", backgroundId: "scholar", name: "Maelis", allocations: {}, traitId: "sharp" },
    { classId: "shade", raceId: "sylvan", backgroundId: "outlaw", name: "Sable", allocations: {}, traitId: "fleet" },
    { classId: "warden", raceId: "aldermoorian", backgroundId: "acolyte", name: "Thessa", allocations: {}, traitId: "devout" },
  ];
}
function allocSpent(b: SlotSetup): number { return ATTRS.reduce((s, a) => s + (b.allocations[a] ?? 0), 0); }

// ---------- small helpers ----------
function esc(s: string): string { return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!)); }
function setHTML(html: string) { app.innerHTML = html; }
function pct(cur: number, max: number) { return Math.max(0, Math.min(100, (cur / Math.max(1, max)) * 100)); }
function bar(kind: "hp" | "focus" | "xp", cur: number, max: number, boss = false) {
  return `<div class="bar ${kind} ${boss ? "boss" : ""}"><span style="width:${pct(cur, max)}%"></span></div>`;
}
function delay(ms: number) { return new Promise<void>((r) => setTimeout(r, ms)); }
let activeToasts: HTMLElement[] = [];
function repositionToasts() { activeToasts.forEach((el, i) => { el.style.bottom = `${20 + i * 50}px`; }); }
function toast(msg: string, ms = 1800) {
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = msg; document.body.appendChild(t);
  activeToasts.push(t); repositionToasts();
  setTimeout(() => { t.remove(); activeToasts = activeToasts.filter((x) => x !== t); repositionToasts(); }, ms);
}

const CLASS_EMOJI: Record<string, string> = { vanguard: "🛡️", arcanist: "🔮", shade: "🗡️", warden: "🌿", berserker: "🪓", ranger: "🏹", necromancer: "💀", cleric: "✨" };
function enemyEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("rat")) return "🐀"; if (n.includes("crawler")) return "🐛"; if (n.includes("bandit")) return "🪓";
  if (n.includes("acolyte")) return "🕯️"; if (n.includes("lurker")) return "🐊";
  if (n.includes("hoarfrost")) return "🧊"; if (n.includes("wisp")) return "❄️"; if (n.includes("stalker")) return "🐺"; if (n.includes("thrall")) return "🧟";
  if (n.includes("knight")) return "⚔️";
  if (n.includes("mage")) return "🧙"; if (n.includes("warden")) return "🌿"; if (n.includes("bishop")) return "☦️";
  if (n.includes("king")) return "👑"; return "💀";
}

const ELEMENT_ICON: Record<string, string> = { fire: "🔥", ice: "❄️", lightning: "⚡", poison: "☠️", holy: "✨", dark: "🌑" };
function elementBadge(el?: string): string {
  if (!el || el === "physical" || !ELEMENT_ICON[el]) return "";
  return `<span title="${el}">${ELEMENT_ICON[el]} </span>`;
}

// ---------- dice overlay ----------
async function showDice(d: NonNullable<LogEntry["dice"]>) {
  sfx("dice");
  diceDie.textContent = String(d.d20);
  diceDie.className = "dice-die rolling" + (d.crit ? " crit" : d.fumble ? " fumble" : "");
  const verdict = d.crit ? "CRITICAL!" : d.fumble ? "FUMBLE!" : d.hit ? "Hit!" : "Miss";
  diceCaption.textContent = `d20 ${d.d20} ${d.bonus >= 0 ? "+" : ""}${d.bonus} = ${d.total}  vs  ${d.target}  ·  ${verdict}`;
  diceLayer.classList.remove("hidden");
  await raceTapOrDelay(prefs.reduceMotion ? 200 : d.crit || d.fumble ? 950 : 650);
  diceLayer.classList.add("hidden");
}
function raceTapOrDelay(ms: number) {
  return new Promise<void>((resolve) => {
    let done = false;
    const finish = () => { if (done) return; done = true; diceLayer.removeEventListener("pointerdown", finish); resolve(); };
    diceLayer.addEventListener("pointerdown", finish);
    setTimeout(finish, ms);
  });
}

// ===================================================================
// TITLE
// ===================================================================
function renderTitle() {
  selectedAbility = null; combatMeta = null;
  audio.playMusic("title");
  const canContinue = Game.hasSave();
  setHTML(`
    <div class="screen">
      <div class="title-wrap">
        <div class="crest">👑</div>
        <h1 class="title-serif">Dicebound</h1>
        <div class="sub">The Hollow Crown</div>
      </div>
      <div class="title-actions">
        ${canContinue ? `<button class="btn primary" data-act="continue">Continue</button>` : ""}
        <button class="btn ${canContinue ? "" : "primary"}" data-act="new-game">New Adventure</button>
        <button class="btn ghost" data-act="load-game">Load Game</button>
        <button class="btn ghost" data-act="settings">Settings</button>
        <button class="btn ghost" data-act="how">How to Play</button>
      </div>
      <div class="spacer"></div>
      <div class="dim" style="text-align:center;font-size:12px;padding:10px">
        v${VERSION} · an original turn-based dice RPG — roll d20 + a stat vs a target number.<br>No copyrighted content — all setting, classes & story are original.
      </div>
    </div>`);
}

const VERSION = "0.19.0";

function renderHowTo() {
  openModal("How to Play", `
    <div class="story-text">
<b>The core roll.</b> Almost everything is a d20 plus an attribute modifier versus a target number. Beat it and you succeed; a natural 20 always hits (and crits for double dice), a natural 1 always misses.

<b>Attributes.</b>
• <b>Might</b> — melee attack & damage, brawn checks.
• <b>Agility</b> — defense, finesse strikes, stealth & lockpicking.
• <b>Wits</b> — arcane attack & damage, lore & perception.
• <b>Spirit</b> — healing power, Focus pool, resolve.

<b>Combat.</b> Initiative is rolled at the start. On a hero's turn, spend <b>Focus</b> on abilities or use a basic attack for free. Drop every enemy to win; if the whole party falls, it's over (Revive, Phoenix Tears, or the Warden can save a fallen ally).

<b>Story.</b> Choices marked with a stat and DC are dice checks — your best-suited hero rolls. Win fights for XP, gold and loot; spend gold at the apothecary and rest to heal.

<b>Saving.</b> The game autosaves as you travel; use Continue from the title.
    </div>
    <div class="row center" style="margin-top:12px"><button class="btn primary small" data-act="close-modal">Got it</button></div>
  `);
}

// ===================================================================
// CHARACTER CREATION
// ===================================================================
const ATTR_LABEL: Record<Attr, string> = { might: "Might", agility: "Agility", wits: "Wits", spirit: "Spirit" };

function picker(act: string, label: string, name: string, desc: string): string {
  return `<div class="picker">
    <div class="picker-head"><span class="dim picker-label">${label}</span>
      <div class="picker-ctrls">
        <button class="btn small ghost picker-arrow" data-act="${act}" data-dir="-1">‹</button>
        <button class="btn small ghost picker-arrow" data-act="${act}" data-dir="1">›</button>
      </div>
    </div>
    <div class="picker-name gold-text">${esc(name)}</div>
    <div class="picker-desc dim">${esc(desc)}</div>
  </div>`;
}

function renderSetup() {
  const b = setup[creationIndex];
  const cls = CLASSES[b.classId];
  const race = getRace(b.raceId);
  const bg = getBackground(b.backgroundId);
  const trait = b.traitId ? getTrait(b.traitId) : undefined;
  const hero = createHero(b);
  const a = effectiveAttributes(hero);
  const spent = allocSpent(b);
  const remaining = CREATION_POINTS - spent;

  const tabs = setup.map((s, i) =>
    `<button class="crt-tab ${i === creationIndex ? "sel" : ""}" data-act="creation-tab" data-i="${i}">
      <div class="crt-emoji">${CLASS_EMOJI[s.classId]}</div><div class="crt-tname">${esc(s.name || CLASSES[s.classId].name)}</div>
    </button>`).join("");

  const allocRows = ATTRS.map((attr) => {
    const val = a[attr];
    const al = b.allocations[attr] ?? 0;
    return `<div class="alloc-row">
      <span class="alloc-name">${ATTR_LABEL[attr]}</span>
      <button class="btn small ghost alloc-btn" data-act="alloc" data-attr="${attr}" data-dir="-1" ${al <= 0 ? "disabled" : ""}>−</button>
      <span class="alloc-val">${val} <span class="dim">(${fmtMod(val)})</span></span>
      <button class="btn small ghost alloc-btn" data-act="alloc" data-attr="${attr}" data-dir="1" ${remaining <= 0 || al >= MAX_ALLOC_PER_ATTR ? "disabled" : ""}>+</button>
    </div>`;
  }).join("");

  const traitChips = traitsOf(hero).map((t) => `<div class="trait-chip"><b>${esc(t.name)}</b> — ${esc(t.description)}</div>`).join("");

  setHTML(`
    <div class="screen creation">
      <h2 class="title-serif" style="color:var(--gold);text-align:center;margin-bottom:2px">Forge Your Heroes</h2>
      <div class="dim" style="text-align:center;font-size:12.5px">Four sworn to the Wardens' Oath. Tap a slot to edit each one.</div>
      <div class="crt-tabs">${tabs}</div>

      <div class="card creation-card">
        <div class="row" style="gap:8px;align-items:center">
          <input class="name-input" id="hero-name" value="${esc(b.name)}" maxlength="14" placeholder="Name"
            style="flex:1;background:#0c0913;border:1px solid var(--line);color:var(--ink);border-radius:8px;padding:9px;font-size:15px" />
          <button class="btn small ghost" data-act="reroll-name">🎲</button>
        </div>

        ${picker("pick-class", "Class", cls.name, cls.blurb)}
        ${picker("pick-race", "Race", race.name, race.blurb)}
        ${picker("pick-bg", "Background", bg.name, bg.blurb)}
        ${picker("pick-trait", "Starting Trait", trait ? trait.name : "None", trait ? trait.description : "No extra trait.")}

        <div class="alloc-wrap">
          <div class="row" style="justify-content:space-between;align-items:center">
            <span class="dim picker-label">Allocate Points</span>
            <span class="alloc-points ${remaining > 0 ? "has" : ""}">${remaining} left</span>
          </div>
          ${allocRows}
        </div>

        <div class="derived">
          <span>❤️ ${hero.maxHP} HP</span><span>🔷 ${hero.maxFocus} Focus</span><span>🛡️ ${defenseOf(hero)} Def</span>
        </div>
        <div class="trait-list">${traitChips}</div>
      </div>

      <div class="row center" style="margin-top:6px">
        <button class="btn ghost small" data-act="reroll-hero">🎲 Randomize Hero</button>
        <button class="btn ghost small" data-act="to-title">Back</button>
      </div>
      <button class="btn primary full" data-act="begin">Begin the Adventure</button>
    </div>`);

  const nameInput = document.getElementById("hero-name") as HTMLInputElement | null;
  if (nameInput) nameInput.addEventListener("input", () => { setup[creationIndex].name = nameInput.value; updateCreationTabName(); });
}

// Lightweight tab-name refresh without a full re-render (so typing stays smooth).
function updateCreationTabName() {
  const tab = app.querySelectorAll(".crt-tab")[creationIndex];
  if (tab) { const el = tab.querySelector(".crt-tname"); if (el) el.textContent = setup[creationIndex].name || CLASSES[setup[creationIndex].classId].name; }
}

function cycleList<T extends { id: string }>(list: T[], currentId: string, dir: number): string {
  const idx = list.findIndex((x) => x.id === currentId);
  const next = (idx + dir + list.length) % list.length;
  return list[next].id;
}
function cycleTrait(currentId: string | undefined, dir: number): string | undefined {
  const opts: (string | undefined)[] = [undefined, ...STARTING_TRAITS];
  const idx = opts.findIndex((x) => x === currentId);
  const next = (idx + dir + opts.length) % opts.length;
  return opts[next];
}

// ===================================================================
// STORY / NODE
// ===================================================================
function topbar(): string {
  return `<div class="topbar">
    <div class="coins">⦿ ${game.gold}<span class="dim" style="font-weight:400"> gold</span></div>
    <div class="links">
      <button class="btn small ghost" data-act="open-journal">Journal</button>
      <button class="btn small ghost" data-act="open-party">Party</button>
      <button class="btn small ghost" data-act="save-quit">Save</button>
    </div>
  </div>`;
}

function musicForNode(id: string): "town" | "explore" {
  return id.startsWith("town") ? "town" : "explore";
}

function visibleChoices(node: StoryNode) {
  return node.choices.filter((c) =>
    (!c.requiresFlag || game.flags.has(c.requiresFlag)) &&
    (!c.hideIfFlag || !game.flags.has(c.hideIfFlag)));
}

function renderStory() {
  selectedAbility = null; combatItemMode = null;
  const node = game.currentNode();
  game.save();
  if (node.isEnding) { renderEnding(node.isEnding); return; }
  audio.playMusic(musicForNode(node.id));
  const visible = visibleChoices(node);
  const choices = visible.map((c, i) => {
    let label = c.text;
    if (c.shop) label = "🛒 " + label;
    if (c.rest) label = "🛏️ " + label;
    if (c.combat) label = "⚔️ " + label;
    if (c.check) label = "🎲 " + label;
    if (c.gather) label = "🌿 " + label;
    return `<button class="btn full" data-act="choice" data-i="${i}">${esc(label)}</button>`;
  }).join("");
  setHTML(`
    ${topbar()}
    <div class="screen">
      ${node.art ? `<div class="banner-art">${node.art}</div>` : ""}
      <h2 class="title-serif" style="color:var(--gold);text-align:center">${esc(node.title)}</h2>
      <div class="panel story-text">${esc(node.text)}</div>
      <div class="list" style="margin-top:4px">${choices}</div>
      <div class="spacer"></div>
      <div class="party-strip">${partyStrip()}</div>
    </div>`);
  // surface any quest/lore notifications triggered by entering this node
  const notes = game.drainNotifications();
  notes.forEach((n, i) => setTimeout(() => toast(n, 2400), i * 350));
}

function openJournal() {
  const entries = Object.entries(game.quests);
  const active = entries.filter(([, st]) => st === "active").map(([id]) => getQuest(id)!).filter(Boolean);
  const done = entries.filter(([, st]) => st === "completed").map(([id]) => getQuest(id)!).filter(Boolean);
  const questCard = (q: typeof active[number], complete: boolean) => `<div class="card" style="margin-bottom:8px;${complete ? "opacity:.7" : ""}">
      <div class="uname" style="font-size:15px">${complete ? "✅ " : q.type === "main" ? "★ " : "• "}${esc(q.name)} <span class="tag">${q.type}</span></div>
      <div class="idesc" style="margin:4px 0">${esc(q.summary)}</div>
      <div class="dim" style="font-size:12px">Objective: ${esc(q.objective)}${complete ? " — done" : ""}</div>
    </div>`;
  const activeHtml = active.length ? active.map((q) => questCard(q, false)).join("") : `<div class="dim">No active quests.</div>`;
  const doneHtml = done.length ? done.map((q) => questCard(q, true)).join("") : "";
  const lore = [...game.lore].map((id) => getLore(id)).filter(Boolean) as NonNullable<ReturnType<typeof getLore>>[];
  const loreHtml = lore.length ? lore.map((l) => `<button class="btn full ghost" style="text-align:left" data-act="read-lore" data-id="${l.id}">📖 ${esc(l.title)}</button>`).join("") : `<div class="dim">No codex entries yet. Explore to uncover the world's history.</div>`;
  openModal("Journal", `
    <h3 style="color:var(--gold)">Quests</h3>
    ${activeHtml}
    ${doneHtml ? `<h3 style="color:var(--gold);margin-top:12px">Completed</h3>${doneHtml}` : ""}
    <h3 style="color:var(--gold);margin-top:14px">Codex</h3>
    <div class="list">${loreHtml}</div>
    <div class="row center" style="margin-top:14px"><button class="btn primary small" data-act="close-modal">Close</button></div>
  `);
}
function openLore(id: string) {
  const l = getLore(id); if (!l) return;
  openModal(l.title, `<div class="story-text">${esc(l.text)}</div>
    <div class="row center" style="margin-top:14px"><button class="btn ghost small" data-act="open-journal">Back to Journal</button></div>`);
}

function partyStrip(): string {
  return `<div class="row" style="gap:6px;justify-content:center">` + game.party.map((m) =>
    `<div class="tag" style="${m.alive ? "" : "opacity:.4"}">${CLASS_EMOJI[m.classId!]} ${esc(m.name)} · L${m.level} · ${m.hp}/${m.maxHP}</div>`
  ).join("") + `</div>`;
}

async function handleChoice(idx: number) {
  const node = game.currentNode();
  const choice = visibleChoices(node)[idx];
  if (!choice) return;
  if (choice.shop) { openShop(); return; }
  if (choice.rest) {
    if (game.rest(20)) { toast("The party rests. Fully healed."); renderStory(); }
    else toast("Not enough gold to rest (20).");
    return;
  }
  if (choice.effects) { game.applyEffects(choice.effects); if (choice.effectsNext) game.goto(choice.effectsNext); renderStory(); return; }
  if (choice.combat) { startCombat(choice.combat); return; }
  if (choice.check) {
    busy = true;
    const { result, member } = game.performCheck(choice.check.attr, choice.check.dc);
    await showDice({ d20: result.die, bonus: result.modifier, total: result.total, target: result.dc, hit: result.success, crit: result.crit, fumble: result.fumble });
    toast(`${member.name} rolls ${choice.check.attr.toUpperCase()} — ${result.success ? "Success!" : "Failed."}`);
    busy = false;
    game.goto(result.success ? choice.check.successNode : choice.check.failNode);
    renderStory();
    return;
  }
  if (choice.goto) { game.goto(choice.goto); renderStory(); }
}

function renderEnding(kind: "victory" | "defeat") {
  const node = game.currentNode();
  Game.clearSave();
  if (kind === "victory") { audio.playMusic("victory"); sfx("victory"); } else { audio.stopMusic(); sfx("defeat"); }
  setHTML(`
    <div class="screen center-col" style="justify-content:center;text-align:center">
      <div class="big-emoji">${node.art ?? (kind === "victory" ? "🌄" : "💀")}</div>
      <h1 class="title-serif" style="color:${kind === "victory" ? "var(--gold)" : "var(--bad)"}">${esc(node.title)}</h1>
      <div class="panel story-text" style="text-align:left">${esc(node.text)}</div>
      <button class="btn primary" data-act="to-title">${kind === "victory" ? "Return to Title" : "Try Again"}</button>
    </div>`);
}

// ===================================================================
// COMBAT
// ===================================================================
function startCombat(meta: { enemies: string[]; victoryNode: string; defeatNode?: string }) {
  combatMeta = meta;
  const boss = meta.enemies.some((id) => getEnemy(id).isBoss);
  audio.playMusic(boss ? "boss" : "battle");
  game.startCombat(meta.enemies);
  selectedAbility = null; combatItemMode = null;
  renderCombat();
  if (game.combat && !game.combat.isPlayerTurn()) void runEnemyTurns();
}

function unitCard(c: Combatant, opts: { targetable?: boolean; healTarget?: boolean } = {}): string {
  const active = game.combat?.currentActor()?.id === c.id;
  const cls = ["unit", c.isPlayer ? "ally" : "enemy"];
  if (active) cls.push("active");
  if (!c.alive) cls.push("dead");
  if (opts.targetable) cls.push("targetable");
  if (opts.healTarget) cls.push("heal-target");
  const emoji = c.isPlayer ? CLASS_EMOJI[c.classId!] : enemyEmoji(c.name);
  const def = game.combat ? game.combat.defenseInCombat(c) : defenseOf(c);
  const statuses = c.statuses.map((s) => statusChip(s)).join("");
  const boss = !c.isPlayer && (game.combat?.enemies.length === 1);
  return `
  <div class="${cls.join(" ")}" data-unit="${c.id}">
    <div class="uname"><span>${emoji} ${esc(c.name)}</span><span class="lvl">${c.isPlayer ? "L" + c.level : "Def " + def}</span></div>
    <div class="nums"><span>HP ${c.hp}/${c.maxHP}</span>${c.isPlayer ? `<span>FP ${c.focus}/${c.maxFocus}</span>` : ""}</div>
    ${bar("hp", c.hp, c.maxHP, boss)}
    ${c.isPlayer ? bar("focus", c.focus, c.maxFocus) : ""}
    <div class="statuses">${statuses}</div>
  </div>`;
}
function statusChip(s: StatusEffect): string {
  const good = s.kind === "regen" || s.kind === "fortify" || s.kind === "rally" || s.kind === "guard";
  const klass = s.kind === "shield" ? "shield" : good ? "good" : "bad";
  const icon: Record<string, string> = { poison: "☠", burn: "🔥", regen: "✚", shield: "🛡", stun: "💫", weaken: "▼", fortify: "▲", rally: "⚑", guard: "🛡️", chill: "❄️" };
  const val = s.kind === "shield" ? s.magnitude : s.kind === "guard" ? "" : s.turns + "t";
  return `<span class="chip ${klass}">${icon[s.kind]}${val}</span>`;
}

function renderCombat() {
  const combat = game.combat!;
  const actor = combat.currentActor();
  const isPlayer = combat.isPlayerTurn() && actor?.alive;
  const enemies = combat.enemies.map((e) => unitCard(e, { targetable: !!selectedAbility && combat.validTargets(actor, selectedAbility).some((t) => t.id === e.id) })).join("");
  const allies = combat.players.map((p) => {
    const targetable = !!selectedAbility && combat.validTargets(actor, selectedAbility).some((t) => t.id === p.id);
    const healTarget = targetable && (selectedAbility!.kind === "heal" || selectedAbility!.kind === "buff");
    const itemTargetable = !!combatItemMode && itemValidTarget(p);
    return unitCard(p, { targetable: targetable && !healTarget || itemTargetable, healTarget });
  }).join("");

  let controls = "";
  if (selectedAbility) {
    controls = `<div class="turn-banner">Choose a target for <b>${esc(selectedAbility.name)}</b></div>
      <div class="row center"><button class="btn small ghost" data-act="cancel-target">Cancel</button></div>`;
  } else if (combatItemMode) {
    controls = `<div class="turn-banner">Use <b>${esc(getItem(combatItemMode).name)}</b> on whom?</div>
      <div class="row center"><button class="btn small ghost" data-act="cancel-item">Cancel</button></div>`;
  } else if (isPlayer) {
    controls = abilityBar(actor) + `<div class="row" style="margin-top:8px">
      <button class="btn small ghost" data-act="combat-defend">🛡 Defend</button>
      <button class="btn small ghost" data-act="combat-items">🎒 Item</button>
      <button class="btn small ghost" data-act="combat-flee">Flee</button></div>`;
  } else {
    controls = `<div class="turn-banner">${actor ? esc(actor.name) + " is acting…" : "…"}</div>`;
  }

  setHTML(`
    <div class="screen combat">
      <div class="turn-banner">Round ${combat.round} · ${esc(actor?.name ?? "")}${isPlayer ? " — your move" : ""}</div>
      <div class="enemy-zone">${enemies}</div>
      <div class="dim" style="text-align:center;font-size:11px">— vs —</div>
      <div class="party-zone">${allies}</div>
      <div id="controls">${controls}</div>
      <div class="log" id="log">${renderLog(combat.log)}</div>
    </div>`);
  const log = document.getElementById("log"); if (log) log.scrollTop = log.scrollHeight;
}

function abilityBar(actor: Combatant): string {
  const combat = game.combat!;
  const btns = actor.abilities.map((id) => {
    const ab = getAbility(id);
    const usable = combat.abilityUsable(actor, ab);
    const cd = actor.cooldowns[id] ?? 0;
    const cost = ab.focusCost > 0 ? `<span class="cost">${ab.focusCost} FP</span>` : `<span class="cost">free</span>`;
    return `<button class="ability-btn" data-act="ability" data-ab="${id}" ${usable ? "" : "disabled"}>
      <div class="an">${elementBadge(ab.element)}${esc(ab.name)} ${cd > 0 ? `<span class="cd-pill">CD ${cd}</span>` : cost}</div>
      <div class="ad">${esc(ab.description)}</div>
    </button>`;
  }).join("");
  return `<div class="ability-bar">${btns}</div>`;
}

function renderLog(log: LogEntry[]): string {
  return log.slice(-40).map((e) => `<div class="e ${e.kind}">${esc(e.text)}</div>`).join("");
}

function onAbilityPicked(id: string) {
  const combat = game.combat!;
  const actor = combat.currentActor();
  const ab = getAbility(id);
  if (!combat.abilityUsable(actor, ab)) return;
  // no explicit target needed?
  if (ab.target === "self" || ab.target === "all-enemies" || ab.target === "all-allies") {
    void doPlayerAct(id, undefined);
    return;
  }
  const targets = combat.validTargets(actor, ab);
  if (targets.length === 1) { void doPlayerAct(id, targets[0].id); return; }
  selectedAbility = ab;
  renderCombat();
}

async function doPlayerAct(abilityId: string, targetId?: string) {
  if (busy) return;
  busy = true;
  const combat = game.combat!;
  const actor = combat.currentActor();
  const entries = combat.act(actor.id, abilityId, targetId);
  selectedAbility = null;
  await playEntries(entries);
  busy = false;
  await postTurn();
}

async function doDefend() {
  if (busy) return;
  busy = true;
  const combat = game.combat!;
  const entries = combat.defend(combat.currentActor().id);
  sfx("ability");
  await playEntries(entries);
  busy = false;
  await postTurn();
}

async function playEntries(entries: LogEntry[]) {
  for (const e of entries) {
    if (e.dice) {
      await showDice(e.dice);
      sfx(e.dice.crit ? "crit" : e.dice.hit ? "hit" : "miss");
      await delay(80);
    } else if (e.kind === "heal") { sfx("heal"); await delay(120); }
    else if (e.kind === "death" || e.kind === "crit") await delay(220);
  }
  if (game.combat) renderCombat();
  flashFromEntries(entries);
}

function flashFromEntries(entries: LogEntry[]) {
  // best-effort visual feedback based on log text matching unit names
  for (const e of entries) {
    if (e.kind === "damage" || e.kind === "crit") flashUnitsByText(e.text, "hitflash");
    if (e.kind === "heal") flashUnitsByText(e.text, "healflash");
  }
}
function flashUnitsByText(text: string, cls: string) {
  if (!game.combat) return;
  for (const c of [...game.combat.players, ...game.combat.enemies]) {
    if (text.includes(c.name)) {
      const el = app.querySelector(`[data-unit="${c.id}"]`);
      if (el) { el.classList.remove(cls); void (el as HTMLElement).offsetWidth; el.classList.add(cls); }
    }
  }
}

async function runEnemyTurns() {
  const combat = game.combat!;
  while (!combat.ended && !combat.isPlayerTurn()) {
    renderCombat();
    await delay(420);
    const entries = combat.enemyAct();
    await playEntries(entries);
    await delay(120);
  }
  await postTurn();
}

async function postTurn() {
  const combat = game.combat!;
  if (combat.ended) { await endCombat(); return; }
  if (!combat.isPlayerTurn()) { await runEnemyTurns(); return; }
  renderCombat();
}

async function endCombat() {
  const combat = game.combat!;
  const winner = combat.isOver();
  await delay(400);
  if (winner === "players") {
    game.resolveVictory(combatMeta!.enemies);
    renderVictory();
  } else {
    // defeat
    if (combatMeta?.defeatNode) { game.goto(combatMeta.defeatNode); renderStory(); }
    else { game.goto("ending_defeat"); renderStory(); }
  }
  game.combat = null;
}

function renderVictory() {
  const r = game.pendingRewards!;
  audio.playMusic("victory");
  sfx(r.levelUps.length ? "levelup" : "victory");
  const gearLoot = r.gearItems.map((inst) => gearCard(inst, "")).join("");
  const stackLoot = r.stackItems.map((id) => `<div class="li"><div class="grow"><span class="iname">${esc(getItem(id).name)}</span><div class="idesc">${esc(getItem(id).description)}</div></div></div>`).join("");
  const loot = (gearLoot + stackLoot) || `<div class="dim">No loot dropped.</div>`;
  const ups = r.levelUps.length ? r.levelUps.map((u) => {
    const newAbs = u.result.newAbilities.map((a) => getAbility(a).name).join(", ");
    return `<div class="lvlup">⬆ ${esc(u.name)} reached Level ${u.result.newLevel}! (+${u.result.hpGain} HP, +${u.result.focusGain} FP${newAbs ? `, learned ${esc(newAbs)}` : ""})</div>`;
  }).join("") : "";
  setHTML(`
    <div class="screen center-col" style="justify-content:center">
      <div class="big-emoji">🏆</div>
      <h1 class="title-serif" style="color:var(--gold)">Victory!</h1>
      <div class="panel" style="width:100%">
        <div class="row" style="justify-content:space-around"><div><span class="gold-text">+${r.xp}</span> XP</div><div><span class="gold-text">+${r.gold}</span> gold</div></div>
        ${ups ? `<div style="margin-top:10px">${ups}</div>` : ""}
        <h3 style="margin-top:12px;color:var(--gold)">Spoils</h3>
        <div class="list">${loot}</div>
      </div>
      <button class="btn primary" data-act="victory-continue">Continue</button>
    </div>`);
}

// ---- items in combat ----
function itemValidTarget(c: Combatant): boolean {
  if (!combatItemMode) return false;
  const item = getItem(combatItemMode);
  const con = item.consumable!;
  if (con.reviveHpPercent) return !c.alive;
  return c.alive;
}
function openCombatItems() {
  const consumables = Object.keys(game.stacks).map(getItem).filter((it) => it.consumable);
  if (consumables.length === 0) { toast("No usable items."); return; }
  const list = consumables.map((it) => `<div class="li"><div class="grow"><span class="iname">${esc(it.name)}</span> <span class="dim">×${game.stacks[it.id]}</span><div class="idesc">${esc(it.description)}</div></div>
    <button class="btn small" data-act="combat-item-pick" data-item="${it.id}">Use</button></div>`).join("");
  openModal("Use an Item", `<div class="list">${list}</div><div class="row center" style="margin-top:10px"><button class="btn ghost small" data-act="close-modal">Back</button></div>`);
}
async function useCombatItem(itemId: string, target: Combatant) {
  closeModal();
  const combat = game.combat!;
  const item = getItem(itemId);
  const con = item.consumable!;
  let msg = "";
  if (con.reviveHpPercent && !target.alive) { target.alive = true; target.hp = Math.max(1, Math.floor(target.maxHP * con.reviveHpPercent / 100)); msg = `${target.name} is revived!`; }
  else if (target.alive) {
    if (con.heal) { const amt = Math.min(rollNote(con.heal), target.maxHP - target.hp); target.hp += amt; msg = `${target.name} heals ${amt} HP.`; }
    if (con.restoreFocus) { const amt = Math.min(con.restoreFocus, target.maxFocus - target.focus); target.focus += amt; msg = `${target.name} restores ${amt} Focus.`; }
    if (con.cureStatus) { target.statuses = target.statuses.filter((s) => !con.cureStatus!.includes(s.kind)); msg = `${target.name} is cleansed.`; }
    if (con.applyStatus) { target.statuses.push({ ...con.applyStatus }); msg = `${target.name} gains ${describeStatus(con.applyStatus)}.`; }
  } else { toast("Invalid target."); return; }
  game.removeItem(itemId);
  combatItemMode = null;
  combat.pushLog(`🎒 ${item.name}: ${msg}`, "heal");
  busy = true;
  renderCombat();
  await delay(300);
  combat.endTurnManually();
  busy = false;
  await postTurn();
}
function rollNote(notation: string): number {
  const m = notation.replace(/\s/g, "").match(/^(\d*)d(\d+)([+-]\d+)?$/i);
  if (!m) return 0;
  const count = m[1] === "" ? 1 : parseInt(m[1], 10);
  const sides = parseInt(m[2], 10);
  const mod = m[3] ? parseInt(m[3], 10) : 0;
  let total = mod;
  for (let i = 0; i < count; i++) total += 1 + Math.floor(Math.random() * sides);
  return Math.max(0, total);
}

// ===================================================================
// ITEM RENDERING HELPERS
// ===================================================================
const STAT_LABEL: Record<string, string> = { attackBonus: "atk", damageBonus: "dmg", defenseBonus: "def", hpBonus: "HP", focusBonus: "FP", might: "MGT", agility: "AGI", wits: "WIT", spirit: "SPR" };
function instModSummary(inst: ItemInstance): string {
  const m = instanceMods(inst);
  const parts: string[] = [];
  for (const k of ["attackBonus", "damageBonus", "defenseBonus", "hpBonus", "focusBonus"] as const) if (m[k]) parts.push(`+${m[k]} ${STAT_LABEL[k]}`);
  if (m.attrBonus) for (const a of ATTRS) if (m.attrBonus[a]) parts.push(`+${m.attrBonus[a]} ${STAT_LABEL[a]}`);
  return parts.join(", ");
}
function durabilityTag(inst: ItemInstance): string {
  if (inst.maxDurability <= 0) return "";
  const ratio = inst.durability / inst.maxDurability;
  const col = inst.durability <= 0 ? "var(--bad)" : ratio < 0.3 ? "#e7a14a" : "var(--ink-dim)";
  const broken = inst.durability <= 0 ? " ⚠ broken" : "";
  return `<span class="dim" style="color:${col};font-size:11px">⛭ ${inst.durability}/${inst.maxDurability}${broken}</span>`;
}
function instName(inst: ItemInstance): string {
  const def = getItem(inst.defId);
  const set = def.setId ? ` <span class="tag set-tag">set</span>` : "";
  return `<span style="color:${RARITY[inst.rarity].color};font-weight:700">${esc(instanceName(inst))}</span>${set}`;
}
function gearCard(inst: ItemInstance, action: string): string {
  const def = getItem(inst.defId);
  const affixes = inst.affixes.length ? `<div class="idesc" style="color:#c9b6e8">${inst.affixes.map((a) => esc(a.name)).join(" · ")}</div>` : "";
  return `<div class="li gear-li">
    <div class="grow">
      ${instName(inst)} <span class="tag">${def.slot}</span> <span class="tag" style="color:${RARITY[inst.rarity].color}">${RARITY[inst.rarity].label}</span>
      <div class="idesc">${esc(instModSummary(inst) || def.description)}</div>
      ${affixes}
      <div>${durabilityTag(inst)}</div>
    </div>${action}</div>`;
}

// ===================================================================
// SHOP
// ===================================================================
let shopGear: { node: string; items: ItemInstance[] } | null = null;
function ensureShopGear() {
  if (shopGear && shopGear.node === game.nodeId) return;
  const lvl = game.partyLevel();
  const items: ItemInstance[] = [];
  const count = 5;
  for (let i = 0; i < count; i++) items.push(generateGear(game.rng, { level: lvl + 1 }));
  shopGear = { node: game.nodeId, items };
}

function openShop() {
  ensureShopGear();
  const consumables = SHOP_CONSUMABLES.map((id) => {
    const it = getItem(id);
    const afford = game.gold >= it.price;
    return `<div class="li"><div class="grow"><span class="iname">${esc(it.name)}</span><div class="idesc">${esc(it.description)}</div></div>
      <div style="text-align:right"><div class="price">${it.price}g</div><button class="btn small ${afford ? "primary" : ""}" data-act="buy-consumable" data-id="${id}" ${afford ? "" : "disabled"}>Buy</button></div></div>`;
  }).join("");
  const gearWares = shopGear!.items.length ? shopGear!.items.map((inst) => {
    const cost = buyValue(inst);
    const afford = game.gold >= cost;
    return gearCard(inst, `<div style="text-align:right"><div class="price">${cost}g</div><button class="btn small ${afford ? "primary" : ""}" data-act="buy-gear" data-uid="${inst.uid}" ${afford ? "" : "disabled"}>Buy</button></div>`);
  }).join("") : `<div class="dim">Sold out for now.</div>`;

  const sellStacks = Object.keys(game.stacks).filter((id) => (getItem(id).price || 0) > 0).map((id) => {
    const it = getItem(id);
    return `<div class="li"><div class="grow"><span class="iname">${esc(it.name)}</span> <span class="dim">×${game.stacks[id]}</span></div>
      <button class="btn small ghost" data-act="sell-stack" data-id="${id}">Sell ${Math.max(1, Math.floor((it.price || 2) / 2))}g</button></div>`;
  }).join("");
  const sellGear = game.gear.map((inst) => gearCard(inst, `<button class="btn small ghost" data-act="sell-gear" data-uid="${inst.uid}">Sell ${sellValue(inst)}g</button>`)).join("");
  const sellBlock = (sellStacks + sellGear) || `<div class="dim">Nothing to sell.</div>`;

  const repCost = game.repairAllCost();

  openModal(`Apothecary & Smith — ⦿ ${game.gold}g`, `
    <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:6px">
      <button class="btn small ghost" data-act="open-crafting">🛠 Workshop</button>
      <button class="btn small ${repCost > 0 && game.gold >= repCost ? "primary" : ""}" data-act="repair-all" ${repCost > 0 && game.gold >= repCost ? "" : "disabled"}>${repCost > 0 ? `Repair all — ${repCost}g` : "All gear repaired"}</button>
    </div>
    <h3 style="color:var(--gold)">Equipment</h3>
    <div class="list">${gearWares}</div>
    <h3 style="color:var(--gold);margin-top:14px">Provisions</h3>
    <div class="list">${consumables}</div>
    <h3 style="color:var(--gold);margin-top:14px">Sell</h3>
    <div class="list">${sellBlock}</div>
    <div class="row center" style="margin-top:14px"><button class="btn primary small" data-act="close-modal">Leave</button></div>
  `);
}

// ===================================================================
// CRAFTING
// ===================================================================
function recipeRow(r: RecipeDef): string {
  const out = getItem(r.output.defId);
  const can = game.canCraft(r);
  const inputs = r.inputs.map((inp) => {
    const have = game.stackCount(inp.defId);
    const ok = have >= inp.qty;
    return `<span style="color:${ok ? "var(--ink-dim)" : "var(--bad)"}">${esc(getItem(inp.defId).name)} ${have}/${inp.qty}</span>`;
  }).join(" · ");
  const gold = r.goldCost ? ` · <span style="color:${game.gold >= r.goldCost ? "var(--ink-dim)" : "var(--bad)"}">${r.goldCost}g</span>` : "";
  const outName = out.slot ? `<span style="color:${RARITY.common.color}">${esc(out.name)}</span> <span class="tag">${out.slot}</span>` : esc(out.name);
  return `<div class="li"><div class="grow">
      <div class="iname">${outName}${r.output.qty > 1 ? ` ×${r.output.qty}` : ""}</div>
      <div class="idesc">${esc(r.description)}</div>
      <div class="idesc">Needs: ${inputs}${gold}</div>
    </div>
    <button class="btn small ${can ? "primary" : ""}" data-act="craft" data-recipe="${r.id}" ${can ? "" : "disabled"}>Craft</button></div>`;
}
function openCrafting() {
  const alchemy = RECIPE_LIST.filter((r) => r.station === "alchemy").map(recipeRow).join("");
  const smithing = RECIPE_LIST.filter((r) => r.station === "smithing").map(recipeRow).join("");
  const mats = Object.keys(game.stacks).map(getItem).filter((it) => it.kind === "material");
  const matLine = mats.length ? mats.map((it) => `<span class="tag">${esc(it.name)} ×${game.stacks[it.id]}</span>`).join(" ") : `<span class="dim">No materials yet — win fights and gather to collect them.</span>`;
  openModal(`Workshop — ⦿ ${game.gold}g`, `
    <div style="margin-bottom:8px;display:flex;gap:5px;flex-wrap:wrap">${matLine}</div>
    <h3 style="color:var(--gold)">⚗️ Alchemy</h3>
    <div class="list">${alchemy}</div>
    <h3 style="color:var(--gold);margin-top:14px">🔨 Smithing</h3>
    <div class="list">${smithing}</div>
    <div class="row center" style="margin-top:14px"><button class="btn ghost small" data-act="open-shop-back">Back</button></div>
  `);
}

// ===================================================================
// PARTY / INVENTORY MANAGEMENT
// ===================================================================
function openParty() {
  const members = game.party.map((m, mi) => {
    const a = effectiveAttributes(m);
    const xp = game.xpProgress(m);
    const eq = (["weapon", "armor", "trinket"] as EquipSlot[]).map((slot) => {
      const inst = m.equipment[slot];
      const inner = inst
        ? `<div style="color:${RARITY[inst.rarity].color};font-weight:600;font-size:12px;line-height:1.2">${esc(instanceName(inst))}</div>${durabilityTag(inst)}`
        : `<div class="dim">—</div>`;
      return `<button class="slot ${inst ? "filled" : ""}" data-act="change-equip" data-member="${mi}" data-slot="${slot}">
        <div class="dim" style="font-size:10px;text-transform:uppercase">${slot}</div>${inner}</button>`;
    }).join("");
    const setInfo = setBonuses(equippedInstances(m)).active;
    const setChips = setInfo.map((s) => `<span class="tag" style="color:var(--gold)" title="${esc(s.desc)}">⚜ ${esc(s.name)} ${esc(s.desc)}</span>`).join(" ");
    const abilities = m.abilities.map((id) => `<span class="tag">${esc(getAbility(id).name)}</span>`).join(" ");
    const raceName = m.raceId ? getRace(m.raceId).name : "";
    const bgName = m.backgroundId ? getBackground(m.backgroundId).name : "";
    const traitChips = traitsOf(m).map((t) => `<span class="tag" title="${esc(t.description)}">✦ ${esc(t.name)}</span>`).join(" ");
    return `<div class="card" style="margin-bottom:10px">
      <div class="uname" style="font-size:16px">${CLASS_EMOJI[m.classId!]} ${esc(m.name)} <span class="dim">· L${m.level}</span></div>
      <div class="dim" style="font-size:12px;margin-top:-2px">${esc(raceName)} ${esc(CLASSES[m.classId!].name)}${bgName ? " · " + esc(bgName) : ""}</div>
      <div class="kv" style="margin:6px 0">
        <span class="k">HP</span><span>${m.hp}/${m.maxHP} ${bar("hp", m.hp, m.maxHP)}</span>
        <span class="k">Focus</span><span>${m.focus}/${m.maxFocus} ${bar("focus", m.focus, m.maxFocus)}</span>
        <span class="k">XP</span><span>${xp.current}/${xp.needed} ${bar("xp", xp.current, xp.needed)}</span>
      </div>
      <div class="cstats dim">MGT ${a.might} (${fmtMod(a.might)}) · AGI ${a.agility} (${fmtMod(a.agility)}) · WIT ${a.wits} (${fmtMod(a.wits)}) · SPR ${a.spirit} (${fmtMod(a.spirit)}) · Def ${defenseOf(m)}</div>
      <div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap">${traitChips}${setChips}</div>
      <div class="slot-row" style="margin-top:8px">${eq}</div>
      <div class="dim" style="font-size:10px;margin-top:2px">Tap a slot to change gear.</div>
      <div class="row" style="margin-top:8px;justify-content:space-between;align-items:center">
        <div style="display:flex;gap:4px;flex-wrap:wrap">${abilities}</div>
        <button class="btn small ${talentPointsAvailable(m) > 0 ? "primary" : "ghost"}" data-act="open-talents" data-member="${mi}">✦ Talents${talentPointsAvailable(m) > 0 ? ` (${talentPointsAvailable(m)})` : ""}</button>
      </div>
    </div>`;
  }).join("");
  const consumables = Object.keys(game.stacks).map(getItem).filter((it) => it.consumable);
  const materials = Object.keys(game.stacks).map(getItem).filter((it) => it.kind === "material");
  const bag = consumables.length ? consumables.map((it) => `<div class="li"><div class="grow"><span class="iname">${esc(it.name)}</span> <span class="dim">×${game.stacks[it.id]}</span><div class="idesc">${esc(it.description)}</div></div>
    <button class="btn small ghost" data-act="use-item-ooc" data-item="${it.id}">Use</button></div>`).join("") : `<div class="dim">No provisions.</div>`;
  const gearBag = game.gear.length ? game.gear.map((inst) => gearCard(inst, "")).join("") : `<div class="dim">No spare gear.</div>`;
  const matBag = materials.length ? materials.map((it) => `<span class="tag">${esc(it.name)} ×${game.stacks[it.id]}</span>`).join(" ") : "";
  openModal("Party", `
    ${members}
    <h3 style="color:var(--gold)">Provisions</h3>
    <div class="list">${bag}</div>
    <h3 style="color:var(--gold);margin-top:12px">Spare Gear</h3>
    <div class="list">${gearBag}</div>
    ${matBag ? `<h3 style="color:var(--gold);margin-top:12px">Materials</h3><div style="display:flex;gap:5px;flex-wrap:wrap">${matBag}</div>` : ""}
    <div class="row center" style="margin-top:14px"><button class="btn primary small" data-act="close-modal">Close</button></div>
  `);
}
function fmtMod(score: number) { const m = modifier(score); return m >= 0 ? `+${m}` : `${m}`; }

function openTalents(memberIdx: number) {
  const m = game.party[memberIdx];
  const tree = classTree(m);
  const avail = talentPointsAvailable(m);
  const spent = talentPointsSpent(m);
  const tiers = [...new Set(tree.map((n) => n.tier))].sort((a, b) => a - b);
  const body = tiers.map((tier) => {
    const tierNodes = tree.filter((n) => n.tier === tier);
    const req = tierNodes[0].requiresPoints;
    const locked = spent < req;
    const nodes = tierNodes.map((n) => {
      const owned = (m.talents[n.id] ?? 0) > 0;
      const learnable = canLearnTalent(m, n.id);
      const stateClass = owned ? "owned" : locked ? "locked" : learnable ? "learnable" : "unavail";
      const btn = owned
        ? `<span class="tag good">Learned</span>`
        : `<button class="btn small ${learnable ? "primary" : ""}" data-act="learn-talent" data-member="${memberIdx}" data-node="${n.id}" ${learnable ? "" : "disabled"}>Learn</button>`;
      return `<div class="talent-node ${stateClass}">
        <div class="grow"><div class="tname">${n.ultimate ? "★ " : ""}${esc(n.name)}</div><div class="tdesc">${esc(n.description)}</div></div>${btn}</div>`;
    }).join("");
    return `<div class="talent-tier">
      <div class="tier-head">Tier ${tier + 1}${req > 0 ? ` <span class="dim">· needs ${req} spent${locked ? " 🔒" : ""}</span>` : ""}</div>
      ${nodes}
    </div>`;
  }).join("");
  openModal(`${esc(m.name)} — Talents`, `
    <div class="row" style="justify-content:space-between;align-items:center">
      <div class="dim">${esc(CLASSES[m.classId!].name)} · Level ${m.level}</div>
      <div class="alloc-points ${avail > 0 ? "has" : ""}">${avail} point${avail === 1 ? "" : "s"} available</div>
    </div>
    <div class="talent-wrap">${body}</div>
    <div class="dim" style="font-size:11px;margin-top:8px">Earn 1 talent point per level. Higher tiers unlock as you spend points in the tree.</div>
    <div class="row center" style="margin-top:12px"><button class="btn ghost small" data-act="back-party">Back</button></div>
  `);
}

function openChangeEquip(memberIdx: number, slot: EquipSlot) {
  const m = game.party[memberIdx];
  const candidates = game.gear.filter((inst) => getItem(inst.defId).slot === slot);
  const cur = m.equipment[slot];
  const list = candidates.length ? candidates.map((inst) => {
    return gearCard(inst, `<button class="btn small primary" data-act="do-equip" data-member="${memberIdx}" data-uid="${inst.uid}">Equip</button>`);
  }).join("") : `<div class="dim">No spare ${slot} in the bag.</div>`;
  const equippedLine = cur ? `${instName(cur)} <span class="dim">${esc(instModSummary(cur) || getItem(cur.defId).description)}</span>` : "—";
  openModal(`${esc(m.name)} — ${slot}`, `
    <div class="card" style="margin-bottom:8px">Equipped: ${equippedLine}
      ${cur ? `<div style="margin-top:6px"><button class="btn small ghost" data-act="unequip" data-member="${memberIdx}" data-slot="${slot}">Unequip</button></div>` : ""}</div>
    <div class="list">${list}</div>
    <div class="row center" style="margin-top:12px"><button class="btn ghost small" data-act="back-party">Back</button></div>
  `);
}

function openUseItemOOC(itemId: string) {
  const item = getItem(itemId);
  const con = item.consumable!;
  const targets = con.reviveHpPercent ? game.party.filter((m) => !m.alive) : game.party.filter((m) => m.alive);
  if (targets.length === 0) { toast("No valid target."); return; }
  const list = targets.map((m) => {
    const mi = game.party.indexOf(m);
    return `<button class="btn full" data-act="do-use-ooc" data-item="${itemId}" data-member="${mi}">${CLASS_EMOJI[m.classId!]} ${esc(m.name)} — ${m.hp}/${m.maxHP} HP</button>`;
  }).join("");
  openModal(`Use ${esc(item.name)}`, `<div class="list">${list}</div><div class="row center" style="margin-top:12px"><button class="btn ghost small" data-act="back-party">Back</button></div>`);
}

// ===================================================================
// MODAL
// ===================================================================
function openModal(title: string, bodyHtml: string) {
  closeModal();
  const back = document.createElement("div");
  back.className = "modal-back"; back.id = "modal-back";
  back.innerHTML = `<div class="modal"><div class="modal-head"><h2 class="title-serif">${esc(title)}</h2><button class="btn small ghost" data-act="close-modal">✕</button></div>${bodyHtml}</div>`;
  document.body.appendChild(back);
  back.addEventListener("pointerdown", (e) => { if (e.target === back) closeModal(); });
}
function closeModal() { document.getElementById("modal-back")?.remove(); }

// ===================================================================
// EVENT DISPATCH
// ===================================================================
app.addEventListener("click", (ev) => onClick(ev));
document.body.addEventListener("click", (ev) => {
  const target = (ev.target as HTMLElement).closest("[data-act]") as HTMLElement | null;
  if (target && document.getElementById("modal-back")?.contains(target)) onClick(ev);
});

const NO_CLICK_SFX = new Set(["alloc", "pick-class", "pick-race", "pick-bg", "pick-trait", "creation-tab"]);

function onClick(ev: Event) {
  const target = (ev.target as HTMLElement).closest("[data-act]") as HTMLElement | null;
  if (!target) return;
  const act = target.dataset.act!;
  const d = target.dataset;
  if (!(target as HTMLButtonElement).disabled && !NO_CLICK_SFX.has(act)) sfx("click");
  switch (act) {
    case "new-game": setup = defaultParty(); creationIndex = 0; renderSetup(); break;
    case "continue": if (game.load()) { game.combat = null; renderStory(); } else toast("No save found."); break;
    case "load-game": renderLoadGame(); break;
    case "settings": openSettings(); break;
    case "how": renderHowTo(); break;
    case "to-title": closeModal(); renderTitle(); break;
    case "close-modal": closeModal(); break;
    // ---- character creation ----
    case "creation-tab": creationIndex = Number(d.i); renderSetup(); break;
    case "pick-class": setup[creationIndex].classId = cycleList(CLASS_LIST, setup[creationIndex].classId, Number(d.dir)); renderSetup(); break;
    case "pick-race": setup[creationIndex].raceId = cycleList(RACE_LIST, setup[creationIndex].raceId, Number(d.dir)); renderSetup(); break;
    case "pick-bg": setup[creationIndex].backgroundId = cycleList(BACKGROUND_LIST, setup[creationIndex].backgroundId, Number(d.dir)); renderSetup(); break;
    case "pick-trait": setup[creationIndex].traitId = cycleTrait(setup[creationIndex].traitId, Number(d.dir)); renderSetup(); break;
    case "alloc": doAlloc(d.attr as Attr, Number(d.dir)); break;
    case "reroll-name": setup[creationIndex].name = randName(); renderSetup(); break;
    case "reroll-hero": rerollHero(creationIndex); renderSetup(); break;
    case "begin": startNewGame(); break;
    // ---- story / combat ----
    case "choice": void handleChoice(Number(d.i)); break;
    case "open-party": openParty(); break;
    case "open-journal": openJournal(); break;
    case "read-lore": openLore(d.id!); break;
    case "save-quit": openSaveMenu(); break;
    case "ability": if (!busy) onAbilityPicked(d.ab!); break;
    case "cancel-target": selectedAbility = null; renderCombat(); break;
    case "cancel-item": combatItemMode = null; renderCombat(); break;
    case "combat-defend": if (!busy) void doDefend(); break;
    case "combat-items": openCombatItems(); break;
    case "combat-item-pick": combatItemMode = d.item!; closeModal(); renderCombat(); break;
    case "combat-flee": void tryFlee(); break;
    case "victory-continue": game.goto(combatMeta!.victoryNode); combatMeta = null; renderStory(); break;
    case "buy-consumable": if (game.buyConsumable(d.id!)) { sfx("buy"); toast("Purchased " + getItem(d.id!).name); openShop(); } else { sfx("error"); toast("Can't afford that."); } break;
    case "buy-gear": { const inst = shopGear?.items.find((g) => g.uid === d.uid); if (inst && game.buyGear(inst)) { sfx("buy"); shopGear!.items = shopGear!.items.filter((g) => g.uid !== d.uid); toast("Purchased " + instanceName(inst)); openShop(); } else { sfx("error"); toast("Can't afford that."); } break; }
    case "sell-stack": if (game.sellStack(d.id!)) { sfx("buy"); toast("Sold."); openShop(); } break;
    case "sell-gear": if (game.sellGear(d.uid!)) { sfx("buy"); toast("Sold."); openShop(); } break;
    case "repair-all": if (game.repairAll()) { sfx("buy"); toast("All gear repaired."); openShop(); } else { sfx("error"); toast("Can't afford repairs."); } break;
    case "open-crafting": openCrafting(); break;
    case "open-shop-back": openShop(); break;
    case "craft": { const r = RECIPE_LIST.find((x) => x.id === d.recipe); if (r && game.craft(r)) { sfx("buy"); game.save(); toast("Crafted " + getItem(r.output.defId).name); openCrafting(); } else { sfx("error"); toast("Missing materials."); } break; }
    case "change-equip": openChangeEquip(Number(d.member), d.slot as EquipSlot); break;
    case "do-equip": { const m = game.party[Number(d.member)]; if (game.equipInstance(m, d.uid!)) { sfx("ability"); toast("Equipped."); } openParty(); break; }
    case "unequip": { const m = game.party[Number(d.member)]; game.unequip(m, d.slot as EquipSlot); openParty(); break; }
    case "open-talents": openTalents(Number(d.member)); break;
    case "learn-talent": { const m = game.party[Number(d.member)]; if (learnTalent(m, d.node!)) { sfx("levelup"); game.save(); openTalents(Number(d.member)); } else { sfx("error"); } break; }
    case "back-party": openParty(); break;
    case "use-item-ooc": openUseItemOOC(d.item!); break;
    case "do-use-ooc": { const m = game.party[Number(d.member)]; const msg = game.useConsumableOOC(d.item!, m); toast(msg ?? "Can't use that."); openParty(); break; }
    // ---- saves / settings ----
    case "save-slot": { if (game.saveToSlot(d.slot as SaveSlot)) toast("Saved to slot " + slotLabel(d.slot as SaveSlot)); closeModal(); break; }
    case "load-slot": { if (game.loadFromSlot(d.slot as SaveSlot)) { game.combat = null; closeModal(); renderStory(); } else { sfx("error"); toast("Empty or invalid slot."); } break; }
    case "delete-slot": { Game.deleteSlot(d.slot as SaveSlot); renderLoadGameInner(); break; }
    case "export-save": exportSave(); break;
    case "import-save": importSavePrompt(); break;
    case "audio-toggle": { const k = d.key as "muted"; audio.toggleMute(); openSettings(); break; }
    case "audio-test": sfx("ability"); break;
    case "pref-toggle": { togglePref(d.key as PrefKey); openSettings(); break; }
  }
}

function doAlloc(attr: Attr, dir: number) {
  const b = setup[creationIndex];
  const cur = b.allocations[attr] ?? 0;
  if (dir > 0) { if (allocSpent(b) >= CREATION_POINTS || cur >= MAX_ALLOC_PER_ATTR) return; b.allocations[attr] = cur + 1; }
  else { if (cur <= 0) return; b.allocations[attr] = cur - 1; }
  renderSetup();
}

function rerollHero(i: number) {
  const cls = CLASS_LIST[Math.floor(Math.random() * CLASS_LIST.length)].id;
  const race = RACE_LIST[Math.floor(Math.random() * RACE_LIST.length)].id;
  const bg = BACKGROUND_LIST[Math.floor(Math.random() * BACKGROUND_LIST.length)].id;
  const trait = Math.random() < 0.8 ? STARTING_TRAITS[Math.floor(Math.random() * STARTING_TRAITS.length)] : undefined;
  const alloc: Partial<Record<Attr, number>> = {};
  let pts = CREATION_POINTS;
  while (pts > 0) { const a = ATTRS[Math.floor(Math.random() * ATTRS.length)]; if ((alloc[a] ?? 0) < MAX_ALLOC_PER_ATTR) { alloc[a] = (alloc[a] ?? 0) + 1; pts--; } }
  setup[i] = { classId: cls, raceId: race, backgroundId: bg, name: setup[i].name || randName(), allocations: alloc, traitId: trait };
}

// unit clicks (targets) handled separately
app.addEventListener("pointerdown", (ev) => {
  const unit = (ev.target as HTMLElement).closest("[data-unit]") as HTMLElement | null;
  if (!unit || !game.combat || busy) return;
  const id = unit.dataset.unit!;
  const c = [...game.combat.players, ...game.combat.enemies].find((x) => x.id === id);
  if (!c) return;
  if (selectedAbility) {
    const ok = game.combat.validTargets(game.combat.currentActor(), selectedAbility).some((t) => t.id === id);
    if (ok) void doPlayerAct(selectedAbility.id, id);
  } else if (combatItemMode) {
    if (itemValidTarget(c)) void useCombatItem(combatItemMode, c);
  }
});

async function tryFlee() {
  // 50/50 flee; failure costs the turn
  if (Math.random() < 0.5) { toast("You slip away from the fight."); game.combat = null; game.goto(combatMeta!.victoryNode); combatMeta = null; renderStory(); }
  else { toast("Couldn't escape!"); const combat = game.combat!; combat.pushLog("The party fails to flee!", "info"); busy = true; renderCombat(); await delay(300); combat.endTurnManually(); busy = false; await postTurn(); }
}

function startNewGame() {
  for (const s of setup) if (!s.name.trim()) s.name = CLASSES[s.classId].name;
  Game.clearSave();
  game.newGame(setup.map((s) => ({ ...s, name: s.name.trim() })));
  renderStory();
}

// ===================================================================
// SAVE SLOTS / LOAD GAME
// ===================================================================
function slotLabel(slot: SaveSlot): string { return slot === "auto" ? "Auto" : slot; }

function slotRow(slot: SaveSlot, mode: "load" | "save"): string {
  const meta = Game.readMeta(slot);
  const when = meta ? new Date(meta.timestamp).toLocaleString() : "";
  const info = meta
    ? `<div class="iname">${esc(meta.leader)} & party · L${meta.level}</div><div class="idesc">${esc(meta.location)} · ⦿${meta.gold} · ${esc(when)}</div>`
    : `<div class="dim">— empty —</div>`;
  const action = mode === "load"
    ? `<button class="btn small ${meta ? "primary" : ""}" data-act="load-slot" data-slot="${slot}" ${meta ? "" : "disabled"}>Load</button>`
    : `<button class="btn small primary" data-act="save-slot" data-slot="${slot}">Save</button>`;
  const del = meta ? `<button class="btn small ghost" data-act="delete-slot" data-slot="${slot}">🗑</button>` : "";
  return `<div class="li"><div class="grow"><span class="tag">${slotLabel(slot)}</span> ${info}</div>${action}${del}</div>`;
}

function renderLoadGame() {
  audio.playMusic("title");
  setHTML(`
    <div class="screen">
      <h2 class="title-serif" style="color:var(--gold);text-align:center">Load Game</h2>
      <div class="list" id="slot-list">${["auto", "1", "2", "3"].map((s) => slotRow(s as SaveSlot, "load")).join("")}</div>
      <div class="row center" style="margin-top:10px">
        <button class="btn ghost small" data-act="import-save">📥 Import</button>
        <button class="btn ghost small" data-act="to-title">Back</button>
      </div>
    </div>`);
}
function renderLoadGameInner() { const list = document.getElementById("slot-list"); if (list) list.innerHTML = ["auto", "1", "2", "3"].map((s) => slotRow(s as SaveSlot, "load")).join(""); }

function openSaveMenu() {
  openModal("Save Game", `
    <div class="list">${["1", "2", "3", "auto"].map((s) => slotRow(s as SaveSlot, "save")).join("")}</div>
    <div class="row center" style="margin-top:12px">
      <button class="btn ghost small" data-act="export-save">📤 Export</button>
      <button class="btn ghost small" data-act="import-save">📥 Import</button>
      <button class="btn ghost small" data-act="close-modal">Close</button>
    </div>
  `);
}

function exportSave() {
  const data = game.serialize();
  try {
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const aEl = document.createElement("a");
    aEl.href = url; aEl.download = `dicebound-save-${Date.now()}.json`;
    document.body.appendChild(aEl); aEl.click(); aEl.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Save exported.");
  } catch {
    // fallback: copy to clipboard
    navigator.clipboard?.writeText(data).then(() => toast("Save copied to clipboard.")).catch(() => toast("Export failed."));
  }
}
function importSavePrompt() {
  const json = window.prompt("Paste an exported save (JSON):");
  if (!json) return;
  if (game.importString(json.trim())) { closeModal(); toast("Save imported."); renderStory(); }
  else { sfx("error"); toast("Invalid save data."); }
}

// ===================================================================
// SETTINGS
// ===================================================================
function slider(label: string, key: "master" | "music" | "sfx", val: number): string {
  return `<div class="set-row"><span>${label}</span>
    <input type="range" min="0" max="100" value="${Math.round(val * 100)}" data-vol="${key}" class="vol-slider" />
    <span class="vol-num">${Math.round(val * 100)}</span></div>`;
}
function openSettings() {
  const s = audio.settings;
  openModal("Settings", `
    <h3 style="color:var(--gold)">Audio</h3>
    <div class="set-list">
      <div class="set-row"><span>Mute all</span>
        <button class="btn small ${s.muted ? "primary" : "ghost"}" data-act="audio-toggle" data-key="muted">${s.muted ? "Muted" : "On"}</button>
        <button class="btn small ghost" data-act="audio-test">Test ♪</button></div>
      ${slider("Master", "master", s.master)}
      ${slider("Music", "music", s.music)}
      ${slider("Effects", "sfx", s.sfx)}
    </div>
    <div class="dim" style="font-size:12px;margin-top:10px">All music and sound effects are generated in real time — no audio files. If you hear nothing on iPhone, tap once anywhere first (Safari requires a tap before audio can start).</div>
    <h3 style="color:var(--gold);margin-top:16px">Display &amp; Accessibility</h3>
    <div class="set-list">
      ${PREF_META.map((m) => `<div class="set-row"><span>${esc(m.label)}<div class="dim" style="font-size:11px">${esc(m.help)}</div></span>
        <button class="btn small ${prefs[m.key] ? "primary" : "ghost"}" data-act="pref-toggle" data-key="${m.key}">${prefs[m.key] ? "On" : "Off"}</button></div>`).join("")}
    </div>
    <div class="row center" style="margin-top:14px"><button class="btn primary small" data-act="close-modal">Done</button></div>
  `);
  app.ownerDocument.querySelectorAll<HTMLInputElement>(".vol-slider").forEach((sl) => {
    sl.addEventListener("input", () => {
      const key = sl.dataset.vol as "master" | "music" | "sfx";
      audio.setSetting(key, Number(sl.value) / 100);
      const num = sl.parentElement?.querySelector(".vol-num"); if (num) num.textContent = sl.value;
    });
  });
}

// ===================================================================
// AUDIO: unlock on first gesture; pick music per screen
// ===================================================================
function unlockAudio() { audio.unlock(); }
document.body.addEventListener("pointerdown", unlockAudio, { once: false });

// ---- display & accessibility preferences ----
let prefs: DisplayPrefs = loadPrefs();
function applyPrefs() {
  const body = document.body;
  body.classList.remove(...ALL_PREF_CLASSES);
  body.classList.add(...prefsBodyClasses(prefs));
}
function togglePref(key: PrefKey) {
  prefs = { ...prefs, [key]: !prefs[key] };
  savePrefs(prefs);
  applyPrefs();
}

// ---- boot ----
applyPrefs();
renderTitle();
