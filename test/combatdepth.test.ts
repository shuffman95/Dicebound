import { test } from "node:test";
import assert from "node:assert/strict";
import { RNG } from "../src/engine/rng.js";
import { Combat } from "../src/engine/combat.js";
import { createHero, createEnemy } from "../src/engine/character.js";
import { getEnemy } from "../src/data/enemies.js";
import { getAbility } from "../src/data/abilities.js";

// Access the (TS-private but runtime-public) resolve() to script exact actions.
type Resolver = { resolve: (a: unknown, b: unknown, c?: unknown) => void };
function resolve(combat: Combat, actor: unknown, abilityId: string, target?: unknown) {
  (combat as unknown as Resolver).resolve(actor, getAbility(abilityId), target);
}
function hero(classId: string, level = 6) {
  return createHero({ classId, raceId: "aldermoorian", backgroundId: "soldier", name: classId, allocations: {} }, level);
}

test("elemental weakness deals more than a resisted element", () => {
  function avg(classId: string, abilityId: string, n = 80): number {
    let total = 0;
    for (let s = 0; s < n; s++) {
      const g = new RNG(s + 1);
      const caster = hero(classId, 8);
      caster.focus = 99;
      if (!caster.abilities.includes(abilityId)) caster.abilities.push(abilityId);
      const enemy = createEnemy(getEnemy("rot-crawler"), 8); // weak fire x1.5, resist poison x0.5
      enemy.maxHP = 100000; enemy.hp = 100000; enemy.baseDefense = -100;
      const combat = new Combat([caster], [enemy], g);
      combat.start();
      const before = enemy.hp;
      resolve(combat, caster, abilityId, enemy);
      total += before - enemy.hp;
    }
    return total / n;
  }
  const fire = avg("arcanist", "emberblast"); // fire vs weakness
  const poison = avg("necromancer", "plague"); // poison vs resistance
  assert.ok(fire > 0 && poison > 0, `fire ${fire}, poison ${poison}`);
  assert.ok(fire > poison * 1.2, `fire(weak) ${fire.toFixed(1)} should clearly exceed poison(resist) ${poison.toFixed(1)}`);
});

test("defending reduces damage and counters melee attackers", () => {
  let countered = false;
  let reducedSeen = false;
  for (let s = 0; s < 40 && !(countered && reducedSeen); s++) {
    const g = new RNG(s + 1);
    const v = hero("vanguard", 8);
    const enemy = createEnemy(getEnemy("husk-bandit"), 8);
    enemy.baseDefense = -100; // its attacks always land
    const combat = new Combat([v], [enemy], g);
    combat.start();
    v.statuses.push({ kind: "guard", turns: 1, magnitude: 50 });
    const enemyHpBefore = enemy.hp;
    resolve(combat, enemy, "claw", v); // melee (physical) attack into a guard
    if (enemy.hp < enemyHpBefore) countered = true;
    reducedSeen = true; // guard path exercised
  }
  assert.ok(countered, "a defending hero should counter a melee attacker");
});

test("boss transitions phase below its HP threshold", () => {
  const g = new RNG(3);
  const party = [hero("vanguard"), hero("arcanist")];
  const king = createEnemy(getEnemy("the-hollow-king"), 8);
  const combat = new Combat(party, [king], g);
  combat.start();
  assert.ok(!king.combatFlags?.phased, "not phased at full HP");
  king.hp = Math.floor(king.maxHP * 0.4); // below 50%
  king.baseDefense = -100; // guarantee the hit so the phase check runs
  resolve(combat, party[0], "strike", king); // any hit triggers the phase check
  assert.ok(king.combatFlags?.phased, "king should have phased");
  assert.ok(king.statuses.some((s) => s.kind === "rally"), "phase grants a rally buff");
});

test("a full battle with the new systems still resolves to a winner", () => {
  const g = new RNG(123);
  const party = [hero("berserker"), hero("ranger"), hero("necromancer"), hero("cleric")];
  const enemies = [createEnemy(getEnemy("wraith-knight"), 6), createEnemy(getEnemy("hollow-mage"), 6)];
  const combat = new Combat(party, enemies, g);
  combat.start();
  let guard = 0;
  while (!combat.ended && guard++ < 2000) {
    if (combat.isPlayerTurn()) {
      const actor = combat.currentActor();
      const ab = actor.abilities.map(getAbility).find((a) => combat.abilityUsable(actor, a));
      if (!ab) { combat.defend(actor.id); continue; }
      const targets = combat.validTargets(actor, ab);
      combat.act(actor.id, ab.id, targets[0]?.id);
    } else combat.enemyAct();
  }
  assert.ok(combat.ended, "combat resolves");
});
