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

test("each town stage opens its own Greyhollow commons, and each commons returns to its town", () => {
  const links: Record<string, string> = { town1: "commons1", town2: "commons2", town3: "commons3" };
  for (const [town, commons] of Object.entries(links)) {
    assert.ok(NODES[town].choices.some((c) => c.goto === commons), `${town} should reach ${commons}`);
    const back = NODES[commons].choices.find((c) => c.goto === town);
    assert.ok(back, `${commons} should return to ${town}`);
  }
});

test("the recurring cast appears at every stage and every dialogue node returns to its commons", () => {
  const cast = ["maren", "pip", "garrow"];
  const stages: Record<string, string> = { a: "commons1", b: "commons2", c: "commons3" };
  for (const [suffix, commons] of Object.entries(stages)) {
    for (const who of cast) {
      const node = NODES[`${who}_${suffix}`];
      assert.ok(node, `${who}_${suffix} exists`);
      assert.ok(node.choices.every((c) => c.goto === commons), `${who}_${suffix} returns to ${commons}`);
    }
  }
});

test("reading a salvaged book adds its codex entry and the option then hides", () => {
  const g = freshGame();
  // commons1 stocks the Primer; reading it is an effects choice (no node change)
  const read = NODES["commons1"].choices.find((c) => c.effects?.unlockLore === "primer-of-aldermoor");
  assert.ok(read, "commons1 offers the Primer");
  assert.ok(LORE["primer-of-aldermoor"], "the Primer is a real codex entry");
  assert.ok(read!.hideIfFlag && read!.effects!.setFlag === read!.hideIfFlag, "reading hides the option afterward");
  g.applyEffects(read!.effects!);
  assert.ok(g.lore.has("primer-of-aldermoor"));
  assert.ok(g.flags.has(read!.hideIfFlag!));
});

test("Garrow's charm is a one-time gift gated by a flag", () => {
  const g = freshGame();
  const pick = NODES["commons2"].choices.find((c) => c.effects?.giveItems?.includes("trk-warding-eye"));
  assert.ok(pick, "commons2 offers Garrow's charm");
  assert.equal(pick!.hideIfFlag, pick!.effects!.setFlag, "the gift hides once taken");
  const before = g.gear.length;
  g.applyEffects(pick!.effects!);
  assert.equal(g.gear.length, before + 1, "the charm is granted once");
  assert.ok(g.flags.has(pick!.hideIfFlag!));
});

test("all four salvaged books resolve to codex entries", () => {
  for (const id of ["primer-of-aldermoor", "greyhollow-ledger", "the-last-almanac", "warden-field-notes"]) {
    assert.ok(LORE[id], `lore ${id}`);
  }
});
