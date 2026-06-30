import { Attr, ChoiceEffects, Combatant, EquipSlot, HeroBuild, ItemInstance, RecipeDef, StoryNode } from "./types.js";
import { RNG, rng } from "./rng.js";
import { modifier, skillCheck, CheckResult } from "./dice.js";
import { createEnemy, createHero, effectiveAttributes, equippedInstances, grantXP, LevelUpResult, refreshDerived, traitCheckBonus, xpForLevel } from "./character.js";
import { getBackground } from "../data/backgrounds.js";
import { Combat } from "./combat.js";
import { NODES, START_NODE } from "../data/story.js";
import { getEnemy } from "../data/enemies.js";
import { getItem, ITEMS } from "../data/items.js";
import { CLASSES } from "../data/classes.js";
import { baseInstance, generateGear, repairCost, sellValue, buyValue } from "./loot.js";
import { getQuest } from "../data/quests.js";
import { t } from "./i18n.js";

const SAVE_VERSION = 3;
const SAVE_PREFIX = "dicebound.save.v3.";
export const SAVE_SLOTS = ["auto", "1", "2", "3"] as const;
export type SaveSlot = (typeof SAVE_SLOTS)[number];
function slotKey(slot: SaveSlot): string { return SAVE_PREFIX + slot; }

export interface SaveMeta {
  version: number;
  leader: string;
  partySize: number;
  level: number;
  location: string;
  gold: number;
  timestamp: number;
}

export interface PersistShape {
  version: number;
  meta: SaveMeta;
  party: Combatant[];
  partyXP: Record<string, number>;
  gold: number;
  stacks: Record<string, number>; // consumables & materials
  gear: ItemInstance[]; // unequipped equipment instances
  nodeId: string;
  flags: string[];
  quests?: Record<string, "active" | "completed">;
  lore?: string[];
}

export interface Rewards {
  xp: number;
  gold: number;
  stackItems: string[]; // consumable/material defIds gained
  gearItems: ItemInstance[]; // rolled equipment gained
  levelUps: { name: string; result: LevelUpResult }[];
}

export class Game {
  party: Combatant[] = [];
  partyXP: Record<string, number> = {};
  gold = 50;
  stacks: Record<string, number> = {}; // consumables & materials (defId -> count)
  gear: ItemInstance[] = []; // unequipped equipment instances in the bag
  nodeId: string = START_NODE;
  flags: Set<string> = new Set();
  quests: Record<string, "active" | "completed"> = {};
  lore: Set<string> = new Set();
  notifications: string[] = []; // transient UI messages (quests/lore), drained by the UI
  rng: RNG = rng;
  combat: Combat | null = null;
  // queued rewards after a combat (resolved by UI on the victory screen)
  pendingRewards: Rewards | null = null;

  // ---- lifecycle ----
  newGame(builds: HeroBuild[]): void {
    this.party = builds.map((b) => createHero(b));
    this.partyXP = {};
    this.stacks = {};
    this.gear = [];
    this.gold = 50;
    for (const m of this.party) {
      this.partyXP[m.id] = 0;
      const cls = m.classId ? CLASSES[m.classId] : null;
      if (cls) for (const itemId of cls.startingItems) this.addItem(itemId);
      // background grants
      if (m.backgroundId) {
        const bg = getBackground(m.backgroundId);
        if (bg.gold) this.gold += bg.gold;
        if (bg.items) for (const it of bg.items) this.addItem(it);
      }
    }
    this.nodeId = START_NODE;
    this.flags = new Set();
    this.quests = {};
    this.lore = new Set();
    this.notifications = [];
    this.combat = null;
    this.pendingRewards = null;
  }

