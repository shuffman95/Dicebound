import { EnemyDef } from "../engine/types.js";
import { localizeDef } from "./locale.js";

export const ENEMIES: Record<string, EnemyDef> = {
  // ---- Area 1: The Sunken Road ----
  "hollow-rat": {
    id: "hollow-rat", ai: "aggressive", resist: { holy: 1.5, dark: 0.5 }, name: "Hollow Rat", attributes: { might: 9, agility: 13, wits: 6, spirit: 6 },
    maxHP: 14, baseDefense: 12, abilities: ["bite"], xpReward: 12, goldReward: 6,
    lootTable: [{ itemId: "potion-minor", chance: 0.2 }],
  },
  "rot-crawler": {
    id: "rot-crawler", ai: "default", resist: { fire: 1.5, poison: 0.5 }, name: "Rot Crawler", attributes: { might: 11, agility: 11, wits: 7, spirit: 8 },
    maxHP: 20, baseDefense: 12, abilities: ["claw", "spit-poison"], xpReward: 18, goldReward: 9,
    lootTable: [{ itemId: "antidote", chance: 0.25 }],
  },
  "husk-bandit": {
    id: "husk-bandit", ai: "aggressive", resist: { holy: 1.25 }, name: "Husk Bandit", attributes: { might: 13, agility: 12, wits: 9, spirit: 8 },
    maxHP: 26, baseDefense: 13, abilities: ["claw", "heavy-smash"], xpReward: 22, goldReward: 14,
    lootTable: [{ itemId: "potion-minor", chance: 0.3 }, { itemId: "war-tonic", chance: 0.1 }],
  },

  // ---- Area 2: The Drowned Chapel ----
  "pale-acolyte": {
    id: "pale-acolyte", ai: "tactician", resist: { holy: 1.5, dark: 0.5 }, name: "Pale Acolyte", attributes: { might: 9, agility: 11, wits: 14, spirit: 12 },
    maxHP: 24, baseDefense: 13, abilities: ["hex", "drain-life"], xpReward: 26, goldReward: 16,
    lootTable: [{ itemId: "potion-focus", chance: 0.3 }],
  },
  "bog-lurker": {
    id: "bog-lurker", ai: "berserker", resist: { fire: 1.5, poison: 0.5, ice: 0.75 }, name: "Bog Lurker", attributes: { might: 14, agility: 9, wits: 8, spirit: 9 },
    maxHP: 34, baseDefense: 12, abilities: ["gnash", "heavy-smash"], xpReward: 30, goldReward: 18,
    lootTable: [{ itemId: "potion-major", chance: 0.2 }],
  },

  // ---- Area 3: The Ashen Keep ----
  "wraith-knight": {
    id: "wraith-knight", ai: "aggressive", resist: { holy: 1.5, dark: 0.5, physical: 0.85 }, name: "Wraith Knight", attributes: { might: 15, agility: 12, wits: 11, spirit: 10 },
    maxHP: 40, baseDefense: 15, abilities: ["gnash", "heavy-smash", "wail"], xpReward: 38, goldReward: 24,
    lootTable: [{ itemId: "potion-major", chance: 0.25 }, { itemId: "trk-warding-eye", chance: 0.08 }],
  },
  "hollow-mage": {
    id: "hollow-mage", ai: "tactician", resist: { holy: 1.5, dark: 0.5 }, name: "Hollow Mage", attributes: { might: 8, agility: 12, wits: 17, spirit: 13 },
    maxHP: 32, baseDefense: 13, abilities: ["hex", "hollow-burst", "drain-life"], xpReward: 40, goldReward: 26,
    lootTable: [{ itemId: "potion-focus", chance: 0.3 }, { itemId: "trk-focus-lens", chance: 0.08 }],
  },

  // ---- Optional: The Unhollowed (a tragic encounter in the Ashen Keep) ----
  "the-candlewright": {
    id: "the-candlewright", resist: { holy: 1.5, dark: 0.5 }, ai: "tactician", name: "The Candlewright", attributes: { might: 11, agility: 11, wits: 15, spirit: 12 },
    maxHP: 48, baseDefense: 14, abilities: ["hex", "drain-life", "wail"], xpReward: 55, goldReward: 30,
    lootTable: [{ itemId: "potion-focus", chance: 0.5 }],
  },

  // ---- Bosses ----
  "warden-of-thorns": {
    id: "warden-of-thorns", ai: "berserker", resist: { fire: 1.5, holy: 1.25, poison: 0.5 }, phase: { atHpPercent: 40, message: "The Warden of Thorns erupts in a fury of bramble!", selfBuff: { kind: "rally", turns: 4, magnitude: 3 }, healPercent: 12 }, name: "Warden of Thorns", attributes: { might: 16, agility: 11, wits: 12, spirit: 14 },
    maxHP: 70, baseDefense: 14, abilities: ["gnash", "heavy-smash", "spit-poison", "wail"],
    xpReward: 80, goldReward: 60, isBoss: true,
    lootTable: [{ itemId: "phoenix-tear", chance: 1 }],
  },
  "the-pale-bishop": {
    id: "the-pale-bishop", aura: { afterPhaseOnly: true, applyStatus: { kind: "weaken", turns: 2, magnitude: 2 }, chance: 0.5, message: "Drowned whispers sap the party’s strength." }, ai: "support", resist: { holy: 1.5, dark: 0.5, poison: 0.5 }, phase: { atHpPercent: 50, message: "The Pale Bishop tears the veil — the drowned answer its call!", addAbilities: ["wail"], selfBuff: { kind: "rally", turns: 5, magnitude: 3 }, healPercent: 15 }, name: "The Pale Bishop", attributes: { might: 13, agility: 12, wits: 18, spirit: 16 },
    maxHP: 95, baseDefense: 15, abilities: ["hollow-burst", "drain-life", "hex", "dark-mend"],
    xpReward: 120, goldReward: 90, isBoss: true,
    lootTable: [{ itemId: "wpn-stormrod", chance: 1 }],
  },
  // ---- Optional region: The Rimewood (frost) ----
  "frost-wisp": {
    id: "frost-wisp", resist: { fire: 1.5, ice: 0.25 }, ai: "default", name: "Frost Wisp", attributes: { might: 8, agility: 14, wits: 13, spirit: 8 },
    maxHP: 18, baseDefense: 13, abilities: ["frost-bite"], xpReward: 24, goldReward: 10,
    lootTable: [{ itemId: "mat-emberdust", chance: 0.3 }],
  },
  "rime-stalker": {
    id: "rime-stalker", resist: { fire: 1.5, ice: 0.5 }, ai: "aggressive", name: "Rime Stalker", attributes: { might: 14, agility: 13, wits: 9, spirit: 8 },
    maxHP: 32, baseDefense: 13, abilities: ["claw", "ice-shard"], xpReward: 32, goldReward: 16,
    lootTable: [{ itemId: "potion-major", chance: 0.2 }],
  },
  "frozen-thrall": {
    id: "frozen-thrall", resist: { fire: 1.5, holy: 1.25, ice: 0.5, dark: 0.5 }, ai: "berserker", name: "Frozen Thrall", attributes: { might: 15, agility: 9, wits: 8, spirit: 8 },
    maxHP: 36, baseDefense: 12, abilities: ["gnash", "frost-bite"], xpReward: 36, goldReward: 18,
    lootTable: [{ itemId: "mat-silver-ingot", chance: 0.25 }],
  },
  "the-hoarfrost-knight": {
    id: "the-hoarfrost-knight", resist: { fire: 1.75, ice: 0.25, physical: 0.85 }, ai: "tactician",
    phase: { atHpPercent: 50, message: "The Hoarfrost Knight's armor splinters into a blizzard!", addAbilities: ["frost-nova"], selfBuff: { kind: "rally", turns: 6, magnitude: 3 }, healPercent: 12 },
    aura: { afterPhaseOnly: true, applyStatus: { kind: "chill", turns: 2, magnitude: 2 }, chance: 0.5, message: "A biting wind chills the party." },
    name: "The Hoarfrost Knight", attributes: { might: 17, agility: 12, wits: 14, spirit: 12 },
    maxHP: 110, baseDefense: 16, abilities: ["ice-shard", "heavy-smash", "frost-bite"],
    xpReward: 150, goldReward: 100, isBoss: true,
    lootTable: [{ itemId: "wpn-winters-edge", chance: 1 }],
  },

  // ---- Optional region: The Blightfen (poison) ----
  "mire-spore": {
    id: "mire-spore", resist: { fire: 1.5, holy: 1.5, poison: 0.25 }, ai: "default", name: "Mire Spore", attributes: { might: 7, agility: 13, wits: 12, spirit: 9 },
    maxHP: 16, baseDefense: 13, abilities: ["blight-spit"], xpReward: 22, goldReward: 9,
    lootTable: [{ itemId: "mat-blightcap", chance: 0.3 }],
  },
  "blight-hound": {
    id: "blight-hound", resist: { fire: 1.25, holy: 1.5, poison: 0.5 }, ai: "aggressive", name: "Blight Hound", attributes: { might: 14, agility: 14, wits: 8, spirit: 8 },
    maxHP: 30, baseDefense: 13, abilities: ["claw", "corrosive-touch"], xpReward: 30, goldReward: 15,
    lootTable: [{ itemId: "potion-major", chance: 0.2 }],
  },
  "rot-shaman": {
    id: "rot-shaman", resist: { fire: 1.25, holy: 1.5, poison: 0.25, dark: 0.5 }, ai: "tactician", name: "Rot Shaman", attributes: { might: 8, agility: 11, wits: 16, spirit: 13 },
    maxHP: 30, baseDefense: 13, abilities: ["plague", "hex", "drain-life"], xpReward: 36, goldReward: 18,
    lootTable: [{ itemId: "potion-focus", chance: 0.3 }, { itemId: "mat-blightcap", chance: 0.25 }],
  },
  "plague-thrall": {
    id: "plague-thrall", resist: { fire: 1.5, holy: 1.25, poison: 0.5, dark: 0.5 }, ai: "berserker", name: "Plague Thrall", attributes: { might: 15, agility: 9, wits: 9, spirit: 9 },
    maxHP: 38, baseDefense: 12, abilities: ["gnash", "blight-spit"], xpReward: 36, goldReward: 18,
    lootTable: [{ itemId: "mat-blightcap", chance: 0.25 }],
  },
  "the-rotcrowned": {
    id: "the-rotcrowned", resist: { fire: 1.75, holy: 1.5, poison: 0.25, dark: 0.5 }, ai: "tactician",
    phase: { atHpPercent: 50, message: "The Rotcrowned's crown bursts into a cloud of spores!", addAbilities: ["miasma"], selfBuff: { kind: "rally", turns: 6, magnitude: 3 }, healPercent: 14 },
    aura: { afterPhaseOnly: true, applyStatus: { kind: "poison", turns: 2, magnitude: 3 }, chance: 0.5, message: "Drifting spores settle into the party's wounds." },
    name: "The Rotcrowned", attributes: { might: 14, agility: 12, wits: 18, spirit: 17 },
    maxHP: 125, baseDefense: 16, abilities: ["plague", "drain-life", "hex", "corrosive-touch"],
    xpReward: 150, goldReward: 110, isBoss: true,
    lootTable: [{ itemId: "wpn-mirecrown-scepter", chance: 1 }],
  },

  "the-hollow-king": {
    id: "the-hollow-king", aura: { afterPhaseOnly: true, element: "dark", damage: 4, message: "The Hollowing gnaws at the party." }, ai: "tactician", resist: { holy: 1.5, dark: 0.25, poison: 0.5, ice: 0.75 }, phase: { atHpPercent: 50, message: "The grey crown blazes — the Hollow King unleashes its full power!", selfBuff: { kind: "rally", turns: 6, magnitude: 4 }, healPercent: 20 }, name: "The Hollow King", attributes: { might: 19, agility: 13, wits: 17, spirit: 16 },
    maxHP: 150, baseDefense: 17, abilities: ["crown-smite", "hollow-burst", "dark-mend", "wail"],
    xpReward: 250, goldReward: 200, isBoss: true,
    lootTable: [],
  },
};

export function getEnemy(id: string): EnemyDef {
  const e = ENEMIES[id];
  if (!e) throw new Error(`Unknown enemy: ${id}`);
  return localizeDef("enemy", e);
}
