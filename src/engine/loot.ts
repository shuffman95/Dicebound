import { Affix, AffixStat, Attributes, EquipSlot, ItemInstance, Rarity, StatMods } from "./types.js";
import { RNG } from "./rng.js";
import { getItem, BASE_GEAR } from "../data/items.js";
import { AFFIX_LIST } from "../data/affixes.js";
import { SETS } from "../data/sets.js";

let lootCounter = 0;
function lootUid(): string { lootCounter += 1; return `it-${Date.now().toString(36)}-${lootCounter}`; }

export interface RarityInfo { label: string; color: string; affixes: number; priceMult: number; }
export const RARITY: Record<Rarity, RarityInfo> = {
  common: { label: "Common", color: "#b9b2c4", affixes: 0, priceMult: 1 },
  uncommon: { label: "Uncommon", color: "#5fd06a", affixes: 1, priceMult: 1.8 },
  rare: { label: "Rare", color: "#5aa9ff", affixes: 2, priceMult: 3 },
  epic: { label: "Epic", color: "#c77dff", affixes: 3, priceMult: 5 },
  legendary: { label: "Legendary", color: "#ffae42", affixes: 4, priceMult: 9 },
};
const RARITY_ORDER: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary"];

const ATTR_STATS = ["might", "agility", "wits", "spirit"] as const;
function isAttrStat(s: AffixStat): s is keyof Attributes { return (ATTR_STATS as readonly string[]).includes(s); }

export function itemLevelOf(defId: string): number {
  const def = getItem(defId);
  if (def.itemLevel) return def.itemLevel;
  return Math.max(1, Math.min(10, 1 + Math.floor(def.price / 35)));
}
export function maxDurabilityOf(defId: string): number {
  const def = getItem(defId);
  return def.maxDurability ?? (def.slot ? 80 : 0);
}

// ---- instance construction ----
export function baseInstance(defId: string): ItemInstance {
  const def = getItem(defId);
  const dur = maxDurabilityOf(defId);
  return { uid: lootUid(), defId, rarity: "common", affixes: [], setId: def.setId, durability: dur, maxDurability: dur };
}

function rollAffixValue(stat: AffixStat, base: number, perLevel: number, level: number): number {
  return Math.max(1, Math.round(base + perLevel * (level - 1)));
}

function rollAffixes(slot: EquipSlot, count: number, level: number, rng: RNG): Affix[] {
  if (count <= 0) return [];
  const pool = AFFIX_LIST.filter((a) => a.slots.includes(slot));
  const chosen: Affix[] = [];
  const usedStats = new Set<AffixStat>();
  let prefixes = 0, suffixes = 0;
  const shuffled = [...pool].sort(() => rng.next() - 0.5);
  for (const a of shuffled) {
    if (chosen.length >= count) break;
    if (usedStats.has(a.stat)) continue;
    // keep names readable: at most 2 of each kind
    if (a.kind === "prefix" && prefixes >= 2) continue;
    if (a.kind === "suffix" && suffixes >= 2) continue;
    usedStats.add(a.stat);
    if (a.kind === "prefix") prefixes++; else suffixes++;
    chosen.push({ id: a.id, name: a.name, kind: a.kind, stat: a.stat, value: rollAffixValue(a.stat, a.base, a.perLevel, level) });
  }
  return chosen;
}

// Weighted rarity roll; higher level shifts the odds upward.
export function rollRarity(rng: RNG, level: number, luckBias = 0): Rarity {
  const weights: Record<Rarity, number> = {
    common: Math.max(4, 60 - level * 5 - luckBias * 10),
    uncommon: 28,
    rare: 10 + level * 1.5 + luckBias * 6,
    epic: 3 + level + luckBias * 4,
    legendary: 0.4 + level * 0.4 + luckBias * 2,
  };
  let total = 0; for (const r of RARITY_ORDER) total += weights[r];
  let roll = rng.next() * total;
  for (const r of RARITY_ORDER) { roll -= weights[r]; if (roll <= 0) return r; }
  return "common";
}