  // ---- quests & lore ----
  startQuest(id: string): void {
    if (this.quests[id]) return;
    const q = getQuest(id);
    if (!q) return;
    this.quests[id] = "active";
    this.notifications.push(t("notif.questPrefix", { type: q.type === "main" ? t("notif.quest") : t("notif.sideQuest"), name: q.name }));
  }
  completeQuest(id: string): void {
    if (this.quests[id] === "completed") return;
    const q = getQuest(id);
    if (!q) return;
    this.quests[id] = "completed";
    if (q.reward) {
      if (q.reward.gold) this.gold += q.reward.gold;
      if (q.reward.xp) this.awardXP(q.reward.xp);
      if (q.reward.items) for (const it of q.reward.items) this.addItem(it);
    }
    const r = q.reward;
    const rewardText = r ? t("notif.reward", { xp: r.xp ?? 0, gold: r.gold ?? 0, g: t("u.goldShort"), loot: r.items?.length ? t("notif.loot") : "" }) : "";
    this.notifications.push(t("notif.questComplete", { name: q.name, reward: rewardText }));
  }
  unlockLore(id: string): void {
    if (this.lore.has(id)) return;
    this.lore.add(id);
    this.notifications.push(t("notif.codex"));
  }
  drainNotifications(): string[] { const n = this.notifications; this.notifications = []; return n; }
  questState(id: string): "active" | "completed" | undefined { return this.quests[id]; }

  currentNode(): StoryNode { return NODES[this.nodeId]; }

  // ---- inventory: stackables (consumables & materials) ----
  // Adds an item by defId. Equipment defIds become a fresh common instance.
  addItem(id: string, n = 1): void {
    const def = getItem(id);
    if (def.slot) { for (let i = 0; i < n; i++) this.gear.push(baseInstance(id)); }
    else this.stacks[id] = (this.stacks[id] ?? 0) + n;
  }
  stackCount(id: string): number { return this.stacks[id] ?? 0; }
  removeItem(id: string, n = 1): boolean {
    if ((this.stacks[id] ?? 0) < n) return false;
    this.stacks[id] -= n;
    if (this.stacks[id] <= 0) delete this.stacks[id];
    return true;
  }

  // ---- inventory: gear instances ----
  addGear(inst: ItemInstance): void { this.gear.push(inst); }
  removeGear(uid: string): ItemInstance | null {
    const i = this.gear.findIndex((g) => g.uid === uid);
    if (i < 0) return null;
    return this.gear.splice(i, 1)[0];
  }
  findGear(uid: string): ItemInstance | undefined { return this.gear.find((g) => g.uid === uid); }

  // ---- economy ----
  buyConsumable(id: string): boolean {
    const item = getItem(id);
    if (this.gold < item.price) return false;
    this.gold -= item.price;
    this.addItem(id);
    return true;
  }
  buyGear(inst: ItemInstance): boolean {
    const cost = buyValue(inst);
    if (this.gold < cost) return false;
    this.gold -= cost;
    this.addGear(inst);
    return true;
  }
  sellStack(id: string): boolean {
    if (!this.removeItem(id)) return false;
    this.gold += Math.max(1, Math.floor((getItem(id).price || 2) / 2));
    return true;
  }
  sellGear(uid: string): boolean {
    const inst = this.removeGear(uid);
    if (!inst) return false;
    this.gold += sellValue(inst);
    return true;
  }

  // ---- equipment ----
  equipInstance(member: Combatant, uid: string): boolean {
    const inst = this.findGear(uid);
    if (!inst) return false;
    const def = getItem(inst.defId);
    if (!def.slot) return false;
    this.removeGear(uid);
    const prev = member.equipment[def.slot];
    if (prev) this.addGear(prev); // old piece returns to the bag
    member.equipment[def.slot] = inst;
    refreshDerived(member);
    return true;
  }
  unequip(member: Combatant, slot: EquipSlot): boolean {
    const prev = member.equipment[slot];
    if (!prev) return false;
    this.addGear(prev);
    delete member.equipment[slot];
    refreshDerived(member);
    return true;
  }

  // ---- durability / repair ----
  wearEquipment(amount: number): void {
    for (const m of this.party) {
      for (const inst of equippedInstances(m)) inst.durability = Math.max(0, inst.durability - amount);
      refreshDerived(m);
    }
  }
  repairAllCost(): number {
    let total = 0;
    for (const m of this.party) for (const inst of equippedInstances(m)) total += repairCost(inst);
    for (const inst of this.gear) total += repairCost(inst);
    return total;
  }
  repairAll(): boolean {
    const cost = this.repairAllCost();
    if (cost <= 0) return false;
    if (this.gold < cost) return false;
    this.gold -= cost;
    for (const m of this.party) { for (const inst of equippedInstances(m)) inst.durability = inst.maxDurability; refreshDerived(m); }
    for (const inst of this.gear) inst.durability = inst.maxDurability;
    return true;
  }

