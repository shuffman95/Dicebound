import { Ability } from "../engine/types.js";
import { localizeDef } from "./locale.js";

// All abilities (player + enemy) keyed by id. Targeting is relative to the
// actor's side: "all-enemies" means the opposing team, "all-allies" the actor's team.
export const ABILITIES: Record<string, Ability> = {
  // ---------------- Vanguard ----------------
  strike: {
    id: "strike", name: "Strike", kind: "attack", target: "enemy",
    description: "A solid melee blow. 1d8 + Might.",
    focusCost: 0, cooldown: 0, attackAttr: "might", damage: "1d8",
  },
  "shield-bash": {
    id: "shield-bash", name: "Shield Bash", kind: "attack", target: "enemy",
    description: "Slam with your shield for 1d6 + Might; may stun for 1 turn.",
    focusCost: 2, cooldown: 2, attackAttr: "might", damage: "1d6",
    applyStatus: { kind: "stun", turns: 1, magnitude: 0 },
  },
  "guardian-stance": {
    id: "guardian-stance", name: "Guardian Stance", kind: "buff", target: "self",
    description: "Brace yourself: +3 Defense for 3 turns.",
    focusCost: 2, cooldown: 3, ignoreDefense: true,
    selfStatus: { kind: "fortify", turns: 3, magnitude: 3 },
  },
  cleave: {
    id: "cleave", name: "Cleave", kind: "attack", target: "all-enemies",
    description: "Sweep through all foes for 1d6 + Might each.",
    focusCost: 4, cooldown: 2, attackAttr: "might", damage: "1d6",
  },
  "rallying-cry": {
    id: "rallying-cry", name: "Rallying Cry", kind: "buff", target: "all-allies",
    description: "Inspire the party: +2 attack & damage for 3 turns.",
    focusCost: 3, cooldown: 4, ignoreDefense: true,
    applyStatus: { kind: "rally", turns: 3, magnitude: 2 },
  },

  // ---------------- Arcanist ----------------
  "arc-bolt": {
    id: "arc-bolt", element: "lightning", name: "Arc Bolt", kind: "attack", target: "enemy",
    description: "A bolt of raw aether. 1d6 + Wits.",
    focusCost: 0, cooldown: 0, attackAttr: "wits", damage: "1d6",
  },
  emberblast: {
    id: "emberblast", element: "fire", name: "Emberblast", kind: "attack", target: "enemy",
    description: "Searing fire for 2d6 + Wits, leaving a Burn.",
    focusCost: 3, cooldown: 1, attackAttr: "wits", damage: "2d6",
    applyStatus: { kind: "burn", turns: 2, magnitude: 4 },
  },
  "frost-lance": {
    id: "frost-lance", element: "ice", name: "Frost Lance", kind: "attack", target: "enemy",
    description: "A spear of ice for 1d10 + Wits; Chills the target (shatters when struck).",
    focusCost: 3, cooldown: 2, attackAttr: "wits", damage: "1d10",
    applyStatus: { kind: "chill", turns: 2, magnitude: 2 },
  },
  "chain-spark": {
    id: "chain-spark", element: "lightning", name: "Chain Spark", kind: "attack", target: "all-enemies",
    description: "Lightning arcs across all foes for 1d6 + Wits.",
    focusCost: 5, cooldown: 3, attackAttr: "wits", damage: "1d6",
  },
  "arcane-ward": {
    id: "arcane-ward", name: "Arcane Ward", kind: "buff", target: "ally",
    description: "Shroud an ally in a shield absorbing 10 damage.",
    focusCost: 3, cooldown: 3, ignoreDefense: true,
    applyStatus: { kind: "shield", turns: 4, magnitude: 10 },
  },
  meteor: {
    id: "meteor", element: "fire", name: "Meteor", kind: "attack", target: "all-enemies",
    description: "Call down ruin: 3d6 + Wits to every foe.",
    focusCost: 7, cooldown: 4, attackAttr: "wits", damage: "3d6",
  },

  // ---------------- Shade ----------------
  "quick-cut": {
    id: "quick-cut", name: "Quick Cut", kind: "attack", target: "enemy",
    description: "A swift finesse strike. 1d6 + Agility.",
    focusCost: 0, cooldown: 0, attackAttr: "agility", damage: "1d6",
  },
  backstab: {
    id: "backstab", name: "Backstab", kind: "attack", target: "enemy",
    description: "Strike a vital point for 2d6 + Agility (+3 on hit).",
    focusCost: 2, cooldown: 1, attackAttr: "agility", damage: "2d6", flatDamageBonus: 3,
  },
  "twin-fang": {
    id: "twin-fang", name: "Twin Fang", kind: "attack", target: "enemy",
    description: "Two rapid stabs, 1d4 + Agility each.",
    focusCost: 3, cooldown: 2, attackAttr: "agility", damage: "1d4", hits: 2,
  },
  "smoke-veil": {
    id: "smoke-veil", name: "Smoke Veil", kind: "buff", target: "self",
    description: "Vanish in smoke: +4 Defense for 2 turns.",
    focusCost: 2, cooldown: 3, ignoreDefense: true,
    selfStatus: { kind: "fortify", turns: 2, magnitude: 4 },
  },
  "venom-strike": {
    id: "venom-strike", name: "Venom Strike", kind: "attack", target: "enemy",
    description: "A poisoned blade: 1d6 + Agility and lingering Poison.",
    focusCost: 3, cooldown: 2, attackAttr: "agility", damage: "1d6",
    applyStatus: { kind: "poison", turns: 3, magnitude: 3 },
  },
  "shadow-assault": {
    id: "shadow-assault", name: "Shadow Assault", kind: "attack", target: "all-enemies",
    description: "Blink between every foe, 1d6 + Agility each.",
    focusCost: 5, cooldown: 4, attackAttr: "agility", damage: "1d6",
  },

  // ---------------- Warden ----------------
  "thorn-lash": {
    id: "thorn-lash", name: "Thorn Lash", kind: "attack", target: "enemy",
    description: "A whip of bramble. 1d6 + Spirit.",
    focusCost: 0, cooldown: 0, attackAttr: "spirit", damage: "1d6",
  },
  mend: {
    id: "mend", name: "Mend", kind: "heal", target: "ally",
    description: "Knit wounds for 1d8 + Spirit.",
    focusCost: 2, cooldown: 0, heal: "1d8", ignoreDefense: true,
  },
  renewal: {
    id: "renewal", name: "Renewal", kind: "heal", target: "ally",
    description: "Grant Regeneration: heal 4 each turn for 3 turns.",
    focusCost: 3, cooldown: 2, ignoreDefense: true,
    applyStatus: { kind: "regen", turns: 3, magnitude: 4 },
  },
  "group-mend": {
    id: "group-mend", name: "Group Mend", kind: "heal", target: "all-allies",
    description: "Soothing light heals the party for 1d6 + Spirit.",
    focusCost: 5, cooldown: 3, heal: "1d6", ignoreDefense: true,
  },
  blessing: {
    id: "blessing", name: "Blessing", kind: "buff", target: "all-allies",
    description: "Ward the party: +2 Defense for 3 turns.",
    focusCost: 3, cooldown: 3, ignoreDefense: true,
    applyStatus: { kind: "fortify", turns: 3, magnitude: 2 },
  },
  revive: {
    id: "revive", name: "Revive", kind: "heal", target: "ally",
    description: "Call a fallen ally back to life at half health.",
    focusCost: 6, cooldown: 5, ignoreDefense: true, revive: 50,
  },

  // ================= Berserker (Might) =================
  "frenzy-strike": { id: "frenzy-strike", name: "Frenzy Strike", kind: "attack", target: "enemy", description: "A wild swing. 1d10 + Might.", focusCost: 0, cooldown: 0, attackAttr: "might", damage: "1d10" },
  "blood-howl": { id: "blood-howl", name: "Blood Howl", kind: "buff", target: "self", description: "Roar for blood: Rally (+3 attack & damage) for 3 turns.", focusCost: 2, cooldown: 3, ignoreDefense: true, selfStatus: { kind: "rally", turns: 3, magnitude: 3 } },
  rend: { id: "rend", name: "Rend", kind: "attack", target: "enemy", description: "Tear open a wound: 1d8 + Might and Bleed.", focusCost: 2, cooldown: 1, attackAttr: "might", damage: "1d8", applyStatus: { kind: "poison", turns: 3, magnitude: 3 } },
  whirlwind: { id: "whirlwind", name: "Whirlwind", kind: "attack", target: "all-enemies", description: "Spin through all foes for 1d8 + Might.", focusCost: 4, cooldown: 2, attackAttr: "might", damage: "1d8" },
  bloodlust: { id: "bloodlust", name: "Bloodlust", kind: "buff", target: "self", description: "Rally (+4) and Regen for 3 turns.", focusCost: 5, cooldown: 4, ignoreDefense: true, selfStatus: { kind: "rally", turns: 3, magnitude: 4 }, applyStatus: { kind: "regen", turns: 3, magnitude: 5 } },
  executioner: { id: "executioner", name: "Executioner", kind: "attack", target: "enemy", description: "A killing blow: 3d8 + Might.", focusCost: 5, cooldown: 3, attackAttr: "might", damage: "3d8" },

  // ================= Ranger (Agility) =================
  longshot: { id: "longshot", name: "Longshot", kind: "attack", target: "enemy", description: "A careful shot. 1d8 + Agility.", focusCost: 0, cooldown: 0, attackAttr: "agility", damage: "1d8" },
  "piercing-arrow": { id: "piercing-arrow", name: "Piercing Arrow", kind: "attack", target: "enemy", description: "Armor-piercing: 1d10 + Agility (+2).", focusCost: 2, cooldown: 1, attackAttr: "agility", damage: "1d10", flatDamageBonus: 2 },
  "twin-shot": { id: "twin-shot", name: "Twin Shot", kind: "attack", target: "enemy", description: "Two arrows, 1d6 + Agility each.", focusCost: 3, cooldown: 2, attackAttr: "agility", damage: "1d6", hits: 2 },
  volley: { id: "volley", name: "Volley", kind: "attack", target: "all-enemies", description: "Loose arrows at all foes for 1d6 + Agility.", focusCost: 4, cooldown: 2, attackAttr: "agility", damage: "1d6" },
  snare: { id: "snare", name: "Snare Shot", kind: "attack", target: "enemy", description: "Pin a foe: 1d6 + Agility and Stun.", focusCost: 3, cooldown: 3, attackAttr: "agility", damage: "1d6", applyStatus: { kind: "stun", turns: 1, magnitude: 0 } },
  "falcon-strike": { id: "falcon-strike", name: "Falcon Strike", kind: "attack", target: "enemy", description: "A diving shot for 2d8 + Agility.", focusCost: 5, cooldown: 3, attackAttr: "agility", damage: "2d8" },

  // ================= Necromancer (Wits) =================
  "shadow-bolt": { id: "shadow-bolt", element: "dark", name: "Shadow Bolt", kind: "attack", target: "enemy", description: "A bolt of dark aether. 1d8 + Wits.", focusCost: 0, cooldown: 0, attackAttr: "wits", damage: "1d8" },
  "siphon-soul": { id: "siphon-soul", element: "dark", name: "Siphon Soul", kind: "attack", target: "enemy", description: "Drain 1d8 + Wits and heal yourself.", focusCost: 3, cooldown: 1, attackAttr: "wits", damage: "1d8", selfStatus: { kind: "regen", turns: 1, magnitude: 8 } },
  plague: { id: "plague", element: "poison", name: "Plague", kind: "attack", target: "enemy", description: "Rotting touch: 1d6 + Wits and heavy Poison.", focusCost: 3, cooldown: 2, attackAttr: "wits", damage: "1d6", applyStatus: { kind: "poison", turns: 3, magnitude: 4 } },
  "bone-spear": { id: "bone-spear", element: "dark", name: "Bone Spear", kind: "attack", target: "enemy", description: "Impale a foe for 1d12 + Wits.", focusCost: 3, cooldown: 1, attackAttr: "wits", damage: "1d12" },
  "death-coil": { id: "death-coil", element: "dark", name: "Death Coil", kind: "attack", target: "enemy", description: "2d8 + Wits, healing you greatly.", focusCost: 5, cooldown: 3, attackAttr: "wits", damage: "2d8", selfStatus: { kind: "regen", turns: 1, magnitude: 12 } },
  epidemic: { id: "epidemic", element: "poison", name: "Epidemic", kind: "attack", target: "all-enemies", description: "Spread plague: 1d6 + Wits and Poison to all foes.", focusCost: 6, cooldown: 3, attackAttr: "wits", damage: "1d6", applyStatus: { kind: "poison", turns: 3, magnitude: 3 } },

  // ================= Cleric (Spirit) =================
  censure: { id: "censure", element: "holy", name: "Censure", kind: "attack", target: "enemy", description: "Radiant smite. 1d8 + Spirit.", focusCost: 0, cooldown: 0, attackAttr: "spirit", damage: "1d8" },
  "lay-hands": { id: "lay-hands", name: "Lay on Hands", kind: "heal", target: "ally", description: "A strong mend: 2d6 + Spirit.", focusCost: 3, cooldown: 1, heal: "2d6", ignoreDefense: true },
  "smite-evil": { id: "smite-evil", element: "holy", name: "Smite Evil", kind: "attack", target: "enemy", description: "Holy wrath for 2d6 + Spirit.", focusCost: 3, cooldown: 1, attackAttr: "spirit", damage: "2d6" },
  "divine-shield": { id: "divine-shield", name: "Divine Shield", kind: "buff", target: "ally", description: "Shield an ally for 14 damage.", focusCost: 3, cooldown: 3, ignoreDefense: true, applyStatus: { kind: "shield", turns: 4, magnitude: 14 } },
  "holy-nova": { id: "holy-nova", element: "holy", name: "Holy Nova", kind: "attack", target: "all-enemies", description: "Burst of light: 1d8 + Spirit to all foes.", focusCost: 5, cooldown: 3, attackAttr: "spirit", damage: "1d8" },
  resurrection: { id: "resurrection", name: "Resurrection", kind: "heal", target: "ally", description: "Restore a fallen ally to 75% health.", focusCost: 7, cooldown: 5, ignoreDefense: true, revive: 75 },

  // ---------------- Talent ultimates ----------------
  ragnarok: { id: "ragnarok", name: "Ragnarok", kind: "attack", target: "all-enemies", description: "Doom upon all foes: 3d8 + Might; Regen yourself.", focusCost: 8, cooldown: 5, attackAttr: "might", damage: "3d8", selfStatus: { kind: "regen", turns: 3, magnitude: 6 } },
  "rain-of-arrows": { id: "rain-of-arrows", name: "Rain of Arrows", kind: "attack", target: "all-enemies", description: "A storm of arrows: 2d8 + Agility to all foes.", focusCost: 7, cooldown: 4, attackAttr: "agility", damage: "2d8" },
  apocalypse: { id: "apocalypse", element: "dark", name: "Apocalypse", kind: "attack", target: "all-enemies", description: "Unmake the living: 2d8 + Wits and Poison, healing you.", focusCost: 9, cooldown: 5, attackAttr: "wits", damage: "2d8", applyStatus: { kind: "poison", turns: 3, magnitude: 4 }, selfStatus: { kind: "regen", turns: 2, magnitude: 10 } },
  "divine-judgment": { id: "divine-judgment", element: "holy", name: "Divine Judgment", kind: "attack", target: "all-enemies", description: "Heaven's verdict: 3d6 + Spirit to all foes.", focusCost: 8, cooldown: 5, attackAttr: "spirit", damage: "3d6" },
  earthshaker: {
    id: "earthshaker", name: "Earthshaker", kind: "attack", target: "all-enemies",
    description: "Smash the ground for 2d8 + Might to all foes; may stun.",
    focusCost: 6, cooldown: 4, attackAttr: "might", damage: "2d8",
    applyStatus: { kind: "stun", turns: 1, magnitude: 0 },
  },
  singularity: {
    id: "singularity", element: "dark", name: "Singularity", kind: "attack", target: "all-enemies",
    description: "Collapse space: 2d10 + Wits to all foes, Weakening them.",
    focusCost: 9, cooldown: 5, attackAttr: "wits", damage: "2d10",
    applyStatus: { kind: "weaken", turns: 2, magnitude: 3 },
  },
  "thousand-cuts": {
    id: "thousand-cuts", name: "Thousand Cuts", kind: "attack", target: "enemy",
    description: "Five lightning strikes of 1d6 + Agility each.",
    focusCost: 7, cooldown: 4, attackAttr: "agility", damage: "1d6", hits: 5,
  },
  sanctuary: {
    id: "sanctuary", name: "Sanctuary", kind: "heal", target: "all-allies",
    description: "Bathe the party in light: heal 2d8 + Spirit and grant Regen.",
    focusCost: 8, cooldown: 5, heal: "2d8", ignoreDefense: true,
    applyStatus: { kind: "regen", turns: 3, magnitude: 5 },
  },

  // ---------------- Talent-granted abilities ----------------
  "crushing-blow": {
    id: "crushing-blow", name: "Crushing Blow", kind: "attack", target: "enemy",
    description: "A devastating overhead blow: 2d10 + Might; cracks armor (Weaken).",
    focusCost: 3, cooldown: 3, attackAttr: "might", damage: "2d10",
    applyStatus: { kind: "weaken", turns: 2, magnitude: 2 },
  },
  "aether-lance": {
    id: "aether-lance", element: "lightning", name: "Aether Lance", kind: "attack", target: "enemy",
    description: "A focused spear of aether for 2d8 + Wits.",
    focusCost: 4, cooldown: 2, attackAttr: "wits", damage: "2d8",
  },
  eviscerate: {
    id: "eviscerate", name: "Eviscerate", kind: "attack", target: "enemy",
    description: "Open a foe up with a precise, brutal cut: 3d6 + Agility.",
    focusCost: 4, cooldown: 3, attackAttr: "agility", damage: "3d6",
  },
  entangle: {
    id: "entangle", name: "Entangle", kind: "attack", target: "all-enemies",
    description: "Roots erupt beneath all foes for 1d6 + Spirit; may Stun.",
    focusCost: 5, cooldown: 4, attackAttr: "spirit", damage: "1d6",
    applyStatus: { kind: "stun", turns: 1, magnitude: 0 },
  },
  bloodbath: {
    id: "bloodbath", name: "Bloodbath", kind: "attack", target: "all-enemies",
    description: "Carve through every foe for 1d10 + Might; Regenerate from the carnage.",
    focusCost: 5, cooldown: 3, attackAttr: "might", damage: "1d10",
    selfStatus: { kind: "regen", turns: 2, magnitude: 5 },
  },
  "venom-arrow": {
    id: "venom-arrow", element: "poison", name: "Venom Arrow", kind: "attack", target: "enemy",
    description: "A poisoned shaft: 1d10 + Agility and lingering Poison.",
    focusCost: 3, cooldown: 2, attackAttr: "agility", damage: "1d10",
    applyStatus: { kind: "poison", turns: 3, magnitude: 4 },
  },
  "soul-rend": {
    id: "soul-rend", element: "dark", name: "Soul Rend", kind: "attack", target: "enemy",
    description: "Tear at the soul for 2d10 + Wits, mending your own grievous wounds.",
    focusCost: 5, cooldown: 3, attackAttr: "wits", damage: "2d10",
    selfStatus: { kind: "regen", turns: 1, magnitude: 14 },
  },
  sanctify: {
    id: "sanctify", element: "holy", name: "Sanctify", kind: "heal", target: "all-allies",
    description: "Hallow the ground: heal the party 1d6 + Spirit and grant Regeneration.",
    focusCost: 5, cooldown: 4, heal: "1d6", ignoreDefense: true,
    applyStatus: { kind: "regen", turns: 3, magnitude: 5 },
  },

  // ---------------- Enemy abilities ----------------
  bite: { id: "bite", name: "Bite", kind: "attack", target: "enemy", description: "1d6 + Might.", focusCost: 0, cooldown: 0, attackAttr: "might", damage: "1d6" },
  claw: { id: "claw", name: "Claw", kind: "attack", target: "enemy", description: "1d8 + Might.", focusCost: 0, cooldown: 0, attackAttr: "might", damage: "1d8" },
  gnash: { id: "gnash", name: "Gnash", kind: "attack", target: "enemy", description: "1d10 + Might.", focusCost: 0, cooldown: 0, attackAttr: "might", damage: "1d10" },
  "spit-poison": { id: "spit-poison", element: "poison", name: "Spit Poison", kind: "attack", target: "enemy", description: "1d4 + poison.", focusCost: 0, cooldown: 2, attackAttr: "agility", damage: "1d4", applyStatus: { kind: "poison", turns: 3, magnitude: 2 } },
  hex: { id: "hex", element: "dark", name: "Hex", kind: "attack", target: "enemy", description: "1d6 + Wits, Weakens.", focusCost: 0, cooldown: 2, attackAttr: "wits", damage: "1d6", applyStatus: { kind: "weaken", turns: 2, magnitude: 2 } },
  "heavy-smash": { id: "heavy-smash", name: "Heavy Smash", kind: "attack", target: "enemy", description: "2d6 + Might.", focusCost: 0, cooldown: 2, attackAttr: "might", damage: "2d6" },
  wail: { id: "wail", element: "dark", name: "Withering Wail", kind: "attack", target: "all-enemies", description: "1d6 + Wits to all heroes.", focusCost: 0, cooldown: 3, attackAttr: "wits", damage: "1d6" },
  "drain-life": { id: "drain-life", element: "dark", name: "Drain Life", kind: "attack", target: "enemy", description: "1d8 + Wits; the caster mends.", focusCost: 0, cooldown: 2, attackAttr: "wits", damage: "1d8", selfStatus: { kind: "regen", turns: 1, magnitude: 8 } },
  "hollow-burst": { id: "hollow-burst", element: "dark", name: "Hollow Burst", kind: "attack", target: "all-enemies", description: "2d6 + Wits to all heroes.", focusCost: 0, cooldown: 3, attackAttr: "wits", damage: "2d6" },
  "crown-smite": { id: "crown-smite", name: "Crown Smite", kind: "attack", target: "enemy", description: "3d6 + Might, may stun.", focusCost: 0, cooldown: 2, attackAttr: "might", damage: "3d6", applyStatus: { kind: "stun", turns: 1, magnitude: 0 } },
  "dark-mend": { id: "dark-mend", name: "Dark Mend", kind: "heal", target: "self", description: "The boss draws on the Hollowing to heal.", focusCost: 0, cooldown: 3, ignoreDefense: true, heal: "2d6", selfStatus: { kind: "regen", turns: 0, magnitude: 0 } },

  // ---- Rimewood (frost) enemy abilities ----
  "frost-bite": { id: "frost-bite", element: "ice", name: "Frostbite", kind: "attack", target: "enemy", description: "1d6 ice + Chill.", focusCost: 0, cooldown: 1, attackAttr: "wits", damage: "1d6", applyStatus: { kind: "chill", turns: 2, magnitude: 2 } },
  "ice-shard": { id: "ice-shard", element: "ice", name: "Ice Shard", kind: "attack", target: "enemy", description: "1d8 ice.", focusCost: 0, cooldown: 0, attackAttr: "wits", damage: "1d8" },
  "frost-nova": { id: "frost-nova", element: "ice", name: "Frost Nova", kind: "attack", target: "all-enemies", description: "1d6 ice + Chill to all heroes.", focusCost: 0, cooldown: 3, attackAttr: "wits", damage: "1d6", applyStatus: { kind: "chill", turns: 2, magnitude: 2 } },

  // ---- Blightfen (poison) enemy abilities ----
  "blight-spit": { id: "blight-spit", element: "poison", name: "Blight Spit", kind: "attack", target: "enemy", description: "1d6 + Agility and lingering Poison.", focusCost: 0, cooldown: 1, attackAttr: "agility", damage: "1d6", applyStatus: { kind: "poison", turns: 3, magnitude: 3 } },
  "corrosive-touch": { id: "corrosive-touch", element: "poison", name: "Corrosive Touch", kind: "attack", target: "enemy", description: "1d8 + Might; rot eats at armor (Weaken).", focusCost: 0, cooldown: 2, attackAttr: "might", damage: "1d8", applyStatus: { kind: "weaken", turns: 2, magnitude: 2 } },
  miasma: { id: "miasma", element: "poison", name: "Miasma", kind: "attack", target: "all-enemies", description: "1d6 + Wits and Poison to all heroes.", focusCost: 0, cooldown: 3, attackAttr: "wits", damage: "1d6", applyStatus: { kind: "poison", turns: 3, magnitude: 3 } },
};

export function getAbility(id: string): Ability {
  const a = ABILITIES[id];
  if (!a) throw new Error(`Unknown ability: ${id}`);
  return localizeDef("ability", a);
}
