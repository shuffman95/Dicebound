import { ClassDef } from "../engine/types.js";
import { localizeDef } from "./locale.js";

export const CLASSES: Record<string, ClassDef> = {
  vanguard: {
    id: "vanguard",
    name: "Vanguard",
    blurb: "An iron wall. Soaks hits, stuns foes, and shields the party.",
    baseAttributes: { might: 15, agility: 11, wits: 9, spirit: 10 },
    hpBase: 34, hpPerLevel: 8,
    focusBase: 6, focusPerLevel: 1,
    baseDefense: 13,
    startingAbilities: ["strike", "shield-bash", "guardian-stance"],
    abilityUnlocks: [
      { level: 3, abilityId: "cleave" },
      { level: 5, abilityId: "rallying-cry" },
    ],
    startingItems: ["potion-minor", "potion-minor"],
    startingEquipment: { weapon: "wpn-broadsword", armor: "arm-chain", trinket: "trk-iron-band" },
    growth: ["might", "spirit", "agility", "wits"],
  },

  arcanist: {
    id: "arcanist",
    name: "Arcanist",
    blurb: "A glass cannon. Burns, freezes, and erases ranks of foes at once.",
    baseAttributes: { might: 8, agility: 11, wits: 16, spirit: 11 },
    hpBase: 22, hpPerLevel: 5,
    focusBase: 12, focusPerLevel: 3,
    baseDefense: 11,
    startingAbilities: ["arc-bolt", "emberblast", "frost-lance"],
    abilityUnlocks: [
      { level: 3, abilityId: "chain-spark" },
      { level: 4, abilityId: "arcane-ward" },
      { level: 6, abilityId: "meteor" },
    ],
    startingItems: ["potion-focus", "potion-minor"],
    startingEquipment: { weapon: "wpn-aether-rod", armor: "arm-robe", trinket: "trk-wits-charm" },
    growth: ["wits", "spirit", "agility", "might"],
  },

  shade: {
    id: "shade",
    name: "Shade",
    blurb: "A killer in the dark. Crits, poisons, and vanishes before the reply.",
    baseAttributes: { might: 10, agility: 16, wits: 12, spirit: 9 },
    hpBase: 26, hpPerLevel: 6,
    focusBase: 9, focusPerLevel: 2,
    baseDefense: 13,
    startingAbilities: ["quick-cut", "backstab", "smoke-veil"],
    abilityUnlocks: [
      { level: 3, abilityId: "venom-strike" },
      { level: 4, abilityId: "twin-fang" },
      { level: 5, abilityId: "shadow-assault" },
    ],
    startingItems: ["potion-minor", "smoke-bomb"],
    startingEquipment: { weapon: "wpn-twin-daggers", armor: "arm-leather", trinket: "trk-agile-ring" },
    growth: ["agility", "wits", "might", "spirit"],
  },

  warden: {
    id: "warden",
    name: "Warden",
    blurb: "Keeper of life. Heals, revives, regenerates, and wards the party.",
    baseAttributes: { might: 10, agility: 10, wits: 12, spirit: 15 },
    hpBase: 28, hpPerLevel: 6,
    focusBase: 11, focusPerLevel: 3,
    baseDefense: 12,
    startingAbilities: ["thorn-lash", "mend", "renewal"],
    abilityUnlocks: [
      { level: 3, abilityId: "group-mend" },
      { level: 4, abilityId: "blessing" },
      { level: 6, abilityId: "revive" },
    ],
    startingItems: ["potion-minor", "potion-minor", "potion-focus"],
    startingEquipment: { weapon: "wpn-bramble-staff", armor: "arm-robe", trinket: "trk-spirit-amulet" },
    growth: ["spirit", "wits", "might", "agility"],
  },
  berserker: {
    id: "berserker",
    name: "Berserker",
    blurb: "A storm of fury. Hits like a landslide and grows deadlier as blood is spilled.",
    baseAttributes: { might: 16, agility: 12, wits: 8, spirit: 9 },
    hpBase: 30, hpPerLevel: 7,
    focusBase: 7, focusPerLevel: 1,
    baseDefense: 11,
    startingAbilities: ["frenzy-strike", "blood-howl", "rend"],
    abilityUnlocks: [
      { level: 3, abilityId: "whirlwind" },
      { level: 4, abilityId: "bloodlust" },
      { level: 6, abilityId: "executioner" },
    ],
    startingItems: ["potion-minor", "war-tonic"],
    startingEquipment: { weapon: "wpn-greataxe", armor: "arm-leather", trinket: "trk-iron-band" },
    growth: ["might", "agility", "spirit", "wits"],
  },

  ranger: {
    id: "ranger",
    name: "Ranger",
    blurb: "A deadeye of the wilds. Rains arrows, pins foes, and never misses twice.",
    baseAttributes: { might: 11, agility: 16, wits: 12, spirit: 9 },
    hpBase: 26, hpPerLevel: 6,
    focusBase: 9, focusPerLevel: 2,
    baseDefense: 12,
    startingAbilities: ["longshot", "piercing-arrow", "twin-shot"],
    abilityUnlocks: [
      { level: 3, abilityId: "volley" },
      { level: 4, abilityId: "snare" },
      { level: 5, abilityId: "falcon-strike" },
    ],
    startingItems: ["potion-minor", "smoke-bomb"],
    startingEquipment: { weapon: "wpn-longbow", armor: "arm-leather", trinket: "trk-agile-ring" },
    growth: ["agility", "wits", "might", "spirit"],
  },

  necromancer: {
    id: "necromancer",
    name: "Necromancer",
    blurb: "A master of death. Drains the living, spreads plague, and feeds on the dying.",
    baseAttributes: { might: 8, agility: 11, wits: 16, spirit: 11 },
    hpBase: 24, hpPerLevel: 5,
    focusBase: 11, focusPerLevel: 3,
    baseDefense: 11,
    startingAbilities: ["shadow-bolt", "siphon-soul", "plague"],
    abilityUnlocks: [
      { level: 3, abilityId: "bone-spear" },
      { level: 4, abilityId: "death-coil" },
      { level: 6, abilityId: "epidemic" },
    ],
    startingItems: ["potion-focus", "potion-minor"],
    startingEquipment: { weapon: "wpn-bone-wand", armor: "arm-robe", trinket: "trk-wits-charm" },
    growth: ["wits", "spirit", "agility", "might"],
  },

  cleric: {
    id: "cleric",
    name: "Cleric",
    blurb: "A vessel of holy light. Heals, shields, smites the wicked, and raises the dead.",
    baseAttributes: { might: 11, agility: 9, wits: 11, spirit: 15 },
    hpBase: 28, hpPerLevel: 6,
    focusBase: 11, focusPerLevel: 3,
    baseDefense: 12,
    startingAbilities: ["censure", "lay-hands", "smite-evil"],
    abilityUnlocks: [
      { level: 3, abilityId: "divine-shield" },
      { level: 4, abilityId: "holy-nova" },
      { level: 6, abilityId: "resurrection" },
    ],
    startingItems: ["potion-minor", "potion-minor", "antidote"],
    startingEquipment: { weapon: "wpn-holy-mace", armor: "arm-chain", trinket: "trk-spirit-amulet" },
    growth: ["spirit", "might", "wits", "agility"],
  },
};

export const CLASS_LIST = Object.values(CLASSES);
// Localized class def for display (logic should key off ids, not names).
export function getClass(id: string): ClassDef { return localizeDef("class", CLASSES[id]); }