  // ---- crafting ----
  canCraft(r: RecipeDef): boolean {
    if (r.goldCost && this.gold < r.goldCost) return false;
    for (const inp of r.inputs) if (this.stackCount(inp.defId) < inp.qty) return false;
    return true;
  }
  craft(r: RecipeDef): boolean {
    if (!this.canCraft(r)) return false;
    if (r.goldCost) this.gold -= r.goldCost;
    for (const inp of r.inputs) this.removeItem(inp.defId, inp.qty);
    this.addItem(r.output.defId, r.output.qty); // routes to gear or stacks automatically
    return true;
  }

  // Use a consumable out of combat (heal / focus / cure / revive).
  useConsumableOOC(itemId: string, target: Combatant): string | null {
    const item = getItem(itemId);
    if (!item.consumable || this.stackCount(itemId) <= 0) return null;
    const c = item.consumable;
    if (c.reviveHpPercent && !target.alive) {
      target.alive = true;
      target.hp = Math.max(1, Math.floor(target.maxHP * c.reviveHpPercent / 100));
      this.removeItem(itemId);
      return t("msg.revivedAt", { name: target.name, hp: target.hp });
    }
    if (!target.alive) return null;
    let msg = "";
    if (c.heal) { const amt = Math.min(rollSimple(c.heal, this.rng), target.maxHP - target.hp); target.hp += amt; msg = t("msg.restoresHp", { name: target.name, n: amt }); }
    if (c.restoreFocus) { const amt = Math.min(c.restoreFocus, target.maxFocus - target.focus); target.focus += amt; msg = t("msg.restoresFocus", { name: target.name, n: amt }); }
    if (c.cureStatus) { target.statuses = target.statuses.filter((s) => !c.cureStatus!.includes(s.kind)); msg = t("msg.cleansed", { name: target.name }); }
    this.removeItem(itemId);
    return msg || `${item.name} used.`;
  }

  rest(cost: number): boolean {
    if (this.gold < cost) return false;
    this.gold -= cost;
    for (const m of this.party) {
      m.alive = true;
      m.hp = m.maxHP;
      m.focus = m.maxFocus;
      m.statuses = [];
    }
    return true;
  }

  // ---- skill checks (party's best-suited member rolls) ----
  bestModifier(attr: Attr): { member: Combatant; mod: number } {
    let best = this.party[0];
    let bestMod = -99;
    for (const m of this.party) {
      if (!m.alive) continue;
      const mod = modifier(effectiveAttributes(m)[attr]) + Math.floor(m.level / 3) + traitCheckBonus(m, attr);
      if (mod > bestMod) { bestMod = mod; best = m; }
    }
    if (bestMod === -99) { best = this.party[0]; bestMod = modifier(effectiveAttributes(best)[attr]); }
    return { member: best, mod: bestMod };
  }

  performCheck(attr: Attr, dc: number): { result: CheckResult; member: Combatant } {
    const { member, mod } = this.bestModifier(attr);
    const result = skillCheck(mod, dc, this.rng);
    return { result, member };
  }

  // ---- effects ----
  applyEffects(e: ChoiceEffects): void {
    if (e.gold) this.gold = Math.max(0, this.gold + e.gold);
    if (e.giveItems) for (const it of e.giveItems) this.addItem(it);
    if (e.healPercent) {
      for (const m of this.party) {
        if (!m.alive) continue;
        const delta = Math.round((m.maxHP * e.healPercent) / 100);
        m.hp = Math.max(1, Math.min(m.maxHP, m.hp + delta));
      }
    }
    if (e.restoreFocusPercent) for (const m of this.party) m.focus = Math.min(m.maxFocus, m.focus + Math.round((m.maxFocus * e.restoreFocusPercent) / 100));
    if (e.xp) this.awardXP(e.xp);
    if (e.setFlag) this.flags.add(e.setFlag);
    if (e.startQuest) this.startQuest(e.startQuest);
    if (e.completeQuest) this.completeQuest(e.completeQuest);
    if (e.unlockLore) this.unlockLore(e.unlockLore);
  }

