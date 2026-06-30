import { TraitDef } from "../engine/types.js";
import { localizeDef } from "./locale.js";

// Every trait here has a real, implemented effect (see character.ts derived
// stats, game.ts skill checks, and combat.ts hooks). No flavor-only traits.
export const TRAITS: Record<string, TraitDef> = {
  // ---- race traits ----
  adaptable: { id: "adaptable", name: "Adaptable", description: "Versatile upbringing: +1 to all skill checks.", checkBonus: { attrs: ["might", "agility", "wits", "spirit"], amount: 1 } },
  "keen-senses": { id: "keen-senses", name: "Keen Senses", description: "Sharp eyes and ears: +2 to Agility and Wits checks.", checkBonus: { attrs: ["agility", "wits"], amount: 2 } },
  stoneblood: { id: "stoneblood", name: "Stoneblood", description: "Hardy and unyielding: +10 max HP.", hpBonus: 10 },
  bloodrage: { id: "bloodrage", name: "Bloodrage", description: "Fury when cornered: +3 damage while at or below half HP.", combat: { lowHpDamageBonus: { threshold: 0.5, amount: 3 } } },
  "mana-spring": { id: "mana-spring", name: "Mana Spring", description: "Attuned to the weave: regain +2 Focus at the start of each combat turn.", combat: { focusRegenPerTurn: 2 } },
  undying: { id: "undying", name: "Undying", description: "Hollow-touched: the first time you fall each battle, rise again at 1 HP.", combat: { reviveOncePerBattle: { hp: 1 } } },

  // ---- background traits ----
  drilled: { id: "drilled", name: "Drilled", description: "Years under arms: +6 max HP.", hpBonus: 6 },
  studied: { id: "studied", name: "Studied", description: "Well-read: +2 to Wits checks.", checkBonus: { attrs: ["wits"], amount: 2 } },
  underworld: { id: "underworld", name: "Underworld Ties", description: "Street-wise: +2 to Agility checks.", checkBonus: { attrs: ["agility"], amount: 2 } },
  faithful: { id: "faithful", name: "Faithful", description: "Sustained by devotion: +4 max Focus.", focusBonus: 4 },
  survivor: { id: "survivor", name: "Survivor", description: "Hard roads harden you: +1 to all skill checks.", checkBonus: { attrs: ["might", "agility", "wits", "spirit"], amount: 1 } },

  // ---- chosen starting traits (feats) ----
  tough: { id: "tough", name: "Tough", description: "+12 max HP.", hpBonus: 12 },
  focused: { id: "focused", name: "Focused", description: "+6 max Focus.", focusBonus: 6 },
  brawny: { id: "brawny", name: "Brawny", description: "+1 Might.", attrBonus: { might: 1 } },
  fleet: { id: "fleet", name: "Fleet", description: "+1 Agility.", attrBonus: { agility: 1 } },
  sharp: { id: "sharp", name: "Sharp", description: "+1 Wits.", attrBonus: { wits: 1 } },
  devout: { id: "devout", name: "Devout", description: "+1 Spirit.", attrBonus: { spirit: 1 } },
  lucky: { id: "lucky", name: "Lucky", description: "Fortune favors you: +1 to all skill checks.", checkBonus: { attrs: ["might", "agility", "wits", "spirit"], amount: 1 } },
  warded: { id: "warded", name: "Warded", description: "Begin every battle with a 6-point shield.", combat: { startShield: 6 } },
};

export function getTrait(id: string): TraitDef | undefined { const tr = TRAITS[id]; return tr ? localizeDef("trait", tr) : undefined; }

// The starting-trait (feat) options offered at character creation.
export const STARTING_TRAITS = ["tough", "focused", "brawny", "fleet", "sharp", "devout", "lucky", "warded"];
