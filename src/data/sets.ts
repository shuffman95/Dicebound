import { SetDef } from "../engine/types.js";

export const SETS: Record<string, SetDef> = {
  vigil: {
    id: "vigil", name: "Vigil of the Warden",
    pieces: ["wpn-vigil-glaive", "arm-vigil-mail", "trk-vigil-seal"],
    bonuses: [
      { count: 2, mods: { hpBonus: 12, defenseBonus: 2 }, desc: "+12 HP, +2 Defense" },
      { count: 3, mods: { attrBonus: { spirit: 2 }, focusBonus: 6 }, desc: "+2 Spirit, +6 Focus" },
    ],
  },
  ember: {
    id: "ember", name: "Emberwrought",
    pieces: ["wpn-ember-brand", "arm-ember-weave", "trk-ember-eye"],
    bonuses: [
      { count: 2, mods: { damageBonus: 3, focusBonus: 6 }, desc: "+3 damage, +6 Focus" },
      { count: 3, mods: { attrBonus: { wits: 2 }, attackBonus: 2 }, desc: "+2 Wits, +2 attack" },
    ],
  },
};

export function getSet(id: string): SetDef | undefined { return SETS[id]; }
