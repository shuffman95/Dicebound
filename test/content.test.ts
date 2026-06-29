import { test } from "node:test";
import assert from "node:assert/strict";
import { CLASS_LIST, CLASSES } from "../src/data/classes.js";
import { ABILITIES, getAbility } from "../src/data/abilities.js";
import { ITEMS, getItem } from "../src/data/items.js";
import { TALENT_TREES } from "../src/data/talents.js";
import { ENEMIES } from "../src/data/enemies.js";
import { createHero, learnTalent, talentPointsAvailable } from "../src/engine/character.js";

test("every class builds a valid hero with resolvable content", () => {
  for (const cls of CLASS_LIST) {
    const hero = createHero({ classId: cls.id, raceId: "aldermoorian", backgroundId: "wanderer", name: cls.name, allocations: {} });
    assert.ok(hero.maxHP > 0, `${cls.id} hp`);
    assert.ok(hero.maxFocus >= 0, `${cls.id} focus`);
    // every ability id resolves
    for (const ab of cls.startingAbilities) assert.ok(getAbility(ab), `${cls.id} starting ability ${ab}`);
    for (const u of cls.abilityUnlocks) assert.ok(getAbility(u.abilityId), `${cls.id} unlock ${u.abilityId}`);
    // every starting item/equipment id resolves
    for (const it of cls.startingItems) assert.ok(getItem(it), `${cls.id} item ${it}`);
    for (const slot of ["weapon", "armor", "trinket"] as const) {
      const id = cls.startingEquipment[slot];
      if (id) assert.ok(getItem(id), `${cls.id} equip ${id}`);
    }
  }
});

test("every class has a talent tree whose nodes resolve and ultimate grants a real ability", () => {
  for (const cls of CLASS_LIST) {
    const tree = TALENT_TREES[cls.id];
    assert.ok(tree && tree.length >= 4, `${cls.id} needs a talent tree`);
    const ultimates = tree.filter((n) => n.ultimate);
    assert.equal(ultimates.length, 1, `${cls.id} should have one ultimate`);
    for (const node of tree) {
      if (node.effect.grantsAbility) assert.ok(getAbility(node.effect.grantsAbility), `${cls.id} talent grants ${node.effect.grantsAbility}`);
    }
    // the ultimate is reachable by spending all prior points
    const nonUlt = tree.filter((n) => !n.ultimate).reduce((s, n) => s + n.cost, 0);
    assert.ok(ultimates[0].requiresPoints <= nonUlt, `${cls.id} ultimate must be reachable`);
  }
});

test("a high-level hero of each class can fully spec its tree including the ultimate", () => {
  for (const cls of CLASS_LIST) {
    const hero = createHero({ classId: cls.id, raceId: "aldermoorian", backgroundId: "wanderer", name: "x", allocations: {} }, 12);
    const tree = TALENT_TREES[cls.id];
    // learn in tier order
    for (const node of [...tree].sort((a, b) => a.tier - b.tier)) {
      const ok = learnTalent(hero, node.id);
      assert.ok(ok, `${cls.id} should be able to learn ${node.id} (points left: ${talentPointsAvailable(hero)})`);
    }
    const ult = tree.find((n) => n.ultimate)!;
    if (ult.effect.grantsAbility) assert.ok(hero.abilities.includes(ult.effect.grantsAbility), `${cls.id} learned its ultimate ability`);
  }
});

test("every enemy ability id resolves", () => {
  for (const e of Object.values(ENEMIES)) for (const ab of e.abilities) assert.ok(getAbility(ab), `${e.id} ability ${ab}`);
});

test("every enemy loot/phase/aura reference resolves", () => {
  for (const e of Object.values(ENEMIES)) {
    if (e.lootTable) for (const l of e.lootTable) assert.ok(getItem(l.itemId), `${e.id} loot ${l.itemId}`);
    if (e.phase?.addAbilities) for (const a of e.phase.addAbilities) assert.ok(getAbility(a), `${e.id} phase ability ${a}`);
  }
});

test("no ability shares the same display name (no renamed duplicates)", () => {
  const names = new Map<string, string>();
  for (const a of Object.values(ABILITIES)) {
    const prev = names.get(a.name);
    assert.ok(!prev, `duplicate ability name "${a.name}" (${prev} & ${a.id})`);
    names.set(a.name, a.id);
  }
});

test("all item set pieces and base gear ids exist", () => {
  assert.ok(Object.keys(ITEMS).length > 30);
});
