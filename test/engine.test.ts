import { test } from "node:test";
import assert from "node:assert/strict";
import { RNG } from "../src/engine/rng.js";
import { roll, skillCheck, modifier, attackRoll } from "../src/engine/dice.js";
import { createPlayer, createEnemy, grantXP, xpForLevel, defenseOf } from "../src/engine/character.js";
import { Combat } from "../src/engine/combat.js";
import { getEnemy } from "../src/data/enemies.js";
import { Game } from "../src/engine/game.js";

test("dice notation parses and stays in range", () => {
  const g = new RNG(1);
  for (let i = 0; i < 200; i++) {
    const r = roll("2d6+3", g);
    assert.ok(r.total >= 5 && r.total <= 15, `2d6+3 -> ${r.total}`);
    assert.equal(r.rolls.length, 2);
  }
});

test("modifier formula matches d20 convention", () => {
  assert.equal(modifier(10), 0);
  assert.equal(modifier(16), 3);
  assert.equal(modifier(8), -1);
  assert.equal(modifier(20), 5);
});

test("nat 20 always succeeds, nat 1 always fails", () => {
  // search seeds until we observe both extremes, asserting the rule each time
  let sawNat20 = false, sawNat1 = false;
  for (let s = 0; s < 500 && !(sawNat20 && sawNat1); s++) {
    const g = new RNG(s);
    const c = skillCheck(-20, 100, g); // impossible DC
    if (c.die === 20) { assert.ok(c.success); sawNat20 = true; }
    const g2 = new RNG(s + 9999);
    const c2 = skillCheck(50, 0, g2); // trivial DC
    if (c2.die === 1) { assert.ok(!c2.success); sawNat1 = true; }
  }
  assert.ok(sawNat20 && sawNat1, "should observe both nat20 and nat1");
});

test("attack roll hit/crit/fumble flags are consistent", () => {
  const g = new RNG(7);
  for (let i = 0; i < 300; i++) {
    const a = attackRoll(5, 14, g);
    if (a.crit) assert.equal(a.die, 20);
    if (a.fumble) assert.equal(a.die, 1);
    if (a.die === 20) assert.ok(a.hit);
    if (a.die === 1) assert.ok(!a.hit);
  }
});

test("characters build with sane derived stats", () => {
  const v = createPlayer("vanguard");
  assert.ok(v.maxHP > 30);
  assert.ok(defenseOf(v) >= 13);
  assert.equal(v.hp, v.maxHP);
  assert.ok(v.abilities.includes("strike"));
});

test("leveling raises stats and unlocks abilities", () => {
  const a = createPlayer("arcanist");
  const startHP = a.maxHP;
  const store = { value: 0 };
  // dump enough XP to vault several levels
  grantXP(a, xpForLevel(1) + xpForLevel(2) + xpForLevel(3), store);
  assert.ok(a.level >= 3, `level ${a.level}`);
  assert.ok(a.maxHP > startHP);
  assert.ok(a.abilities.includes("chain-spark"), "unlocks lvl-3 ability");
});

test("a full combat resolves to a winner deterministically", () => {
  const g = new RNG(42);
  const party = [createPlayer("vanguard"), createPlayer("arcanist"), createPlayer("shade"), createPlayer("warden")];
  const enemies = [createEnemy(getEnemy("hollow-rat"), 1), createEnemy(getEnemy("rot-crawler"), 1)];
  const combat = new Combat(party, enemies, g);
  combat.start();
  let guard = 0;
  while (!combat.ended && guard < 1000) {
    if (combat.isPlayerTurn()) {
      const actor = combat.currentActor();
      // basic AI for the test: first usable ability on first valid target
      const ability = actor.abilities.map((id) => combat["resolveTargets"] && id);
      const abil = actor.abilities.find((id) => combat.abilityUsable(actor, getAbilitySafe(id)));
      const ab = getAbilitySafe(abil!);
      const targets = combat.validTargets(actor, ab);
      combat.act(actor.id, ab.id, targets[0]?.id);
    } else {
      combat.enemyAct();
    }
    guard++;
  }
  assert.ok(combat.ended, "combat should end");
  const winner = combat.isOver();
  assert.ok(winner === "players" || winner === "enemies");
});

import { getAbility } from "../src/data/abilities.js";
function getAbilitySafe(id: string) { return getAbility(id); }

function sampleBuilds() {
  return [
    { classId: "vanguard", raceId: "stout", backgroundId: "soldier", name: "A", allocations: { might: 2 } },
    { classId: "arcanist", raceId: "feykin", backgroundId: "scholar", name: "B", allocations: {} },
    { classId: "shade", raceId: "sylvan", backgroundId: "outlaw", name: "C", allocations: {}, traitId: "fleet" },
    { classId: "warden", raceId: "aldermoorian", backgroundId: "acolyte", name: "D", allocations: {} },
  ];
}

test("full game can be created and advanced through a node", () => {
  const game = new Game();
  game.newGame(sampleBuilds());
  assert.equal(game.party.length, 4);
  assert.ok(game.gold >= 50);
  assert.equal(game.currentNode().id, "intro");
  game.goto("town1");
  assert.equal(game.currentNode().id, "town1");
  const before = game.gold;
  game.applyEffects({ gold: 45 });
  assert.equal(game.gold, before + 45);
});

test("race/background/trait bonuses fold into a hero's stats", () => {
  // Stoutkin (Stoneblood +10 HP) Soldier (Drilled +6 HP) should be tankier than baseline.
  const plain = createHero({ classId: "vanguard", raceId: "aldermoorian", backgroundId: "noble", name: "P", allocations: {} });
  const tanky = createHero({ classId: "vanguard", raceId: "stout", backgroundId: "soldier", name: "T", allocations: {}, traitId: "tough" });
  assert.ok(tanky.maxHP > plain.maxHP, `tanky ${tanky.maxHP} vs plain ${plain.maxHP}`);
  // point-buy allocation raises the attribute
  const strong = createHero({ classId: "vanguard", raceId: "orcborn", backgroundId: "soldier", name: "S", allocations: { might: 4 } });
  assert.ok(strong.attributes.might >= plain.attributes.might + 4);
  assert.ok(strong.traits.includes("bloodrage"));
});

test("save serialize → validate → import roundtrips", () => {
  const game = new Game();
  game.newGame(sampleBuilds());
  game.goto("town1");
  game.gold = 123;
  const json = game.serialize();
  const parsed = JSON.parse(json);
  assert.ok(Game.validate(parsed), "serialized save should validate");
  assert.ok(!Game.validate({ junk: true }), "garbage should fail validation");
  const g2 = new Game();
  assert.ok(g2.importString(json), "import should succeed");
  assert.equal(g2.gold, 123);
  assert.equal(g2.nodeId, "town1");
  assert.equal(g2.party.length, 4);
});

import { createHero } from "../src/engine/character.js";
