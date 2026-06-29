import { RaceDef } from "../engine/types.js";

export const RACES: Record<string, RaceDef> = {
  aldermoorian: {
    id: "aldermoorian", name: "Aldermoorian", traitId: "adaptable",
    blurb: "Humans of the fallen kingdom — versatile, stubborn survivors.",
    attrBonus: { might: 1, agility: 1, wits: 1, spirit: 1 },
  },
  sylvan: {
    id: "sylvan", name: "Sylvan Elf", traitId: "keen-senses",
    blurb: "Long-lived folk of the deep forests; swift, perceptive, arcane-touched.",
    attrBonus: { agility: 2, wits: 1 }, focusBonus: 4,
  },
  stout: {
    id: "stout", name: "Stoutkin", traitId: "stoneblood",
    blurb: "Mountain-born and mountain-tough; slow to fall, slower to yield.",
    attrBonus: { might: 2, spirit: 1 },
  },
  orcborn: {
    id: "orcborn", name: "Orcborn", traitId: "bloodrage",
    blurb: "Fierce highland clans who fight hardest with their backs to the wall.",
    attrBonus: { might: 3 },
  },
  feykin: {
    id: "feykin", name: "Feykin", traitId: "mana-spring",
    blurb: "Halfblooded with the wild magic of the fey; brimming with aether.",
    attrBonus: { wits: 2, spirit: 1 }, focusBonus: 6,
  },
  revenant: {
    id: "revenant", name: "Revenant", traitId: "undying",
    blurb: "Touched by the Hollowing and refusing to stay dead. Frail, but they get back up.",
    attrBonus: { might: 1, agility: 1, wits: 1, spirit: 1 }, hpBonus: -4,
  },
};

export const RACE_LIST = Object.values(RACES);
export function getRace(id: string): RaceDef { const r = RACES[id]; if (!r) throw new Error(`Unknown race ${id}`); return r; }
