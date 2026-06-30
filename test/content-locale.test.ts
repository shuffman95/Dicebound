import { test } from "node:test";
import assert from "node:assert/strict";
import { setLocale } from "../src/engine/i18n.js";
import { getClass } from "../src/data/classes.js";
import { getRace } from "../src/data/races.js";
import { getBackground } from "../src/data/backgrounds.js";
import { getTrait } from "../src/data/traits.js";
import { localizeDef } from "../src/data/locale.js";

test("English is unchanged (localization is identity for the default locale)", () => {
  setLocale("en");
  assert.equal(getClass("vanguard").name, "Vanguard");
  assert.equal(getRace("sylvan").name, "Sylvan Elf");
  assert.equal(getBackground("outlaw").name, "Outlaw");
  assert.equal(getTrait("stoneblood")!.name, "Stoneblood");
});

test("Russian localizes creation content (names and descriptions)", () => {
  setLocale("ru");
  assert.equal(getClass("vanguard").name, "Авангард");
  assert.ok(getClass("vanguard").blurb.includes("стена"));
  assert.equal(getRace("revenant").name, "Возвращенец");
  assert.equal(getBackground("scholar").name, "Учёный");
  const t = getTrait("bloodrage")!;
  assert.equal(t.name, "Кровавая ярость");
  assert.notEqual(t.description, "Fury when cornered: +3 damage while at or below half HP.");
  setLocale("en"); // restore for other suites
});

test("every creation def has a Russian translation (no English leaks in creation)", () => {
  setLocale("ru");
  const classes = ["vanguard", "arcanist", "shade", "warden", "berserker", "ranger", "necromancer", "cleric"];
  const races = ["aldermoorian", "sylvan", "stout", "orcborn", "feykin", "revenant"];
  const bgs = ["soldier", "scholar", "outlaw", "acolyte", "noble", "wanderer"];
  const cyrillic = /[А-Яа-яЁё]/;
  for (const id of classes) { const c = getClass(id); assert.ok(cyrillic.test(c.name) && cyrillic.test(c.blurb), `class ${id}`); }
  for (const id of races) { const r = getRace(id); assert.ok(cyrillic.test(r.name) && cyrillic.test(r.blurb), `race ${id}`); }
  for (const id of bgs) { const b = getBackground(id); assert.ok(cyrillic.test(b.name) && cyrillic.test(b.blurb), `bg ${id}`); }
  setLocale("en");
});

test("localizeDef falls back to the def for unknown ids", () => {
  setLocale("ru");
  const fake = { id: "does-not-exist", name: "Keep Me" };
  assert.equal(localizeDef("class", fake).name, "Keep Me");
  setLocale("en");
});
