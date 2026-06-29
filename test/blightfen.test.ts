import { test } from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine/game.js";
import { NODES } from "../src/data/story.js";
import { ENEMIES } from "../src/data/enemies.js";
import { getItem } from "../src/data/items.js";

function freshGame() {
  const g = new Game();
  g.newGame([{ classId: "vanguard", raceId: "aldermoorian", backgroundId: "wanderer", name: "A", allocations: {} }]);
  return g;
}

test("both optional regions are reachable from the Greyhollow hub", () => {
  const targets = NODES["town2"].choices.map((c) => c.goto);
  assert.ok(targets.includes("rime_enter"), "Rimewood entrance present");
  assert.ok(targets.includes("fen_enter"), "Blightfen entrance present");
});

test("the Blightfen forms a complete, connected path back to the hub", () => {
  const fenNodes = Object.values(NODES).filter((n) => n.id.startsWith("fen_"));
  assert.ok(fenNodes.length >= 8, "the Blightfen has a full node set");
  for (const node of fenNodes) {
    for (const c of node.choices) {
      for (const t of [c.goto, c.combat?.victoryNode, c.check?.successNode, c.check?.failNode]) {
        if (t) assert.ok(NODES[t], `${node.id}: dangling target ${t}`);
      }
    }
  }
  assert.equal(NODES["fen_boss"].choices[0].combat?.victoryNode, "fen_clear");
  assert.equal(NODES["fen_clear"].choices[0].goto, "town2");
});

test("walking the Blightfen starts and completes Blighted Roots with its rewards", () => {
  const g = freshGame();
  g.gold = 0;
  g.goto("fen_enter"); // onEnter: start quest + unlock region lore
  assert.equal(g.questState("blighted-roots"), "active");
  assert.ok(g.lore.has("the-blightfen"));
  g.goto("fen_clear"); // onEnter: xp + complete quest (reward: 75g, xp, trinket)
  assert.equal(g.questState("blighted-roots"), "completed");
  assert.equal(g.gold, 75);
  assert.ok(g.gear.some((it) => it.defId === "trk-witch-phylactery"), "quest trinket granted");
});

test("the Rotcrowned is a fire-weak boss that drops its scepter and phases into Miasma", () => {
  const boss = ENEMIES["the-rotcrowned"];
  assert.ok(boss.isBoss, "the Rotcrowned is a boss");
  assert.ok(boss.lootTable?.some((l) => l.itemId === "wpn-mirecrown-scepter"), "drops the Mirecrown Scepter");
  assert.equal(getItem("wpn-mirecrown-scepter").slot, "weapon");
  assert.ok(boss.phase?.addAbilities?.includes("miasma"), "gains Miasma when it phases");
  // weak to fire so Ignite/burn strategies shine (mirrors the Rimewood's design)
  assert.ok((boss.resist?.fire ?? 1) > 1, "the Rotcrowned is weak to fire");
});
