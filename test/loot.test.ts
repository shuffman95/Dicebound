import { test } from "node:test";
import assert from "node:assert/strict";
import { RNG } from "../src/engine/rng.js";
import { generateGear, instanceMods, setBonuses, baseInstance, instanceName, repairCost, sellValue, RARITY } from "../src/engine/loot.js";
import { createHero, equipMods, equippedInstances, defenseOf } from "../src/engine/character.js";
import { Game } from "../src/engine/game.js";

test("generated gear has the right affix count for its rarity", () => {
  const g = new RNG(5);
  for (let i = 0; i < 200; i++) {
    const inst = generateGear(g, { level: 5 });
    assert.equal(inst.affixes.length, RARITY[inst.rarity].affixes, `${inst.rarity} -> ${inst.affixes.length}`);
    assert.ok(instanceName(inst).length > 0);
    // durability starts full
    assert.equal(inst.durability, inst.maxDurability);
  }
});

test("affixes increase aggregated stats", () => {
  const g = new RNG(11);
  let foundBonus = false;
  for (let i = 0; i < 50 && !foundBonus; i++) {
    const inst = generateGear(g, { level: 6, slot: "weapon", rarity: "rare" });
    const mods = instanceMods(inst);
    const sum = (mods.attackBonus ?? 0) + (mods.damageBonus ?? 0) + (mods.focusBonus ?? 0) + (mods.hpBonus ?? 0);
    if (inst.affixes.length === 2 && sum > 0) foundBonus = true;
  }
  assert.ok(foundBonus, "rare weapons should carry stat bonuses");
});

test("broken gear gives roughly half stats", () => {
  const inst = generateGear(new RNG(3), { level: 8, slot: "armor", rarity: "epic" });
  const full = instanceMods(inst);
  inst.durability = 0;
  const broken = instanceMods(inst);
  assert.ok((broken.defenseBonus ?? 0) <= (full.defenseBonus ?? 0), "broken def <= full");
  assert.ok((broken.hpBonus ?? 0) <= (full.hpBonus ?? 0), "broken hp <= full");
});

test("set bonus activates at the piece threshold", () => {
  const weapon = baseInstance("wpn-vigil-glaive");
  const armor = baseInstance("arm-vigil-mail");
  const one = setBonuses([weapon]);
  assert.equal(one.active.length, 0, "1 piece -> no set bonus");
  const two = setBonuses([weapon, armor]);
  assert.ok(two.active.length >= 1, "2 pieces -> set bonus active");
  assert.ok((two.mods.hpBonus ?? 0) >= 12);
});

test("equipping better gear raises a hero's defense", () => {
  const game = new Game();
  game.newGame([{ classId: "vanguard", raceId: "stout", backgroundId: "soldier", name: "T", allocations: {} }]);
  const hero = game.party[0];
  const before = defenseOf(hero);
  const plate = baseInstance("arm-warded-plate"); // +5 def, better than starting chain (+3)
  game.addGear(plate);
  assert.ok(game.equipInstance(hero, plate.uid));
  assert.ok(defenseOf(hero) > before, `def ${defenseOf(hero)} should exceed ${before}`);
  // the old armor went back to the bag
  assert.ok(game.gear.some((g) => g.defId === "arm-chain"));
});

test("repair cost is zero at full durability and positive when worn", () => {
  const inst = generateGear(new RNG(9), { level: 4, slot: "weapon", rarity: "rare" });
  assert.equal(repairCost(inst), 0);
  inst.durability = 0;
  assert.ok(repairCost(inst) > 0);
  assert.ok(sellValue(inst) > 0);
});

test("victory loot wears equipped gear and grants rewards", () => {
  const game = new Game();
  game.newGame([
    { classId: "vanguard", raceId: "stout", backgroundId: "soldier", name: "A", allocations: {} },
    { classId: "warden", raceId: "aldermoorian", backgroundId: "acolyte", name: "B", allocations: {} },
  ]);
  const durBefore = equippedInstances(game.party[0])[0].durability;
  game.resolveVictory(["hollow-rat", "rot-crawler"]);
  assert.ok(game.pendingRewards);
  assert.ok(game.pendingRewards!.xp > 0);
  const durAfter = equippedInstances(game.party[0])[0].durability;
  assert.ok(durAfter < durBefore, "equipped gear should wear after a fight");
});
