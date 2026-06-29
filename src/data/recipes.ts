import { RecipeDef } from "../engine/types.js";

// Crafting recipes. Inputs are the materials/treasures that drop from combat and
// gathering. Alchemy makes consumables; smithing forges gear (including set
// pieces, so a determined crafter can complete a set).
export const RECIPES: Record<string, RecipeDef> = {
  // ---- Alchemy ----
  "alc-major": { id: "alc-major", name: "Greater Salve", station: "alchemy", description: "Brew a potent healing salve.", inputs: [{ defId: "mat-moonherb", qty: 2 }], goldCost: 5, output: { defId: "potion-major", qty: 1 } },
  "alc-focus": { id: "alc-focus", name: "Aether Draught", station: "alchemy", description: "Distill restorative aether.", inputs: [{ defId: "mat-emberdust", qty: 1 }, { defId: "mat-moonherb", qty: 1 }], output: { defId: "potion-focus", qty: 1 } },
  "alc-antidote": { id: "alc-antidote", name: "Antidote", station: "alchemy", description: "Grind moonherb into a cure.", inputs: [{ defId: "mat-moonherb", qty: 1 }], output: { defId: "antidote", qty: 1 } },
  "alc-smoke": { id: "alc-smoke", name: "Smoke Bomb", station: "alchemy", description: "Pack emberdust into a smoke charge.", inputs: [{ defId: "mat-emberdust", qty: 1 }], output: { defId: "smoke-bomb", qty: 1 } },
  "alc-wartonic": { id: "alc-wartonic", name: "War Tonic", station: "alchemy", description: "A bracing battle draught.", inputs: [{ defId: "mat-emberdust", qty: 1 }, { defId: "mat-bone-charm", qty: 1 }], output: { defId: "war-tonic", qty: 1 } },
  "alc-phoenix": { id: "alc-phoenix", name: "Phoenix Tear", station: "alchemy", description: "Bind life into a single, precious tear.", inputs: [{ defId: "mat-moonherb", qty: 2 }, { defId: "mat-bone-charm", qty: 1 }], goldCost: 20, output: { defId: "phoenix-tear", qty: 1 } },
  "alc-cleanse": { id: "alc-cleanse", name: "Cleansing Brew", station: "alchemy", description: "Temper a blightcap with moonherb into a cure that mends as it cleanses.", inputs: [{ defId: "mat-blightcap", qty: 1 }, { defId: "mat-moonherb", qty: 1 }], output: { defId: "potion-cleanse", qty: 1 } },

  // ---- Smithing ----
  "smith-bloodstone": { id: "smith-bloodstone", name: "Bloodstone", station: "smithing", description: "Set a bloodstone trinket (+12 HP).", inputs: [{ defId: "mat-iron-scrap", qty: 2 }, { defId: "mat-bone-charm", qty: 1 }], output: { defId: "trk-bloodstone", qty: 1 } },
  "smith-starsteel": { id: "smith-starsteel", name: "Starsteel Blade", station: "smithing", description: "Forge a fine starsteel blade.", inputs: [{ defId: "mat-silver-ingot", qty: 3 }, { defId: "mat-iron-scrap", qty: 2 }], output: { defId: "wpn-starsteel-blade", qty: 1 } },
  "smith-warded": { id: "smith-warded", name: "Warded Plate", station: "smithing", description: "Hammer out a suit of warded plate.", inputs: [{ defId: "mat-silver-ingot", qty: 2 }, { defId: "mat-iron-scrap", qty: 3 }], output: { defId: "arm-warded-plate", qty: 1 } },
  "smith-vigil-mail": { id: "smith-vigil-mail", name: "Vigil Mail (set)", station: "smithing", description: "Forge a piece of the Warden's Vigil set.", inputs: [{ defId: "mat-silver-ingot", qty: 2 }, { defId: "mat-iron-scrap", qty: 2 }, { defId: "mat-bone-charm", qty: 1 }], output: { defId: "arm-vigil-mail", qty: 1 } },
  "smith-vigil-glaive": { id: "smith-vigil-glaive", name: "Vigil Glaive (set)", station: "smithing", description: "Forge a piece of the Warden's Vigil set.", inputs: [{ defId: "mat-silver-ingot", qty: 2 }, { defId: "mat-iron-scrap", qty: 3 }], output: { defId: "wpn-vigil-glaive", qty: 1 } },
  "smith-ember-weave": { id: "smith-ember-weave", name: "Ember Weave (set)", station: "smithing", description: "Weave a piece of the Emberwrought set.", inputs: [{ defId: "mat-emberdust", qty: 2 }, { defId: "mat-silver-ingot", qty: 1 }], output: { defId: "arm-ember-weave", qty: 1 } },
};

export const RECIPE_LIST = Object.values(RECIPES);
export function getRecipe(id: string): RecipeDef | undefined { return RECIPES[id]; }
