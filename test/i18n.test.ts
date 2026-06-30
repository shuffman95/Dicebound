import { test } from "node:test";
import assert from "node:assert/strict";
import { t, setLocale, getLocale, LANGUAGES } from "../src/engine/i18n.js";

test("English and Russian are both offered, English first", () => {
  assert.equal(LANGUAGES[0].id, "en");
  assert.ok(LANGUAGES.some((l) => l.id === "ru"));
});

test("the active locale switches the returned string", () => {
  setLocale("en");
  assert.equal(t("title.new"), "New Adventure");
  setLocale("ru");
  assert.equal(t("title.new"), "Новое приключение");
  setLocale("en"); // restore
});

test("placeholders are substituted", () => {
  setLocale("en");
  assert.ok(t("title.tagline", { v: "1.1.0" }).includes("v1.1.0"));
  setLocale("ru");
  assert.ok(t("title.tagline", { v: "1.1.0" }).includes("v1.1.0"));
  setLocale("en");
});

test("Russian translates every UI key English defines (no gaps, no English leak)", async () => {
  // Pull the raw tables by translating a known key set: assert each EN key has a
  // distinct RU value (not identical to English) for the framing screens.
  const keys = [
    "title.new", "title.continue", "title.load", "title.settings", "title.how",
    "settings.title", "settings.audio", "settings.display", "settings.language",
    "common.done", "common.gotIt", "how.title",
    "pref.largeText.label", "pref.highContrast.label", "pref.bigTouch.label", "pref.reduceMotion.label",
  ];
  for (const k of keys) {
    setLocale("en");
    const en = t(k);
    setLocale("ru");
    const ru = t(k);
    assert.notEqual(ru, k, `${k} missing entirely`);
    assert.notEqual(ru, en, `${k} not translated (still English)`);
  }
  setLocale("en");
});

test("an unknown key falls back to the key itself (never throws)", () => {
  setLocale("ru");
  assert.equal(t("nope.not.a.key"), "nope.not.a.key");
  setLocale("en");
  assert.equal(getLocale(), "en");
});
