import { test } from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine/game.js";
import { QUESTS } from "../src/data/quests.js";
import { LORE } from "../src/data/lore.js";
import { NODES } from "../src/data/story.js";

function freshGame() {
  const g = new Game();
  g.newGame([{ classId: "vanguard", raceId: "aldermoorian", backgroundId: "wanderer", name: "A", allocations: {} }]);
  return g;
}

test("starting and completing a quest grants its reward once", () => {
  const g = freshGame();
  g.gold = 0;
  g.startQuest("warden-of-thorns");
  assert.equal(g.questState("warden-of-thorns"), "active");
  g.completeQuest("warden-of-thorns"); // reward: 30 gold, 25 xp, war-tonic
  assert.equal(g.questState("warden-of-thorns"), "completed");
  assert.equal(g.gold, 30);
  assert.equal(g.stackCount("war-tonic"), 1);
  // completing again does nothing
  g.completeQuest("warden-of-thorns");
  assert.equal(g.gold, 30);
});

test("entering nodes drives quests and lore via onEnter effects", () => {
  const g = freshGame();
  g.goto("town1"); // main quest + lore
  assert.equal(g.questState("hollow-crown"), "active");
  assert.ok(g.lore.has("the-hollowing"));
  g.goto("road_boss"); // side quest start
  assert.equal(g.questState("warden-of-thorns"), "active");
  g.goto("road_clear"); // side quest complete + lore
  assert.equal(g.questState("warden-of-thorns"), "completed");
  assert.ok(g.lore.has("wardens-oath"));
  // notifications were queued for the UI
  assert.ok(g.notifications.length > 0);
});

test("quests and lore survive a save/load roundtrip", () => {
  const g = freshGame();
  g.goto("town1");
  g.startQuest("drowned-faithful");
  const json = g.serialize();
  const g2 = new Game();
  assert.ok(g2.importString(json));
  assert.equal(g2.questState("hollow-crown"), "active");
  assert.equal(g2.questState("drowned-faithful"), "active");
  assert.ok(g2.lore.has("the-hollowing"));
});

test("every quest/lore id referenced by the story exists", () => {
  for (const node of Object.values(NODES)) {
    const effs = [node.onEnter, ...node.choices.map((c) => c.effects)];
    for (const e of effs) {
      if (!e) continue;
      if (e.startQuest) assert.ok(QUESTS[e.startQuest], `${node.id}: bad startQuest ${e.startQuest}`);
      if (e.completeQuest) assert.ok(QUESTS[e.completeQuest], `${node.id}: bad completeQuest ${e.completeQuest}`);
      if (e.unlockLore) assert.ok(LORE[e.unlockLore], `${node.id}: bad lore ${e.unlockLore}`);
    }
  }
});

test("every quest can be reached (started) somewhere in the story", () => {
  const started = new Set<string>();
  for (const node of Object.values(NODES)) {
    for (const e of [node.onEnter, ...node.choices.map((c) => c.effects)]) {
      if (e?.startQuest) started.add(e.startQuest);
      if (e?.completeQuest) started.add(e.completeQuest); // some quests auto-start on completion
    }
  }
  for (const id of Object.keys(QUESTS)) assert.ok(started.has(id), `quest ${id} is never started in the story`);
});
