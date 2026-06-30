import { test } from "node:test";
import assert from "node:assert/strict";
import { setLocale } from "../src/engine/i18n.js";
import { NODES } from "../src/data/story.js";
import { localizeStoryNode } from "../src/data/locale.js";

test("English story nodes pass through unchanged", () => {
  setLocale("en");
  const n = localizeStoryNode(NODES["intro"]);
  assert.equal(n.title, "The Hollowing");
  assert.equal(n.choices[0].text, "Begin the journey");
});

test("translated nodes localize title, text and choices in Russian", () => {
  setLocale("ru");
  const n = localizeStoryNode(NODES["intro"]);
  assert.equal(n.title, "Опустошение");
  assert.ok(n.text.includes("Опустошение"));
  assert.equal(n.choices[0].text, "Начать путь");
  setLocale("en");
});

test("localization preserves choice navigation fields (goto/combat/flags)", () => {
  setLocale("ru");
  const src = NODES["town2"];
  const n = localizeStoryNode(src);
  // same number of choices, same targets/flags, only text changed
  assert.equal(n.choices.length, src.choices.length);
  for (let i = 0; i < src.choices.length; i++) {
    assert.equal(n.choices[i].goto, src.choices[i].goto);
    assert.equal(n.choices[i].requiresFlag, src.choices[i].requiresFlag);
    assert.equal(n.choices[i].combat?.victoryNode, src.choices[i].combat?.victoryNode);
  }
  setLocale("en");
});

test("every translated story node is fully Russian — title, text and all choices", () => {
  setLocale("ru");
  const cyr = /[А-Яа-яЁё]/;
  for (const id of Object.keys(NODES)) {
    const en = NODES[id];
    const ru = localizeStoryNode(en);
    if (ru.title === en.title && ru.text === en.text) continue; // not translated yet
    assert.ok(cyr.test(ru.title), `${id} title not translated`);
    assert.ok(cyr.test(ru.text), `${id} text not translated`);
    for (let i = 0; i < en.choices.length; i++) {
      assert.ok(cyr.test(ru.choices[i].text), `${id} choice ${i} left in English (mismatched choices array?)`);
    }
  }
  setLocale("en");
});

test("the entire story script is translated — no node falls back to English", () => {
  setLocale("ru");
  const missing: string[] = [];
  for (const id of Object.keys(NODES)) {
    const en = NODES[id];
    const ru = localizeStoryNode(en);
    if (ru.title === en.title && ru.text === en.text) missing.push(id);
  }
  setLocale("en");
  assert.deepEqual(missing, [], `untranslated story nodes: ${missing.join(", ")}`);
});

test("graceful fallback still works for an unknown node id", () => {
  setLocale("ru");
  // a node with no translation entry returns its own (English) strings, unbroken
  const fake = { id: "__not_a_real_node__", title: "Untranslated", text: "Body", art: "❓",
    choices: [{ text: "Onward", goto: "intro" }] };
  const n = localizeStoryNode(fake);
  assert.equal(n.title, "Untranslated");
  assert.equal(n.text, "Body");
  assert.equal(n.choices[0].text, "Onward");
  assert.equal(n.choices[0].goto, "intro");
  setLocale("en");
});
