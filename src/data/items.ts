import { ItemDef, EquipSlot } from "../engine/types.js";

export const ITEMS: Record<string, ItemDef> = {
  // ---------------- Consumables ----------------
  "potion-minor": {
    id: "potion-minor", name: "Minor Salve", kind: "consumable", price: 15,
    description: "Restores 2d6+4 HP to one ally.",
    consumable: { heal: "2d6+4" },
  },
  "potion-major": {
    id: "potion-major", name: "Greater Salve", kind: "consumable", price: 45,
    description: "Restores 4d6+8 HP to one ally.",
    consumable: { heal: "4d6+8" },
  },
  "potion-focus": {
    id: "potion-focus", name: "Aether Draught", kind: "consumable", price: 30,
    description: "Restores 8 Focus to one ally.",
    consumable: { restoreFocus: 8 },
  },
  antidote: {
    id: "antidote", name: "Antidote", kind: "consumable", price: 20,
    description: "Cures Poison and Burn from one ally.",
    consumable: { cureStatus: ["poison", "burn"] },
  },
  "smoke-bomb": {
    id: "smoke-bomb", name: "Smoke Bomb", kind: "consumable", price: 25,
    description: "Grants an ally +4 Defense for 2 turns.",
    consumable: { applyStatus: { kind: "fortify", turns: 2, magnitude: 4 } },
  },
  "phoenix-tear": {
    id: "phoenix-tear", name: "Phoenix Tear", kind: "consumable", price: 90,
    description: "Revives a fallen ally at 50% HP.",
    consumable: { reviveHpPercent: 50 },
  },
  "potion-cleanse": {
    id: "potion-cleanse", name: "Cleansing Brew", kind: "consumable", price: 28,
    description: "Restores 2d6 HP and cures Poison and Burn from one ally.",
    consumable: { heal: "2d6", cureStatus: ["poison", "burn"] },
  },
  "war-tonic": {
    id: "war-tonic", name: "War Tonic", kind: "consumable", price: 35,
    description: "Grants an ally Rally (+2 attack & damage) for 3 turns.",
    consumable: { applyStatus: { kind: "rally", turns: 3, magnitude: 2 } },
  },

  // ---------------- Weapons ----------------
  "wpn-broadsword": { id: "wpn-broadsword", name: "Broadsword", kind: "weapon", slot: "weapon", price: 0, description: "+2 attack, +1 damage.", attackBonus: 2, damageBonus: 1 },
  "wpn-aether-rod": { id: "wpn-aether-rod", name: "Aether Rod", kind: "weapon", slot: "weapon", price: 0, description: "+2 attack, +1 damage.", attackBonus: 2, damageBonus: 1 },
  "wpn-twin-daggers": { id: "wpn-twin-daggers", name: "Twin Daggers", kind: "weapon", slot: "weapon", price: 0, description: "+2 attack, +1 damage.", attackBonus: 2, damageBonus: 1 },
  "wpn-bramble-staff": { id: "wpn-bramble-staff", name: "Bramble Staff", kind: "weapon", slot: "weapon", price: 0, description: "+1 attack, +1 damage.", attackBonus: 1, damageBonus: 1 },
  "wpn-greataxe": { id: "wpn-greataxe", name: "Greataxe", kind: "weapon", slot: "weapon", price: 0, description: "+2 attack, +3 damage.", attackBonus: 2, damageBonus: 3 },
  "wpn-longbow": { id: "wpn-longbow", name: "Longbow", kind: "weapon", slot: "weapon", price: 0, description: "+3 attack, +1 damage.", attackBonus: 3, damageBonus: 1 },
  "wpn-bone-wand": { id: "wpn-bone-wand", name: "Bone Wand", kind: "weapon", slot: "weapon", price: 0, description: "+2 attack, +2 damage.", attackBonus: 2, damageBonus: 2 },
  "wpn-holy-mace": { id: "wpn-holy-mace", name: "Holy Mace", kind: "weapon", slot: "weapon", price: 0, description: "+2 attack, +1 damage, +1 Spirit.", attackBonus: 2, damageBonus: 1, attrBonus: { spirit: 1 } },
  "wpn-starsteel-blade": { id: "wpn-starsteel-blade", name: "Starsteel Blade", kind: "weapon", slot: "weapon", price: 120, description: "+4 attack, +3 damage.", attackBonus: 4, damageBonus: 3 },
  "wpn-stormrod": { id: "wpn-stormrod", name: "Stormcaller Rod", kind: "weapon", slot: "weapon", price: 120, description: "+3 attack, +4 damage.", attackBonus: 3, damageBonus: 4 },
  "wpn-shadowfang": { id: "wpn-shadowfang", name: "Shadowfang Kris", kind: "weapon", slot: "weapon", price: 120, description: "+4 attack, +3 damage.", attackBonus: 4, damageBonus: 3 },
  "wpn-lifebough": { id: "wpn-lifebough", name: "Lifebough Staff", kind: "weapon", slot: "weapon", price: 110, description: "+3 attack, +2 damage, +1 Spirit.", attackBonus: 3, damageBonus: 2, attrBonus: { spirit: 1 } },

  // ---------------- Armor ----------------
  "arm-robe": { id: "arm-robe", name: "Spun Robe", kind: "armor", slot: "armor", price: 0, description: "+1 Defense.", defenseBonus: 1 },
  "arm-leather": { id: "arm-leather", name: "Boiled Leather", kind: "armor", slot: "armor", price: 0, description: "+2 Defense.", defenseBonus: 2 },
  "arm-chain": { id: "arm-chain", name: "Chainmail", kind: "armor", slot: "armor", price: 0, description: "+3 Defense.", defenseBonus: 3 },
  "arm-warded-plate": { id: "arm-warded-plate", name: "Warded Plate", kind: "armor", slot: "armor", price: 100, description: "+5 Defense, +6 HP.", defenseBonus: 5, hpBonus: 6 },
  "arm-runed-vest": { id: "arm-runed-vest", name: "Runed Vest", kind: "armor", slot: "armor", price: 90, description: "+3 Defense, +6 Focus.", defenseBonus: 3, focusBonus: 6 },
  "arm-nightcloak": { id: "arm-nightcloak", name: "Nightcloak", kind: "armor", slot: "armor", price: 95, description: "+4 Defense, +1 Agility.", defenseBonus: 4, attrBonus: { agility: 1 } },

  // ---------------- Trinkets ----------------
  "trk-iron-band": { id: "trk-iron-band", name: "Iron Band", kind: "trinket", slot: "trinket", price: 0, description: "+4 HP.", hpBonus: 4 },
  "trk-wits-charm": { id: "trk-wits-charm", name: "Scholar's Charm", kind: "trinket", slot: "trinket", price: 0, description: "+1 Wits.", attrBonus: { wits: 1 } },
  "trk-agile-ring": { id: "trk-agile-ring", name: "Quicksilver Ring", kind: "trinket", slot: "trinket", price: 0, description: "+1 Agility.", attrBonus: { agility: 1 } },
  "trk-spirit-amulet": { id: "trk-spirit-amulet", name: "Verdant Amulet", kind: "trinket", slot: "trinket", price: 0, description: "+1 Spirit.", attrBonus: { spirit: 1 } },
  "trk-bloodstone": { id: "trk-bloodstone", name: "Bloodstone", kind: "trinket", slot: "trinket", price: 70, description: "+12 HP.", hpBonus: 12 },
  "trk-focus-lens": { id: "trk-focus-lens", name: "Focusing Lens", kind: "trinket", slot: "trinket", price: 70, description: "+8 Focus.", focusBonus: 8 },
  "trk-warding-eye": { id: "trk-warding-eye", name: "Warding Eye", kind: "trinket", slot: "trinket", price: 80, description: "+2 Defense.", defenseBonus: 2 },
  "trk-titan-seal": { id: "trk-titan-seal", name: "Titan Seal", kind: "trinket", slot: "trinket", price: 150, description: "+2 Might, +10 HP.", attrBonus: { might: 2 }, hpBonus: 10 },

  // ---------------- Set: Vigil of the Warden ----------------
  "wpn-vigil-glaive": { id: "wpn-vigil-glaive", name: "Vigil Glaive", kind: "weapon", slot: "weapon", price: 140, itemLevel: 5, setId: "vigil", description: "+3 attack, +2 damage.", attackBonus: 3, damageBonus: 2 },
  "arm-vigil-mail": { id: "arm-vigil-mail", name: "Vigil Mail", kind: "armor", slot: "armor", price: 140, itemLevel: 5, setId: "vigil", description: "+5 Defense, +6 HP.", defenseBonus: 5, hpBonus: 6 },
  "trk-vigil-seal": { id: "trk-vigil-seal", name: "Vigil Seal", kind: "trinket", slot: "trinket", price: 120, itemLevel: 5, setId: "vigil", description: "+1 Spirit, +6 HP.", attrBonus: { spirit: 1 }, hpBonus: 6 },

  // ---------------- Set: Emberwrought ----------------
  "wpn-ember-brand": { id: "wpn-ember-brand", name: "Ember Brand", kind: "weapon", slot: "weapon", price: 140, itemLevel: 5, setId: "ember", description: "+2 attack, +4 damage, +1 Wits.", attackBonus: 2, damageBonus: 4, attrBonus: { wits: 1 } },
  "arm-ember-weave": { id: "arm-ember-weave", name: "Ember Weave", kind: "armor", slot: "armor", price: 130, itemLevel: 5, setId: "ember", description: "+3 Defense, +8 Focus.", defenseBonus: 3, focusBonus: 8 },
  "trk-ember-eye": { id: "trk-ember-eye", name: "Ember Eye", kind: "trinket", slot: "trinket", price: 120, itemLevel: 5, setId: "ember", description: "+1 Wits, +6 Focus.", attrBonus: { wits: 1 }, focusBonus: 6 },

  // ---------------- Legendary base ----------------
  "wpn-kingsbane": { id: "wpn-kingsbane", name: "Kingsbane", kind: "weapon", slot: "weapon", price: 320, itemLevel: 8, description: "+6 attack, +6 damage, +1 Might.", attackBonus: 6, damageBonus: 6, attrBonus: { might: 1 } },
  "wpn-winters-edge": { id: "wpn-winters-edge", name: "Winter's Edge", kind: "weapon", slot: "weapon", price: 170, itemLevel: 6, description: "+4 attack, +4 damage, +1 Agility.", attackBonus: 4, damageBonus: 4, attrBonus: { agility: 1 } },
  "trk-rimeheart": { id: "trk-rimeheart", name: "Rimeheart", kind: "trinket", slot: "trinket", price: 130, itemLevel: 6, description: "+2 Defense, +14 HP.", defenseBonus: 2, hpBonus: 14 },
  "wpn-mirecrown-scepter": { id: "wpn-mirecrown-scepter", name: "Mirecrown Scepter", kind: "weapon", slot: "weapon", price: 165, itemLevel: 6, description: "+3 attack, +3 damage, +1 Wits.", attackBonus: 3, damageBonus: 3, attrBonus: { wits: 1 } },
  "trk-witch-phylactery": { id: "trk-witch-phylactery", name: "Witch's Phylactery", kind: "trinket", slot: "trinket", price: 130, itemLevel: 6, description: "+1 Spirit, +8 Focus.", attrBonus: { spirit: 1 }, focusBonus: 8 },

  // ---------------- Materials & treasures (sellable / for future crafting) ----------------
  "mat-iron-scrap": { id: "mat-iron-scrap", name: "Iron Scrap", kind: "material", price: 8, description: "Salvaged metal. Useful to a smith." },
  "mat-silver-ingot": { id: "mat-silver-ingot", name: "Silver Ingot", kind: "material", price: 22, description: "A bar of refined silver." },
  "mat-moonherb": { id: "mat-moonherb", name: "Moonherb", kind: "material", price: 12, description: "A pale herb that glows faintly. Alchemists prize it." },
  "mat-emberdust": { id: "mat-emberdust", name: "Emberdust", kind: "material", price: 18, description: "Warm to the touch, never cooling." },
  "mat-bone-charm": { id: "mat-bone-charm", name: "Bone Charm", kind: "material", price: 15, description: "A carved talisman taken from the Hollowed." },
  "mat-blightcap": { id: "mat-blightcap", name: "Blightcap", kind: "material", price: 16, description: "A pale fen mushroom slick with rot. Alchemists distill it into cures — carefully." },
  "treasure-ancient-coin": { id: "treasure-ancient-coin", name: "Ancient Coin", kind: "material", price: 40, description: "Currency of a kingdom older than Aldermoor." },
  "treasure-gilded-idol": { id: "treasure-gilded-idol", name: "Gilded Idol", kind: "material", price: 70, description: "A small idol of beaten gold. Worth a great deal." },
};

