import { RNG } from "./rng.js";

export interface DiceResult {
  rolls: number[];
  total: number;
  notation: string;
}

// Parse and roll dice notation like "2d6+3", "1d20", "d8-1".
export function roll(notation: string, gen: RNG): DiceResult {
  const m = notation.replace(/\s/g, "").match(/^(\d*)d(\d+)([+-]\d+)?$/i);
  if (!m) throw new Error(`Bad dice notation: ${notation}`);
  const count = m[1] === "" ? 1 : parseInt(m[1], 10);
  const sides = parseInt(m[2], 10);
  const mod = m[3] ? parseInt(m[3], 10) : 0;
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) rolls.push(gen.int(1, sides));
  const total = rolls.reduce((a, b) => a + b, 0) + mod;
  return { rolls, total: Math.max(0, total), notation };
}

// A single d20.
export function d20(gen: RNG): number {
  return gen.int(1, 20);
}

// Attribute modifier, classic (floor((score-10)/2)).
export function modifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export interface CheckResult {
  die: number;
  modifier: number;
  total: number;
  dc: number;
  success: boolean;
  crit: boolean; // natural 20
  fumble: boolean; // natural 1
}

// A d20 skill check vs a difficulty class.
export function skillCheck(mod: number, dc: number, gen: RNG): CheckResult {
  const die = d20(gen);
  const total = die + mod;
  const crit = die === 20;
  const fumble = die === 1;
  // Natural 20 always succeeds, natural 1 always fails.
  const success = crit || (!fumble && total >= dc);
  return { die, modifier: mod, total, dc, success, crit, fumble };
}

export interface AttackResult {
  die: number;
  attackTotal: number;
  hit: boolean;
  crit: boolean;
  fumble: boolean;
}

// An attack roll vs a defense value (armor class). critFrom widens the crit
// range (e.g. 19 => crit on 19-20) via talents.
export function attackRoll(attackBonus: number, defense: number, gen: RNG, critFrom = 20): AttackResult {
  const die = d20(gen);
  const attackTotal = die + attackBonus;
  const fumble = die === 1;
  const crit = !fumble && die >= critFrom;
  const hit = crit || (!fumble && attackTotal >= defense);
  return { die, attackTotal, hit, crit, fumble };
}
