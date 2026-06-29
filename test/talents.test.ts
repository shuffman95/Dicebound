import { test } from "node:test";
import assert from "node:assert/strict";
import { createHero, learnTalent, canLearnTalent, talentPointsAvailable, talentPointsSpent, talentCritBonus, talentLifesteal } from "../src/engine/character.js";

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
