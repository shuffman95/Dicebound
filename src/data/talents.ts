import { TalentNode } from "../engine/types.js";

// One talent tree per class. Tiers gate on points already spent in the tree
// (requiresPoints). Every node has a real implemented effect: passive stat mods,
// a granted ability, or a combat modifier (crit range / lifesteal).
export const TALENT_TREES: Record<string, TalentNode[]> = {
  vanguard: [
    { id: "v-toughened", name: "Toughened", description: "+12 max HP.", tier: 0, requiresPoints: 0, cost: 1, effect: { mods: { hpBonus: 12 } } },
    { id: "v-edge", name: "Honed Edge", description: "+2 damage.", tier: 0, requiresPoints: 0, cost: 1, effect: { mods: { damageBonus: 2 } } },
    { id: "v-bastion", name: "Bastion", description: "+2 Defense.", tier: 1, requiresPoints: 2, cost: 1, effect: { mods: { defenseBonus: 2 } } },
    { id: "v-secondwind", name: "Second Wind", description: "Heal for 10% of melee damage dealt.", tier: 1, requiresPoints: 2, cost: 1, effect: { lifestealPct: 0.1 } },
    { id: "v-juggernaut", name: "Juggernaut", description: "+18 max HP, +1 Might.", tier: 2, requiresPoints: 4, cost: 1, effect: { mods: { hpBonus: 18, attrBonus: { might: 1 } } } },
    { id: "v-earthshaker", name: "Earthshaker", description: "Unlock the ultimate: Earthshaker (AoE stun).", tier: 3, requiresPoints: 5, cost: 1, ultimate: true, effect: { grantsAbility: "earthshaker" } },
  ],
  arcanist: [
    { id: "a-focus", name: "Focused Mind", description: "+6 max Focus.", tier: 0, requiresPoints: 0, cost: 1, effect: { mods: { focusBonus: 6 } } },
    { id: "a-power", name: "Spell Power", description: "+3 damage.", tier: 0, requiresPoints: 0, cost: 1, effect: { mods: { damageBonus: 3 } } },
    { id: "a-penetrate", name: "Penetrating Bolts", description: "+2 attack.", tier: 1, requiresPoints: 2, cost: 1, effect: { mods: { attackBonus: 2 } } },
    { id: "a-crit", name: "Critical Surge", description: "Crit on a roll of 19-20.", tier: 1, requiresPoints: 2, cost: 1, effect: { critBonus: 1 } },
    { id: "a-archmage", name: "Archmage", description: "+2 Wits, +6 Focus.", tier: 2, requiresPoints: 4, cost: 1, effect: { mods: { attrBonus: { wits: 2 }, focusBonus: 6 } } },
    { id: "a-singularity", name: "Singularity", description: "Unlock the ultimate: Singularity (massive AoE).", tier: 3, requiresPoints: 5, cost: 1, ultimate: true, effect: { grantsAbility: "singularity" } },
  ],
  shade: [
    { id: "s-deadly", name: "Deadly", description: "+3 damage.", tier: 0, requiresPoints: 0, cost: 1, effect: { mods: { damageBonus: 3 } } },
    { id: "s-evasion", name: "Evasion", description: "+2 Defense.", tier: 0, requiresPoints: 0, cost: 1, effect: { mods: { defenseBonus: 2 } } },
    { id: "s-lethality", name: "Lethality", description: "Crit on a roll of 18-20.", tier: 1, requiresPoints: 2, cost: 1, effect: { critBonus: 2 } },
    { id: "s-vampiric", name: "Vampiric Edge", description: "Heal for 15% of damage dealt.", tier: 1, requiresPoints: 2, cost: 1, effect: { lifestealPct: 0.15 } },
    { id: "s-shadowmaster", name: "Shadowmaster", description: "+2 Agility, +2 attack.", tier: 2, requiresPoints: 4, cost: 1, effect: { mods: { attrBonus: { agility: 2 }, attackBonus: 2 } } },
    { id: "s-thousand", name: "Thousand Cuts", description: "Unlock the ultimate: Thousand Cuts (5 hits).", tier: 3, requiresPoints: 5, cost: 1, ultimate: true, effect: { grantsAbility: "thousand-cuts" } },
  ],
  warden: [
    { id: "w-vigor", name: "Vigor", description: "+10 max HP.", tier: 0, requiresPoints: 0, cost: 1, effect: { mods: { hpBonus: 10 } } },
    { id: "w-wellspring", name: "Wellspring", description: "+8 max Focus.", tier: 0, requiresPoints: 0, cost: 1, effect: { mods: { focusBonus: 8 } } },
    { id: "w-restoration", name: "Restoration", description: "+1 Spirit (stronger heals).", tier: 1, requiresPoints: 2, cost: 1, effect: { mods: { attrBonus: { spirit: 1 } } } },
    { id: "w-thorns", name: "Thornward", description: "+2 Defense, heal 10% of damage dealt.", tier: 1, requiresPoints: 2, cost: 1, effect: { mods: { defenseBonus: 2 }, lifestealPct: 0.1 } },
    { id: "w-hierophant", name: "Hierophant", description: "+2 Spirit, +6 Focus.", tier: 2, requiresPoints: 4, cost: 1, effect: { mods: { attrBonus: { spirit: 2 }, focusBonus: 6 } } },
    { id: "w-sanctuary", name: "Sanctuary", description: "Unlock the ultimate: Sanctuary (party heal + Regen).", tier: 3, requiresPoints: 5, cost: 1, ultimate: true, effect: { grantsAbility: "sanctuary" } },
  ],
  berserker: [
    { id: "b-savage", name: "Savage", description: "+3 damage.", tier: 0, requiresPoints: 0, cost: 1, effect: { mods: { damageBonus: 3 } } },
    { id: "b-thickhide", name: "Thick Hide", description: "+10 max HP.", tier: 0, requiresPoints: 0, cost: 1, effect: { mods: { hpBonus: 10 } } },
    { id: "b-bloodthirst", name: "Bloodthirst", description: "Heal for 12% of damage dealt.", tier: 1, requiresPoints: 2, cost: 1, effect: { lifestealPct: 0.12 } },
    { id: "b-reckless", name: "Reckless", description: "Crit on a roll of 19-20.", tier: 1, requiresPoints: 2, cost: 1, effect: { critBonus: 1 } },
    { id: "b-titan", name: "Titanic", description: "+18 max HP, +1 Might.", tier: 2, requiresPoints: 4, cost: 1, effect: { mods: { hpBonus: 18, attrBonus: { might: 1 } } } },
    { id: "b-ragnarok", name: "Ragnarok", description: "Unlock the ultimate: Ragnarok (AoE + Regen).", tier: 3, requiresPoints: 5, cost: 1, ultimate: true, effect: { grantsAbility: "ragnarok" } },
  ],
  ranger: [
    { id: "r-precision", name: "Precision", description: "+2 attack.", tier: 0, requiresPoints: 0, cost: 1, effect: { mods: { attackBonus: 2 } } },
    { id: "r-deadeye", name: "Deadeye", description: "+3 damage.", tier: 0, requiresPoints: 0, cost: 1, effect: { mods: { damageBonus: 3 } } },
    { id: "r-sharpshooter", name: "Sharpshooter", description: "Crit on a roll of 18-20.", tier: 1, requiresPoints: 2, cost: 1, effect: { critBonus: 2 } },
    { id: "r-evasion", name: "Evasion", description: "+2 Defense.", tier: 1, requiresPoints: 2, cost: 1, effect: { mods: { defenseBonus: 2 } } },
    { id: "r-master", name: "Master Archer", description: "+2 Agility, +2 attack.", tier: 2, requiresPoints: 4, cost: 1, effect: { mods: { attrBonus: { agility: 2 }, attackBonus: 2 } } },
    { id: "r-rain", name: "Rain of Arrows", description: "Unlock the ultimate: Rain of Arrows.", tier: 3, requiresPoints: 5, cost: 1, ultimate: true, effect: { grantsAbility: "rain-of-arrows" } },
  ],
  necromancer: [
    { id: "n-power", name: "Dark Power", description: "+3 damage.", tier: 0, requiresPoints: 0, cost: 1, effect: { mods: { damageBonus: 3 } } },
    { id: "n-focus", name: "Soul Reserve", description: "+6 max Focus.", tier: 0, requiresPoints: 0, cost: 1, effect: { mods: { focusBonus: 6 } } },
    { id: "n-leech", name: "Life Leech", description: "Heal for 15% of damage dealt.", tier: 1, requiresPoints: 2, cost: 1, effect: { lifestealPct: 0.15 } },
    { id: "n-darkmind", name: "Dark Mind", description: "+2 attack.", tier: 1, requiresPoints: 2, cost: 1, effect: { mods: { attackBonus: 2 } } },
    { id: "n-lich", name: "Lichdom", description: "+2 Wits, +6 Focus.", tier: 2, requiresPoints: 4, cost: 1, effect: { mods: { attrBonus: { wits: 2 }, focusBonus: 6 } } },
    { id: "n-apocalypse", name: "Apocalypse", description: "Unlock the ultimate: Apocalypse.", tier: 3, requiresPoints: 5, cost: 1, ultimate: true, effect: { grantsAbility: "apocalypse" } },
  ],
  cleric: [
    { id: "c-faith", name: "Devotion", description: "+8 max Focus.", tier: 0, requiresPoints: 0, cost: 1, effect: { mods: { focusBonus: 8 } } },
    { id: "c-zeal", name: "Zeal", description: "+2 damage.", tier: 0, requiresPoints: 0, cost: 1, effect: { mods: { damageBonus: 2 } } },
    { id: "c-divine", name: "Divine Favor", description: "+1 Spirit (stronger heals & smites).", tier: 1, requiresPoints: 2, cost: 1, effect: { mods: { attrBonus: { spirit: 1 } } } },
    { id: "c-aegis", name: "Aegis", description: "+3 Defense.", tier: 1, requiresPoints: 2, cost: 1, effect: { mods: { defenseBonus: 3 } } },
    { id: "c-saint", name: "Sainthood", description: "+2 Spirit, +6 Focus.", tier: 2, requiresPoints: 4, cost: 1, effect: { mods: { attrBonus: { spirit: 2 }, focusBonus: 6 } } },
    { id: "c-judgment", name: "Divine Judgment", description: "Unlock the ultimate: Divine Judgment.", tier: 3, requiresPoints: 5, cost: 1, ultimate: true, effect: { grantsAbility: "divine-judgment" } },
  ],
};

export function talentTreeFor(classId: string): TalentNode[] { return TALENT_TREES[classId] ?? []; }
export function getTalent(classId: string, nodeId: string): TalentNode | undefined {
  return (TALENT_TREES[classId] ?? []).find((n) => n.id === nodeId);
}
