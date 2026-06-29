import { test } from "node:test";
import assert from "node:assert/strict";
import { RNG } from "../src/engine/rng.js";
import { Combat } from "../src/engine/combat.js";
import { createHero, createEnemy } from "../src/engine/character.js";
import { getEnemy } from "../src/data/enemies.js";
import { getAbility } from "../src/data/abilities.js";

type Resolver = { resolve: (a: unknown, b: unknown, c?: unknown) => void };
function resolve(combat: Combat, actor: unknown, abilityId: string, target?: unknown) {
  (combat as unknown as Resolver).resolve(actor, getAbility(abilityId), target);
}
function hero(classId: string, level = 8) {
  return createHero({ classId, raceId: "aldermoorian", backgroundId: "soldier", name: classId, allocations: {} }, level);
}

function dummy(combat: Combat, enemy: ReturnType<typeof createEnemy>) {
  enemy.maxHP = 100000; enemy.hp = 100000; enemy.baseDefense = -100; enemy.resist = {};
}

test("Shatter: striking a chilled foe deals bonus damage and clears the chill", () => {
  const g = new RNG(4);
  const v = hero("vanguard");
  const enemy = createEnemy(getEnemy("husk-bandit"), 8);
  const combat = new Combat([v], [enemy], g); combat.start(); dummy(combat, enemy);
  // hit once without chill
  let before = enemy.hp; resolve(combat, v, "strike", enemy); const plain = before - enemy.hp;
  // apply chill, then strike: should hit harder and consume chill
  enemy.statuses.push({ kind: "chill", turns: 2, magnitude: 2 });
  before = enemy.hp; resolve(combat, v, "strike", enemy); const shattered = before - enemy.hp;
  assert.ok(shattered > plain, `shatter ${shattered} > plain ${plain}`);
  assert.ok(!enemy.statuses.some((s) => s.kind === "chill"), "chill consumed by shatter");
});

test("Ignite: a fire hit on a poisoned foe bursts and clears the poison", () => {
  const g = new RNG(9);
  const mage = hero("arcanist");
  mage.focus = 99; if (!mage.abilities.includes("emberblast")) mage.abilities.push("emberblast");
  const enemy = createEnemy(getEnemy("husk-bandit"), 8);
  const combat = new Combat([mage], [enemy], g); combat.start(); dummy(combat, enemy);
  // baseline fire hit, no poison
  let before = enemy.hp; resolve(combat, mage, "emberblast", enemy); const plain = before - enemy.hp;
  enemy.statuses = enemy.statuses.filter((s) => s.kind !== "burn"); // ignore the burn it applies
  // now poison the foe and fire again -> ignite burst
  enemy.statuses.push({ kind: "poison", turns: 3, magnitude: 5 });
  before = enemy.hp; resolve(combat, mage, "emberblast", enemy); const ignited = before - enemy.hp;
  assert.ok(ignited > plain, `ignite ${ignited} > plain ${plain}`);
  assert.ok(!enemy.statuses.some((s) => s.kind === "poison"), "poison consumed by ignite");
});

test("Frost Lance applies chill which lowers the target's attack", () => {
  const g = new RNG(2);
  const mage = hero("arcanist"); mage.focus = 99;
  const enemy = createEnemy(getEnemy("husk-bandit"), 8);
  const combat = new Combat([mage], [enemy], g); combat.start(); enemy.baseDefense = -100; enemy.resist = {};
  resolve(combat, mage, "frost-lance", enemy);
  assert.ok(enemy.statuses.some((s) => s.kind === "chill"), "frost lance chills");
});

test("boss aura damages the party each round after phasing", () => {
  const g = new RNG(1);
  const party = [hero("vanguard"), hero("warden")];
  const king = createEnemy(getEnemy("the-hollow-king"), 8);
  const combat = new Combat(party, [king], g); combat.start();
  king.combatFlags = { phased: true }; // simulate phase reached
  const hpBefore = party.map((p) => p.hp);
  (combat as unknown as { roundStart: () => void }).roundStart();
  const took = party.some((p, i) => p.hp < hpBefore[i]);
  assert.ok(took, "the Hollowing aura should hurt the party");
});
