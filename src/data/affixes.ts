import { AffixDef } from "../engine/types.js";

// Affix pool. Each affix contributes one stat whose magnitude scales with the
// item's level. Prefixes and suffixes are rolled separately so names read like
// "Vicious Broadsword of the Bear".
export const AFFIXES: Record<string, AffixDef> = {
  // ---- prefixes ----
  keen: { id: "keen", name: "Keen", kind: "prefix", slots: ["weapon"], stat: "attackBonus", base: 1, perLevel: 0.4 },
  vicious: { id: "vicious", name: "Vicious", kind: "prefix", slots: ["weapon"], stat: "damageBonus", base: 1, perLevel: 0.6 },
  cruel: { id: "cruel", name: "Cruel", kind: "prefix", slots: ["weapon"], stat: "damageBonus", base: 2, perLevel: 0.8 },
  balanced: { id: "balanced", name: "Balanced", kind: "prefix", slots: ["weapon"], stat: "attackBonus", base: 2, perLevel: 0.5 },
  sturdy: { id: "sturdy", name: "Sturdy", kind: "prefix", slots: ["armor", "trinket"], stat: "defenseBonus", base: 1, perLevel: 0.35 },
  plated: { id: "plated", name: "Plated", kind: "prefix", slots: ["armor"], stat: "defenseBonus", base: 2, perLevel: 0.5 },
  vital: { id: "vital", name: "Vital", kind: "prefix", slots: ["armor", "trinket"], stat: "hpBonus", base: 4, perLevel: 1.6 },
  arcane: { id: "arcane", name: "Arcane", kind: "prefix", slots: ["armor", "trinket", "weapon"], stat: "focusBonus", base: 3, perLevel: 1.0 },
  mighty: { id: "mighty", name: "Mighty", kind: "prefix", slots: ["weapon", "trinket"], stat: "might", base: 1, perLevel: 0.18 },
  nimble: { id: "nimble", name: "Nimble", kind: "prefix", slots: ["armor", "trinket"], stat: "agility", base: 1, perLevel: 0.18 },

  // ---- suffixes ----
  "of-skill": { id: "of-skill", name: "of Skill", kind: "suffix", slots: ["weapon"], stat: "attackBonus", base: 1, perLevel: 0.4 },
  "of-ruin": { id: "of-ruin", name: "of Ruin", kind: "suffix", slots: ["weapon"], stat: "damageBonus", base: 1, perLevel: 0.6 },
  "of-the-bear": { id: "of-the-bear", name: "of the Bear", kind: "suffix", slots: ["armor", "trinket", "weapon"], stat: "hpBonus", base: 5, perLevel: 1.8 },
  "of-warding": { id: "of-warding", name: "of Warding", kind: "suffix", slots: ["armor", "trinket"], stat: "defenseBonus", base: 1, perLevel: 0.4 },
  "of-the-owl": { id: "of-the-owl", name: "of the Owl", kind: "suffix", slots: ["trinket", "weapon"], stat: "wits", base: 1, perLevel: 0.18 },
  "of-the-ox": { id: "of-the-ox", name: "of the Ox", kind: "suffix", slots: ["weapon", "trinket"], stat: "might", base: 1, perLevel: 0.18 },
  "of-the-fox": { id: "of-the-fox", name: "of the Fox", kind: "suffix", slots: ["armor", "trinket"], stat: "agility", base: 1, perLevel: 0.18 },
  "of-spirit": { id: "of-spirit", name: "of Spirit", kind: "suffix", slots: ["trinket", "armor"], stat: "spirit", base: 1, perLevel: 0.18 },
  "of-focus": { id: "of-focus", name: "of Focus", kind: "suffix", slots: ["armor", "trinket", "weapon"], stat: "focusBonus", base: 3, perLevel: 1.0 },
  "of-the-titan": { id: "of-the-titan", name: "of the Titan", kind: "suffix", slots: ["armor"], stat: "hpBonus", base: 8, perLevel: 2.0 },
};

export const AFFIX_LIST = Object.values(AFFIXES);
