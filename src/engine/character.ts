import { Attributes, Attr, ATTRS, ClassDef, Combatant, EnemyDef, EquipSlot, HeroBuild, ItemInstance, StatMods, TalentNode, TraitDef } from "./types.js";
import { modifier } from "./dice.js";
import { CLASSES } from "../data/classes.js";
import { getRace } from "../data/races.js";
import { getBackground } from "../data/backgrounds.js";
import { getTrait } from "../data/traits.js";
import { getTalent, talentTreeFor } from "../data/talents.js";
import { instanceMods, setBonuses, addMods, baseInstance } from "./loot.js";

let instanceCounter = 0;
function uid(prefix: string): string {
  instanceCounter += 1;
  return `${prefix}-${instanceCounter}`;
}

// Resolve a combatant's trait definitions (race/background/chosen).
export function traitsOf(c: Combatant): TraitDef[] {
  return (c.traits ?? []).map(getTrait).filter((t): t is TraitDef => !!t);
}

// Total bonus to a story skill check for an attribute, from traits.
export function traitCheckBonus(c: Combatant, attr: Attr): number {
  let total = 0;
  for (const t of traitsOf(c)) {
    if (t.checkBonus && t.checkBonus.attrs.includes(attr)) total += t.checkBonus.amount;
  }
  return total;
}

export function equippedInstances(c: Combatant): ItemInstance[] {
  const out: ItemInstance[] = [];
  for (const slot of ["weapon", "armor", "trinket"] as EquipSlot[]) {
    const inst = c.equipment[slot];
    if (inst) out.push(inst);
  }
  return out;
}

// Aggregate all stat bonuses from equipped gear (item stats + affixes + set bonuses).
export function equipMods(c: Combatant): StatMods {
  const total: StatMods = { attrBonus: {} };
  const equipped = equippedInstances(c);
  for (const inst of equipped) addMods(total, instanceMods(inst));
  addMods(total, setBonuses(equipped).mods);
  return total;
}

// ---- talents ----
export function talentNodesOf(c: Combatant): TalentNode[] {
  if (!c.classId) return [];
  const out: TalentNode[] = [];
  for (const id of Object.keys(c.talents ?? {})) {
    const node = getTalent(c.classId, id);
    if (node && c.talents[id] > 0) out.push(node);
  }
  return out;
}
export function talentMods(c: Combatant): StatMods {
  const total: StatMods = { attrBonus: {} };
  for (const node of talentNodesOf(c)) {
    const rank = c.talents[node.id];
    if (node.effect.mods) for (let i = 0; i < rank; i++) addMods(total, node.effect.mods);
  }
  return total;
}
export function talentCritBonus(c: Combatant): number {
  return talentNodesOf(c).reduce((s, n) => s + (n.effect.critBonus ?? 0) * c.talents[n.id], 0);
}
export function talentLifesteal(c: Combatant): number {
  return talentNodesOf(c).reduce((s, n) => s + (n.effect.lifestealPct ?? 0) * c.talents[n.id], 0);
}
export function talentPointsEarned(c: Combatant): number { return Math.max(0, c.level - 1); }
export function talentPointsSpent(c: Combatant): number {
  if (!c.classId) return 0;
  let spent = 0;
  for (const id of Object.keys(c.talents ?? {})) { const node = getTalent(c.classId, id); if (node) spent += node.cost * c.talents[id]; }
  return spent;
}
export function talentPointsAvailable(c: Combatant): number { return talentPointsEarned(c) - talentPointsSpent(c); }
export function canLearnTalent(c: Combatant, nodeId: string): boolean {
  if (!c.classId) return false;
  const node = getTalent(c.classId, nodeId);
  if (!node) return false;
  if ((c.talents[nodeId] ?? 0) >= 1) return false; // single rank per node
  if (talentPointsAvailable(c) < node.cost) return false;
  if (talentPointsSpent(c) < node.requiresPoints) return false;
  return true;
}
export function learnTalent(c: Combatant, nodeId: string): boolean {
  if (!canLearnTalent(c, nodeId)) return false;
  const node = getTalent(c.classId!, nodeId)!;
  c.talents[nodeId] = (c.talents[nodeId] ?? 0) + 1;
  if (node.effect.grantsAbility && !c.abilities.includes(node.effect.grantsAbility)) c.abilities.push(node.effect.grantsAbility);
  refreshDerived(c);
  return true;
}
export function classTree(c: Combatant): TalentNode[] { return c.classId ? talentTreeFor(c.classId) : []; }