// Generate a random piece of gear.
export function generateGear(rng: RNG, opts: { slot?: EquipSlot; level?: number; rarity?: Rarity } = {}): ItemInstance {
  const slot: EquipSlot = opts.slot ?? rng.pick(["weapon", "armor", "trinket"]);
  const level = opts.level ?? 1;
  // pick a base whose own item level isn't far above the drop level
  const candidates = BASE_GEAR[slot].filter((id) => itemLevelOf(id) <= level + 2);
  const baseId = rng.pick(candidates.length ? candidates : BASE_GEAR[slot]);
  const rarity = opts.rarity ?? rollRarity(rng, level);
  const inst = baseInstance(baseId);
  inst.rarity = rarity;
  inst.affixes = rollAffixes(slot, RARITY[rarity].affixes, Math.max(level, itemLevelOf(baseId)), rng);
  return inst;
}

// ---- aggregation ----
export function instanceMods(inst: ItemInstance): StatMods {
  const def = getItem(inst.defId);
  const out: StatMods = {
    attackBonus: def.attackBonus ?? 0,
    damageBonus: def.damageBonus ?? 0,
    defenseBonus: def.defenseBonus ?? 0,
    hpBonus: def.hpBonus ?? 0,
    focusBonus: def.focusBonus ?? 0,
    attrBonus: { ...(def.attrBonus ?? {}) },
  };
  for (const af of inst.affixes) {
    if (isAttrStat(af.stat)) out.attrBonus![af.stat] = (out.attrBonus![af.stat] ?? 0) + af.value;
    else out[af.stat] = (out[af.stat] ?? 0) + af.value;
  }
  // broken gear gives half stats
  if (inst.durability <= 0) {
    for (const k of ["attackBonus", "damageBonus", "defenseBonus", "hpBonus", "focusBonus"] as const) out[k] = Math.floor((out[k] ?? 0) * 0.5);
    for (const a of ATTR_STATS) if (out.attrBonus![a]) out.attrBonus![a] = Math.floor(out.attrBonus![a]! * 0.5);
  }
  return out;
}

// Aggregate set bonuses for a list of equipped instances.
export function setBonuses(equipped: ItemInstance[]): { mods: StatMods; active: { name: string; desc: string }[] } {
  const counts: Record<string, number> = {};
  for (const inst of equipped) { const sid = getItem(inst.defId).setId; if (sid) counts[sid] = (counts[sid] ?? 0) + 1; }
  const mods: StatMods = { attrBonus: {} };
  const active: { name: string; desc: string }[] = [];
  for (const sid of Object.keys(counts)) {
    const set = SETS[sid]; if (!set) continue;
    for (const tier of set.bonuses) {
      if (counts[sid] >= tier.count) {
        addMods(mods, tier.mods);
        active.push({ name: set.name, desc: `(${tier.count}) ${tier.desc}` });
      }
    }
  }
  return { mods, active };
}

export function addMods(into: StatMods, from: StatMods): void {
  into.attackBonus = (into.attackBonus ?? 0) + (from.attackBonus ?? 0);
  into.damageBonus = (into.damageBonus ?? 0) + (from.damageBonus ?? 0);
  into.defenseBonus = (into.defenseBonus ?? 0) + (from.defenseBonus ?? 0);
  into.hpBonus = (into.hpBonus ?? 0) + (from.hpBonus ?? 0);
  into.focusBonus = (into.focusBonus ?? 0) + (from.focusBonus ?? 0);
  if (from.attrBonus) { into.attrBonus = into.attrBonus ?? {}; for (const a of ATTR_STATS) if (from.attrBonus[a]) into.attrBonus[a] = (into.attrBonus[a] ?? 0) + from.attrBonus[a]!; }
}

// ---- naming, value, repair ----
export function instanceName(inst: ItemInstance): string {
  const def = getItem(inst.defId);
  const pre = inst.affixes.find((a) => a.kind === "prefix");
  const suf = inst.affixes.find((a) => a.kind === "suffix");
  return `${pre ? pre.name + " " : ""}${def.name}${suf ? " " + suf.name : ""}`;
}
export function sellValue(inst: ItemInstance): number {
  const def = getItem(inst.defId);
  const base = Math.max(6, def.price || 12);
  return Math.floor(base * RARITY[inst.rarity].priceMult * 0.4);
}
export function buyValue(inst: ItemInstance): number {
  const def = getItem(inst.defId);
  const base = Math.max(12, def.price || 20);
  return Math.ceil(base * RARITY[inst.rarity].priceMult);
}
export function repairCost(inst: ItemInstance): number {
  const missing = inst.maxDurability - inst.durability;
  if (missing <= 0) return 0;
  return Math.ceil(missing * 0.6 * RARITY[inst.rarity].priceMult);
}
