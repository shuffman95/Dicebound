import { BackgroundDef } from "../engine/types.js";

export const BACKGROUNDS: Record<string, BackgroundDef> = {
  soldier: {
    id: "soldier", name: "Soldier", traitId: "drilled",
    blurb: "You served in the king's levies before the rot came. Hardened, disciplined.",
    attrBonus: { might: 1 }, items: ["potion-minor"], gold: 10,
  },
  scholar: {
    id: "scholar", name: "Scholar", traitId: "studied",
    blurb: "A life among books and old maps. You know things others have forgotten.",
    attrBonus: { wits: 1 }, items: ["potion-focus", "potion-focus"], gold: 10,
  },
  outlaw: {
    id: "outlaw", name: "Outlaw", traitId: "underworld",
    blurb: "Wanted in three towns. You know which locks to pick and which palms to grease.",
    attrBonus: { agility: 1 }, gold: 45, items: ["smoke-bomb"],
  },
  acolyte: {
    id: "acolyte", name: "Acolyte", traitId: "faithful",
    blurb: "Raised in a shrine to the old green gods. Faith is a weapon too.",
    attrBonus: { spirit: 1 }, items: ["potion-minor", "antidote"], gold: 10,
  },
  noble: {
    id: "noble", name: "Noble", traitId: undefined,
    blurb: "Born to a house now in ashes. You still carry its purse — and its expectations.",
    gold: 90, items: ["war-tonic"],
  },
  wanderer: {
    id: "wanderer", name: "Wanderer", traitId: "survivor",
    blurb: "No home, no banner, no master. The road taught you everything.",
    items: ["potion-minor", "potion-minor"], gold: 25,
  },
};

export const BACKGROUND_LIST = Object.values(BACKGROUNDS);
export function getBackground(id: string): BackgroundDef { const b = BACKGROUNDS[id]; if (!b) throw new Error(`Unknown background ${id}`); return b; }