// Combined gear + talent stat bonuses.
function allBonusMods(c: Combatant): StatMods {
  const total = equipMods(c);
  addMods(total, talentMods(c));
  return total;
}

// Sum equipment attribute bonuses onto base attributes.
export function effectiveAttributes(c: Combatant): Attributes {
  const out: Attributes = { ...c.attributes };
  const mods = allBonusMods(c);
  if (mods.attrBonus) for (const a of ATTRS) if (mods.attrBonus[a]) out[a] += mods.attrBonus[a]!;
  return out;
}

function equipSum(c: Combatant, field: "hpBonus" | "focusBonus" | "defenseBonus" | "attackBonus" | "damageBonus"): number {
  return allBonusMods(c)[field] ?? 0;
}

export function maxHP(c: Combatant): number {
  if (!c.classId) return c.maxHP; // enemies store a fixed maxHP
  const cls = CLASSES[c.classId];
  return Math.max(1, cls.hpBase + cls.hpPerLevel * (c.level - 1) + (c.bonusHP ?? 0) + equipSum(c, "hpBonus"));
}

export function maxFocus(c: Combatant): number {
  if (!c.classId) return c.maxFocus;
  const cls = CLASSES[c.classId];
  return Math.max(0, cls.focusBase + cls.focusPerLevel * (c.level - 1) + (c.bonusFocus ?? 0) + equipSum(c, "focusBonus"));
}

// Defense (armor class): base + agility mod + equipment. Fortify status added in combat.
export function defenseOf(c: Combatant): number {
  const attrs = effectiveAttributes(c);
  return c.baseDefense + modifier(attrs.agility) + equipSum(c, "defenseBonus");
}

export function proficiency(c: Combatant): number {
  return Math.floor(c.level / 3) + (c.isPlayer ? 0 : 2);
}

export function attackBonusFor(c: Combatant, attr: Attr): number {
  const attrs = effectiveAttributes(c);
  return modifier(attrs[attr]) + equipSum(c, "attackBonus") + proficiency(c);
}

export function damageBonusFor(c: Combatant, attr: Attr): number {
  const attrs = effectiveAttributes(c);
  return modifier(attrs[attr]) + equipSum(c, "damageBonus");
}

export function spiritMod(c: Combatant): number {
  return modifier(effectiveAttributes(c).spirit);
}

function addAttr(into: Attributes, from?: Partial<Attributes>): void {
  if (!from) return;
  for (const a of ATTRS) if (from[a]) into[a] += from[a]!;
}

// Build a fresh player combatant of the given class & level (simple default
// human-equivalent build; used by tests and as a fallback).
export function createPlayer(classId: string, name?: string, level = 1): Combatant {
  return createHero({ classId, raceId: "aldermoorian", backgroundId: "wanderer", name: name || CLASSES[classId].name, allocations: {} }, level);
}

// How many attribute points the player distributes at creation.
export const CREATION_POINTS = 6;
export const MAX_ALLOC_PER_ATTR = 4;

// Build a fully-specified hero from a character-creation build.
export function createHero(build: HeroBuild, level = 1): Combatant {
  const cls = CLASSES[build.classId];
  if (!cls) throw new Error(`Unknown class ${build.classId}`);
  const race = getRace(build.raceId);
  const bg = getBackground(build.backgroundId);
  const chosen = build.traitId ? getTrait(build.traitId) : undefined;

  const attributes: Attributes = { ...cls.baseAttributes };
  addAttr(attributes, race.attrBonus);
  addAttr(attributes, bg.attrBonus);
  addAttr(attributes, build.allocations);
  if (chosen?.attrBonus) addAttr(attributes, chosen.attrBonus);
  // level growth
  for (let lv = 2; lv <= level; lv++) {
    const attr = cls.growth[(lv - 2) % cls.growth.length];
    attributes[attr] += 1;
  }

  const traits = [race.traitId];
  if (bg.traitId) traits.push(bg.traitId);
  if (build.traitId) traits.push(build.traitId);

  // flat HP/Focus bonuses from race/background/traits
  let bonusHP = race.hpBonus ?? 0;
  let bonusFocus = race.focusBonus ?? 0;
  for (const id of traits) {
    const t = getTrait(id);
    if (t?.hpBonus) bonusHP += t.hpBonus;
    if (t?.focusBonus) bonusFocus += t.focusBonus;
  }

  const abilities = [...cls.startingAbilities];
  for (const u of cls.abilityUnlocks) {
    if (u.level <= level && !abilities.includes(u.abilityId)) abilities.push(u.abilityId);
  }

  const equipment: Combatant["equipment"] = {};
  for (const slot of ["weapon", "armor", "trinket"] as EquipSlot[]) {
    const id = cls.startingEquipment[slot];
    if (id) equipment[slot] = baseInstance(id);
  }

  const c: Combatant = {
    id: uid(build.classId),
    name: build.name || cls.name,
    isPlayer: true,
    classId: build.classId,
    raceId: build.raceId,
    backgroundId: build.backgroundId,
    traits,
    talents: {},
    level,
    attributes,
    bonusHP,
    bonusFocus,
    maxHP: 0, hp: 0, maxFocus: 0, focus: 0,
    baseDefense: cls.baseDefense,
    abilities,
    equipment,
    statuses: [],
    cooldowns: {},
    alive: true,
  };
  c.maxHP = maxHP(c);
  c.hp = c.maxHP;
  c.maxFocus = maxFocus(c);
  c.focus = c.maxFocus;
  return c;
}