  // ---- combat ----
  partyLevel(): number {
    return Math.max(1, Math.round(this.party.reduce((a, m) => a + m.level, 0) / this.party.length));
  }

  startCombat(enemyIds: string[]): Combat {
    const lvl = this.partyLevel();
    const enemies = enemyIds.map((id) => createEnemy(getEnemy(id), lvl));
    // carry over party HP/focus into the fight
    const combat = new Combat(this.party, enemies, this.rng);
    combat.start();
    this.combat = combat;
    return combat;
  }

  // Tally rewards from a won fight; grant XP & loot, wear gear. Stores a summary.
  resolveVictory(enemyIds: string[]): void {
    const lvl = this.partyLevel();
    let xp = 0, gold = 0;
    const stackItems: string[] = [];
    const gearItems: ItemInstance[] = [];
    let anyBoss = false;
    for (const id of enemyIds) {
      const def = getEnemy(id);
      xp += def.xpReward; gold += def.goldReward;
      anyBoss = anyBoss || !!def.isBoss;
      // fixed loot table: gear defIds become instances; everything else stacks
      if (def.lootTable) for (const l of def.lootTable) {
        if (this.rng.chance(l.chance)) {
          const ldef = getItem(l.itemId);
          if (ldef.slot) gearItems.push(baseInstance(l.itemId));
          else stackItems.push(l.itemId);
        }
      }
      // random gear drop chance (bosses always drop something good)
      const gearChance = def.isBoss ? 1 : 0.22;
      if (this.rng.chance(gearChance)) {
        gearItems.push(generateGear(this.rng, { level: lvl, rarity: def.isBoss ? this.rng.pick(["rare", "epic", "legendary"]) : undefined }));
      }
      // occasional treasure/material
      if (this.rng.chance(0.3)) stackItems.push(this.rng.pick(["mat-iron-scrap", "mat-moonherb", "mat-emberdust", "mat-bone-charm", "mat-silver-ingot", "treasure-ancient-coin"]));
    }
    this.gold += gold;
    for (const it of stackItems) this.addItem(it);
    for (const inst of gearItems) this.addGear(inst);
    const levelUps = this.awardXP(xp);
    this.pendingRewards = { xp, gold, stackItems, gearItems, levelUps };
    // gear wears from the fight
    this.wearEquipment(anyBoss ? 6 : 3);
    // restore a little focus after victory
    for (const m of this.party) if (m.alive) m.focus = Math.min(m.maxFocus, m.focus + Math.ceil(m.maxFocus * 0.25));
  }

  awardXP(xp: number): { name: string; result: LevelUpResult }[] {
    const ups: { name: string; result: LevelUpResult }[] = [];
    for (const m of this.party) {
      if (!this.partyXP[m.id]) this.partyXP[m.id] = 0;
      const store = { value: this.partyXP[m.id] };
      const res = grantXP(m, xp, store);
      this.partyXP[m.id] = store.value;
      if (res.leveled) ups.push({ name: m.name, result: res });
    }
    return ups;
  }

  xpProgress(m: Combatant): { current: number; needed: number } {
    return { current: this.partyXP[m.id] ?? 0, needed: xpForLevel(m.level) };
  }

  partyWiped(): boolean { return this.party.every((m) => !m.alive); }

  goto(nodeId: string): void {
    this.nodeId = nodeId;
    const node = NODES[nodeId];
    if (node?.onEnter) this.applyEffects(node.onEnter);
  }

  // ---- persistence ----
  private buildPersist(): PersistShape {
    const leader = this.party[0];
    const meta: SaveMeta = {
      version: SAVE_VERSION,
      leader: leader?.name ?? "—",
      partySize: this.party.length,
      level: leader?.level ?? 1,
      location: NODES[this.nodeId]?.title ?? "The Wilds",
      gold: this.gold,
      timestamp: Date.now(),
    };
    return {
      version: SAVE_VERSION, meta,
      party: this.party, partyXP: this.partyXP, gold: this.gold,
      stacks: this.stacks, gear: this.gear, nodeId: this.nodeId, flags: [...this.flags],
      quests: this.quests, lore: [...this.lore],
    };
  }

  serialize(): string { return JSON.stringify(this.buildPersist()); }

  saveToSlot(slot: SaveSlot): boolean {
    try { localStorage.setItem(slotKey(slot), this.serialize()); return true; } catch { return false; }
  }

