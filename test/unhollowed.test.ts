import { test } from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine/game.js";
import { NODES } from "../src/data/story.js";
import { ENEMIES } from "../src/data/enemies.js";
import { LORE } from "../src/data/lore.js";
import { getAbility } from "../src/data/abilities.js";
import type { StoryChoice } from "../src/engine/types.js";

function freshGame() {
  const g = new Game();
  g.newGame([{ classId: "vanguard", raceId: "aldermoorian", backgroundId: "wanderer", name: "A", allocations: {} }]);
  return g;
}

function visible(g: Game, nodeId: string): StoryChoice[] {
  return NODES[nodeId].choices.filter((c) =>
    (!c.requiresFlag || g.flags.has(c.requiresFlag)) &&
    (!c.hideIfFlag || !g.flags.has(c.hideIfFlag)));
}

test("the missing-folk secrets stay hidden until The Unhollowed is taken", () => {
  const g = freshGame();
  for (const id of ["road2", "chapel2", "keep2"]) {
    assert.ok(!visible(g, id).some((c) => c.requiresFlag === "q_unhollowed"), `${id} secret hidden pre-quest`);
  }
  g.goto("town1_missing"); // starts the quest, sets the q_unhollowed flag + lore
  assert.equal(g.questState("the-unhollowed"), "active");
  assert.ok(g.flags.has("q_unhollowed"));
  assert.ok(g.lore.has("maren-of-greyhollow"));
  for (const id of ["road2", "chapel2", "keep2"]) {
    assert.ok(visible(g, id).some((c) => c.requiresFlag === "q_unhollowed"), `${id} secret revealed post-quest`);
  }
});

test("each main area's discovery records a fate and the road find is repeatable-safe", () => {
  const g = freshGame();
  g.goto("town1_missing");
  g.goto("road_lost"); // somber discovery: lore + loot + flag
  assert.ok(g.flags.has("found_road"));
  assert.ok(g.lore.has("the-reed-mother"));
  // once found, the road secret no longer shows
  assert.ok(!visible(g, "road2").some((c) => c.goto === "road_lost"));
});

test("the Ashen Keep discovery completes The Unhollowed with its reward", () => {
  const g = freshGame();
  g.gold = 0;
  g.goto("town1_missing");
  g.goto("keep_lost_end"); // onEnter: complete quest (70g + keepsake) + 30g node gold
  assert.equal(g.questState("the-unhollowed"), "completed");
  assert.ok(g.flags.has("found_keep"));
  assert.equal(g.gold, 100);
  assert.ok(g.gear.some((it) => it.defId === "trk-keepsake"), "Pilgrim's Keepsake granted");
  assert.ok(g.lore.has("the-candlewright"));
});

test("the Candlewright is a resolvable, non-boss optional encounter; all codex entries exist", () => {
  const e = ENEMIES["the-candlewright"];
  assert.ok(e && !e.isBoss, "the Candlewright is an optional (non-boss) enemy");
  for (const ab of e.abilities) assert.ok(getAbility(ab), `candlewright ability ${ab}`);
  for (const id of ["maren-of-greyhollow", "the-reed-mother", "the-last-pilgrim", "the-candlewright"]) assert.ok(LORE[id], `lore ${id}`);
});
