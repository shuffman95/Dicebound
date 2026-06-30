import { test } from "node:test";
import assert from "node:assert/strict";
import { NODES } from "../src/data/story.js";

test("the Hollow King's fall now routes through the reactive epilogue", () => {
  const fight = NODES["keep3"].choices.find((c) => c.combat?.enemies.includes("the-hollow-king"));
  assert.ok(fight, "the Hollow King fight exists");
  assert.equal(fight!.combat!.victoryNode, "epilogue");
  assert.ok(NODES["epilogue"], "epilogue node exists");
});

test("the optional clears set the flags the epilogue reacts to", () => {
  assert.equal(NODES["rime_clear"].onEnter?.setFlag, "rimewood_cleared");
  assert.equal(NODES["fen_clear"].onEnter?.setFlag, "blightfen_cleared");
  // the Unhollowed reuses the keep discovery flag
  assert.equal(NODES["keep_lost_end"].onEnter?.setFlag, "found_keep");
});

test("every epilogue reflection is flag-gated, exists, and loops back to the epilogue", () => {
  const reflections = NODES["epilogue"].choices.filter((c) => c.requiresFlag);
  assert.equal(reflections.length, 3, "three optional reflections");
  for (const c of reflections) {
    assert.ok(NODES[c.goto!], `reflection target ${c.goto} exists`);
    assert.ok(NODES[c.goto!].choices.every((b) => b.goto === "epilogue"), `${c.goto} returns to the epilogue`);
  }
});

test("the epilogue always offers a way to the true ending, regardless of flags", () => {
  const end = NODES["epilogue"].choices.find((c) => c.goto === "ending_victory");
  assert.ok(end, "an always-available choice ends the game");
  assert.ok(!end!.requiresFlag, "the ending is never gated behind optional content");
  assert.equal(NODES["ending_victory"].isEnding, "victory");
});