// Build an enemy combatant instance.
export function createEnemy(def: EnemyDef, level = 1): Combatant {
  const c: Combatant = {
    id: uid(def.id),
    name: def.name,
    isPlayer: false,
    traits: [],
    talents: {},
    level,
    attributes: { ...def.attributes },
    bonusHP: 0,
    bonusFocus: 0,
    maxHP: def.maxHP,
    hp: def.maxHP,
    maxFocus: 99,
    focus: 99,
    baseDefense: def.baseDefense,
    abilities: [...def.abilities],
    equipment: {},
    statuses: [],
    cooldowns: {},
    enemyAI: [...def.abilities],
    xpReward: def.xpReward,
    goldReward: def.goldReward,
    lootTable: def.lootTable,
    resist: def.resist,
    phase: def.phase,
    aura: def.aura,
    ai: def.ai,
    alive: true,
  };
  return c;
}

// XP needed to reach the next level from `level`.
export function xpForLevel(level: number): number {
  return 40 + (level - 1) * 35 + Math.floor(Math.pow(level, 1.7) * 6);
}

export interface LevelUpResult {
  leveled: boolean;
  newLevel: number;
  newAbilities: string[];
  hpGain: number;
  focusGain: number;
}

// Apply earned XP; level up as many times as warranted. Mutates the combatant.
export function grantXP(c: Combatant, xp: number, xpStore: { value: number }): LevelUpResult {
  const cls = c.classId ? CLASSES[c.classId] : null;
  if (!cls) return { leveled: false, newLevel: c.level, newAbilities: [], hpGain: 0, focusGain: 0 };
  xpStore.value += xp;
  let leveled = false;
  const newAbilities: string[] = [];
  let hpGain = 0;
  let focusGain = 0;
  while (xpStore.value >= xpForLevel(c.level)) {
    xpStore.value -= xpForLevel(c.level);
    const prevMaxHP = maxHP(c);
    const prevMaxFocus = maxFocus(c);
    c.level += 1;
    const attr = cls.growth[(c.level - 2) % cls.growth.length];
    c.attributes[attr] += 1;
    for (const u of cls.abilityUnlocks) {
      if (u.level === c.level && !c.abilities.includes(u.abilityId)) {
        c.abilities.push(u.abilityId);
        newAbilities.push(u.abilityId);
      }
    }
    hpGain += maxHP(c) - prevMaxHP;
    focusGain += maxFocus(c) - prevMaxFocus;
    leveled = true;
  }
  // refresh caps; heal by the gained amount
  c.maxHP = maxHP(c);
  c.maxFocus = maxFocus(c);
  if (leveled) {
    c.hp = Math.min(c.maxHP, c.hp + hpGain);
    c.focus = Math.min(c.maxFocus, c.focus + focusGain);
  }
  return { leveled, newLevel: c.level, newAbilities, hpGain, focusGain };
}

// Recompute caps after equipment changes, clamping current values.
export function refreshDerived(c: Combatant): void {
  c.maxHP = maxHP(c);
  c.maxFocus = maxFocus(c);
  c.hp = Math.min(c.hp, c.maxHP);
  c.focus = Math.min(c.focus, c.maxFocus);
}
