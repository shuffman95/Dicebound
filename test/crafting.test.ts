import { test } from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine/game.js";
import { RECIPE_LIST, RECIPES } from "../src/data/recipes.js";
import { getItem } from "../src/data/items.js";
import { NODES } from "../src/data/story.js";

function freshGame() {
  const g = new Game();
  g.newGame([{ classId: "vanguard", raceId: "aldermoorian", backgroundId: "wanderer", name: "A", allocations: {} }]);
  return g;
}

test("recipes reference only real items", () => {
  for (const r of RECIPE_LIST) {
    assert.ok(getItem(r.output.defId), `${r.id} output ${r.output.defId}`);
    for (const inp of r.inputs) assert.ok(getItem(inp.defId), `${r.id} input ${inp.defId}`);
  }
});

test("cannot craft without materials; can after acquiring them", () => {
  const g = freshGame();
  const r = RECIPES["alc-antidote"]; // needs 1 moonherb
  assert.ok(!g.canCraft(r), "no materials yet");
  assert.ok(!g.craft(r), "craft fails without materials");
  g.addItem("mat-moonherb", 1);
  assert.ok(g.canCraft(r));
  const before = g.stackCount("antidote");
  assert.ok(g.craft(r));
  assert.equal(g.stackCount("antidote"), before + 1, "antidote produced");
  assert.equal(g.stackCount("mat-moonherb"), 0, "material consumed");
});

test("smithing produces a gear instance in the bag", () => {
  const g = freshGame();
  const r = RECIPES["smith-bloodstone"]; // 2 iron-scrap + 1 bone-charm
  g.addItem("mat-iron-scrap", 2);
  g.addItem("mat-bone-charm", 1);
  const gearBefore = g.gear.length;
  assert.ok(g.craft(r));
  assert.equal(g.gear.length, gearBefore + 1, "gear instance created");
  assert.equal(g.gear[g.gear.length - 1].defId, "trk-bloodstone");
});

test("crafting with a gold cost deducts gold", () => {
  const g = freshGame();
  g.gold = 100;
  g.addItem("mat-moonherb", 2);
  g.addItem("mat-bone-charm", 1);
  assert.ok(g.craft(RECIPES["alc-phoenix"])); // costs 20 gold
  assert.equal(g.gold, 80);
  assert.equal(g.stackCount("phoenix-tear"), 1);
});

test("every story choice target node exists", () => {
  for (const node of Object.values(NODES)) {
    for (const c of node.choices) {
      for (const target of [c.goto, c.effectsNext, c.combat?.victoryNode, c.combat?.defeatNode, c.check?.successNode, c.check?.failNode]) {
        if (target) assert.ok(NODES[target], `node ${node.id}: missing target ${target}`);
      }
      // gather/effect items resolve
      if (c.effects?.giveItems) for (const it of c.effects.giveItems) assert.ok(getItem(it), `node ${node.id}: bad item ${it}`);
    }
  }
});
