import { test } from "node:test";
import assert from "node:assert/strict";
import { NODES, START_NODE } from "../src/data/story.js";
import { ENEMIES, getEnemy } from "../src/data/enemies.js";
import { getAbility } from "../src/data/abilities.js";
import { Combat } from "../src/engine/combat.js";
import { RNG } from "../src/engine/rng.js";
import { createHero, createEnemy } from "../src/engine/character.js";
import type { Ability, Combatant } from "../src/engine/types.js";

// ---------------------------------------------------------------------------
// Story-graph QA: the whole expanded campaign holds together structurally.
// ---------------------------------------------------------------------------

test("every non-ending story node is reachable from the start", () => {
  const seen = new Set<string>([START_NODE]);
  const queue = [START_NODE];
  while (queue.length) {
    const node = NODES[queue.shift()!];
    for (const c of node.choices) {
      for (const t of [c.goto, c.effectsNext, c.combat?.victoryNode, c.combat?.defeatNode, c.check?.successNode, c.check?.failNode]) {
        if (t && !seen.has(t)) { seen.add(t); queue.push(t); }
      }
    }
  }
  for (const id of Object.keys(NODES)) {
    if (NODES[id].isEnding) continue; // endings (notably defeat) are entered by the combat layer
    assert.ok(seen.has(id), `node "${id}" is unreachable from ${START_NODE}`);
  }
});

test("no story node is a dead end — every node offers at least one choice", () => {
  for (const node of Object.values(NODES)) {
    assert.ok(node.choices.length > 0, `node "${node.id}" has no choices`);
  }
});

test("every combat in the story references defined enemies", () => {
  for (const node of Object.values(NODES)) {
    for (const c of node.choices) {
      if (c.combat) for (const e of c.combat.enemies) assert.ok(ENEMIES[e], `${node.id}: unknown enemy ${e}`);
    }
  }
});

// ---------------------------------------------------------------------------
// Combat QA: drive real fights headlessly through the engine. Players pick the
// strongest affordable attack; enemies use their AI. This exercises every
// enemy's abilities/resists plus boss phases, auras and elemental reactions.
// ---------------------------------------------------------------------------

function averageDamage(a: Ability): number {
  if (!a.damage) return -1;
  const m = a.damage.match(/^(\d*)d(\d+)([+-]\d+)?$/i);
  if (!m) return 0;
  const count = m[1] === "" ? 1 : parseInt(m[1], 10);
  const sides = parseInt(m[2], 10);
  const flat = m[3] ? parseInt(m[3], 10) : 0;
  return (count * (sides + 1) / 2 + flat + (a.flatDamageBonus ?? 0)) * (a.hits ?? 1);
}

function strongParty(level: number): Combatant[] {
  const classes = ["vanguard", "arcanist", "warden", "berserker"];
  return classes.map((c, i) => createHero({ classId: c, raceId: "aldermoorian", backgroundId: "wanderer", name: `Hero${i}`, allocations: {} }, level));
}

// Returns the winning side, or null if the fight failed to resolve in time.
function runFight(enemyIds: string[], seed: number, level = 18): "players" | "enemies" | null {
  const rng = new RNG(seed);
  const players = strongParty(level);
  const enemies = enemyIds.map((id) => createEnemy(getEnemy(id)));
  const combat = new Combat(players, enemies, rng);
  combat.start();
  let guard = 0;
  while (!combat.isOver() && guard++ < 5000) {
    if (combat.isPlayerTurn()) {
      const actor = combat.currentActor();
      const usable = actor.abilities.map(getAbility).filter((a) => combat.abilityUsable(actor, a));
      if (usable.length === 0) { combat.endTurnManually(); continue; }
      // prefer the strongest damaging move; fall back to whatever is usable
      const attacks = usable.filter((a) => a.damage).sort((x, y) => averageDamage(y) - averageDamage(x));
      const ability = attacks[0] ?? usable[0];
      const target = combat.validTargets(actor, ability)[0];
      combat.act(actor.id, ability.id, target?.id);
    } else {
      combat.enemyAct();
    }
  }
  return combat.isOver();
}

test("every defined enemy fights to a clean resolution (no throws, no stalls)", () => {
  for (const id of Object.keys(ENEMIES)) {
    const result = runFight([id], 12345);
    assert.ok(result !== null, `fight vs ${id} did not resolve within the turn cap`);
  }
});

test("a leveled party defeats every boss — exercising phases, auras and reactions", () => {
  const bosses = Object.values(ENEMIES).filter((e) => e.isBoss).map((e) => e.id);
  assert.ok(bosses.length >= 4, "the campaign has its bosses");
  for (const id of bosses) {
    assert.equal(runFight([id], 777), "players", `a leveled party should defeat ${id}`);
  }
});

test("a representative multi-enemy encounter resolves cleanly", () => {
  assert.ok(runFight(["hollow-mage", "hollow-mage", "wraith-knight"], 99) !== null);
});