export function getItem(id: string): ItemDef {
  const it = ITEMS[id];
  if (!it) throw new Error(`Unknown item: ${id}`);
  return it;
}

// Consumables the shop always stocks (sold as stacks at fixed price).
export const SHOP_CONSUMABLES: string[] = [
  "potion-minor", "potion-major", "potion-focus", "antidote", "potion-cleanse", "phoenix-tear", "war-tonic", "smoke-bomb",
];

// Base equipment that can drop or be generated for the shop, by slot.
export const BASE_GEAR: Record<EquipSlot, string[]> = {
  weapon: ["wpn-broadsword", "wpn-twin-daggers", "wpn-aether-rod", "wpn-bramble-staff", "wpn-starsteel-blade", "wpn-stormrod", "wpn-shadowfang", "wpn-lifebough", "wpn-vigil-glaive", "wpn-ember-brand", "wpn-winters-edge", "wpn-mirecrown-scepter", "wpn-kingsbane"],
  armor: ["arm-leather", "arm-chain", "arm-robe", "arm-warded-plate", "arm-runed-vest", "arm-nightcloak", "arm-vigil-mail", "arm-ember-weave"],
  trinket: ["trk-iron-band", "trk-bloodstone", "trk-focus-lens", "trk-warding-eye", "trk-titan-seal", "trk-vigil-seal", "trk-ember-eye", "trk-rimeheart", "trk-witch-phylactery"],
};

// Materials/treasures enemies may drop as loot.
export const TREASURE_DROPS = ["mat-iron-scrap", "mat-silver-ingot", "mat-moonherb", "mat-emberdust", "mat-bone-charm", "mat-blightcap", "treasure-ancient-coin", "treasure-gilded-idol"];