  // Default autosave target.
  save(): void { this.saveToSlot("auto"); }

  private applyPersist(data: PersistShape): void {
    this.party = data.party;
    this.partyXP = data.partyXP;
    this.gold = data.gold;
    this.stacks = data.stacks ?? {};
    this.gear = data.gear ?? [];
    this.nodeId = data.nodeId;
    this.flags = new Set(data.flags ?? []);
    this.quests = data.quests ?? {};
    this.lore = new Set(data.lore ?? []);
    this.notifications = [];
    this.combat = null;
    this.pendingRewards = null;
    for (const m of this.party) {
      if (!m.traits) m.traits = [];
      if (!m.talents) m.talents = {};
      if (m.bonusHP === undefined) m.bonusHP = 0;
      if (m.bonusFocus === undefined) m.bonusFocus = 0;
      refreshDerived(m);
    }
  }

  loadFromSlot(slot: SaveSlot): boolean {
    try {
      const raw = localStorage.getItem(slotKey(slot));
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!Game.validate(data)) return false;
      this.applyPersist(data);
      return true;
    } catch { return false; }
  }

  // Load the most recently written slot (used by "Continue").
  load(): boolean {
    const latest = Game.latestSlot();
    return latest ? this.loadFromSlot(latest) : false;
  }

  // ---- import / export ----
  importString(json: string): boolean {
    try {
      const data = JSON.parse(json);
      if (!Game.validate(data)) return false;
      this.applyPersist(data);
      this.save();
      return true;
    } catch { return false; }
  }

  static validate(data: unknown): data is PersistShape {
    if (!data || typeof data !== "object") return false;
    const d = data as Record<string, unknown>;
    if (!Array.isArray(d.party) || d.party.length === 0) return false;
    if (typeof d.nodeId !== "string" || !NODES[d.nodeId]) return false;
    if (typeof d.gold !== "number" || d.gold < 0) return false;
    if (d.stacks !== undefined && (typeof d.stacks !== "object" || d.stacks === null)) return false;
    if (d.gear !== undefined && !Array.isArray(d.gear)) return false;
    // spot-check party members have the essential fields
    for (const m of d.party as Combatant[]) {
      if (typeof m.name !== "string" || typeof m.level !== "number" || !m.attributes) return false;
      if (typeof m.maxHP !== "number" || typeof m.hp !== "number") return false;
    }
    return true;
  }

  // ---- slot listing / management ----
  static readMeta(slot: SaveSlot): SaveMeta | null {
    try {
      const raw = localStorage.getItem(slotKey(slot));
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!Game.validate(data)) return null;
      return (data as PersistShape).meta ?? null;
    } catch { return null; }
  }
  static listSaves(): { slot: SaveSlot; meta: SaveMeta | null }[] {
    return SAVE_SLOTS.map((slot) => ({ slot, meta: Game.readMeta(slot) }));
  }
  static latestSlot(): SaveSlot | null {
    let best: SaveSlot | null = null;
    let bestTime = -1;
    for (const slot of SAVE_SLOTS) {
      const meta = Game.readMeta(slot);
      if (meta && meta.timestamp > bestTime) { bestTime = meta.timestamp; best = slot; }
    }
    return best;
  }
  static deleteSlot(slot: SaveSlot): void { try { localStorage.removeItem(slotKey(slot)); } catch { /* ignore */ } }
  static hasSave(): boolean { return Game.latestSlot() !== null; }
  // Clears the autosave (e.g. on an ending) without touching manual slots.
  static clearSave(): void { Game.deleteSlot("auto"); }
}

function rollSimple(notation: string, gen: RNG): number {
  // local helper to avoid importing roll() name clash
  const m = notation.replace(/\s/g, "").match(/^(\d*)d(\d+)([+-]\d+)?$/i);
  if (!m) return 0;
  const count = m[1] === "" ? 1 : parseInt(m[1], 10);
  const sides = parseInt(m[2], 10);
  const mod = m[3] ? parseInt(m[3], 10) : 0;
  let total = mod;
  for (let i = 0; i < count; i++) total += gen.int(1, sides);
  return Math.max(0, total);
}

export const ALL_ITEMS = ITEMS;
