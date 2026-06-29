import { test } from "node:test";
import assert from "node:assert/strict";
import { createHero, learnTalent, canLearnTalent, talentPointsAvailable, talentPointsSpent, talentCritBonus, talentLifesteal } from "../src/engine/character.js";
import { CLASS_LIST } from "../src/data/classes.js";
import { TALENT_TREES } from "../src/data/talents.js";
import { getAbility } from "../src/data/abilities.js";

function vanguard(level: number) {
  return createHero({ classId: "vanguard", raceId: "aldermoorian", backgroundId: "soldier", name: "V", allocations: {} }, level);
}

test("talent points accrue one per level", () => {
  assert.equal(talentPointsAvailable(vanguard(1)), 0);
  assert.equal(talentPointsAvailable(vanguard(5)), 4);
  assert.equal(talentPointsAvailable(vanguard(8)), 7);
});

test("passive talents raise stats", () => {
  const v = vanguard(3);
  const hp0 = v.maxHP;
  assert.ok(learnTalent(v, "v-toughened")); // +12 HP
  assert.equal(v.maxHP, hp0 + 12);
  assert.equal(talentPointsSpent(v), 1);
});

test("tiers gate on points spent in the tree", () => {
  const v = vanguard(8);
  assert.ok(!canLearnTalent(v, "v-bastion"), "tier-1 locked before spending 2");
  assert.ok(learnTalent(v, "v-toughened"));
  assert.ok(learnTalent(v, "v-edge"));
  assert.ok(canLearnTalent(v, "v-bastion"), "tier-1 unlocked after 2 points");
});

test("ultimate is reachable and grants its ability", () => {
  const v = vanguard(8); // 7 points
  for (const id of ["v-toughened", "v-edge", "v-bastion", "v-secondwind", "v-juggernaut"]) assert.ok(learnTalent(v, id), `learn ${id}`);
  assert.equal(talentPointsSpent(v), 5);
  assert.ok(canLearnTalent(v, "v-earthshaker"), "ultimate unlocks at 5 spent");
  assert.ok(learnTalent(v, "v-earthshaker"));
  assert.ok(v.abilities.includes("earthshaker"), "ultimate ability granted");
});

test("combat talents report crit and lifesteal", () => {
  const s = createHero({ classId: "shade", raceId: "sylvan", backgroundId: "outlaw", name: "S", allocations: {} }, 6);
  assert.ok(learnTalent(s, "s-deadly"));
  assert.ok(learnTalent(s, "s-evasion"));
  assert.ok(learnTalent(s, "s-lethality")); // crit 18-20 => +2
  assert.ok(learnTalent(s, "s-vampiric")); // 15% lifesteal
  assert.equal(talentCritBonus(s), 2);
  assert.ok(Math.abs(talentLifesteal(s) - 0.15) < 1e-9);
});

test("cannot overspend talent points", () => {
  const v = vanguard(2); // 1 point
  assert.ok(learnTalent(v, "v-toughened"));
  assert.ok(!learnTalent(v, "v-edge"), "no points left");
});

test("every class tree is deepened and grants a non-ultimate ability talent", () => {
  for (const cls of CLASS_LIST) {
    const tree = TALENT_TREES[cls.id];
    assert.ok(tree.length >= 9, `${cls.id} tree should be deepened (>=9 nodes)`);
    // a non-ultimate talent grants a brand-new active ability
    const abilityTalents = tree.filter((n) => !n.ultimate && n.effect.grantsAbility);
    assert.ok(abilityTalents.length >= 1, `${cls.id} should have a non-ultimate ability talent`);
    for (const n of abilityTalents) assert.ok(getAbility(n.effect.grantsAbility!), `${cls.id} ${n.id} grants a real ability`);
  }
});

test("learning an ability talent adds that active to the hero's kit", () => {
  // Necromancer's Soul Rend (tier-2, needs 4 spent): reachable by level 6 (5 points)
  const n = createHero({ classId: "necromancer", raceId: "aldermoorian", backgroundId: "wanderer", name: "N", allocations: {} }, 6);
  assert.ok(!n.abilities.includes("soul-rend"), "not known before specing");
  for (const id of ["n-power", "n-focus", "n-leech", "n-darkmind", "n-soulrend"]) assert.ok(learnTalent(n, id), `learn ${id}`);
  assert.ok(n.abilities.includes("soul-rend"), "Soul Rend granted by the talent");
});
