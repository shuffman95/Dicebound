import { test } from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine/game.js";
import { NODES } from "../src/data/story.js";
import { LORE } from "../src/data/lore.js";

function freshGame() {
  const g = new Game();
  g.newGame([{ classId: "vanguard", raceId: "aldermoorian", backgroundId: "wanderer", name: "A", allocations: {} }]);
  return g;
}

// node -> the codex entry its examine beat unlocks
const BEATS: Record<string, string> = {
  road1: "the-old-kings-road",
  road2: "the-salt-caravans",
  chapel1: "the-drowned-faith",
  chapel2: "the-reliquary-saint",
  keep1: "the-iron-garrison",
  keep2: "the-grey-candles",
};

test("every main-area node offers an examine beat that unlocks a real codex entry", () => {
  for (const [nodeId, loreId] of Object.entries(BEATS)) {
    const beat = NODES[nodeId].choices.find((c) => c.effects?.unlockLore === loreId);
    assert.ok(beat, `${nodeId} should offer the ${loreId} examine`);
    assert.ok(LORE[loreId], `${loreId} is a real codex entry`);
    assert.equal(beat!.hideIfFlag, beat!.effects!.setFlag, `${nodeId} examine hides once read`);
  }
});

test("examining records the codex entry and the option then hides", () => {
  const g = freshGame();
  const beat = NODES["keep2"].choices.find((c) => c.effects?.unlockLore === "the-grey-candles")!;
  assert.ok(!g.lore.has("the-grey-candles"));
  g.applyEffects(beat.effects!);
  assert.ok(g.lore.has("the-grey-candles"));
  assert.ok(g.flags.has(beat.hideIfFlag!));
});

test("examine beats never block the path: each of these nodes still has its combat or onward route", () => {
  for (const nodeId of Object.keys(BEATS)) {
    const node = NODES[nodeId];
    const hasWayOn = node.choices.some((c) => c.combat || c.goto || c.check);
    assert.ok(hasWayOn, `${nodeId} keeps a way forward`);
  }
});
