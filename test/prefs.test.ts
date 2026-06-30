import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PREFS, PREF_KEYS, ALL_PREF_CLASSES, prefsBodyClasses, loadPrefs, savePrefs } from "../src/engine/prefs.js";

test("the default preferences imply no body classes and English locale", () => {
  assert.deepEqual(prefsBodyClasses(DEFAULT_PREFS), []);
  assert.equal(DEFAULT_PREFS.locale, "en");
});

test("all four prefs map onto exactly the known body classes", () => {
  const all = prefsBodyClasses({ ...DEFAULT_PREFS, reduceMotion: true, largeText: true, highContrast: true, bigTouch: true });
  assert.deepEqual([...all].sort(), [...ALL_PREF_CLASSES].sort());
});

test("every settings row targets a real preference key", () => {
  assert.ok(PREF_KEYS.length >= 4);
  for (const key of PREF_KEYS) assert.ok(key in DEFAULT_PREFS, `${key} is a real pref`);
});

test("each preference maps to its own single class", () => {
  assert.deepEqual(prefsBodyClasses({ ...DEFAULT_PREFS, highContrast: true }), ["high-contrast"]);
  assert.deepEqual(prefsBodyClasses({ ...DEFAULT_PREFS, reduceMotion: true }), ["reduce-motion"]);
  assert.deepEqual(prefsBodyClasses({ ...DEFAULT_PREFS, largeText: true }), ["text-large"]);
  assert.deepEqual(prefsBodyClasses({ ...DEFAULT_PREFS, bigTouch: true }), ["big-touch"]);
});

test("preferences (including locale) round-trip through storage", () => {
  const store = new Map<string, string>();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  };
  try {
    const p = { ...DEFAULT_PREFS, largeText: true, bigTouch: true, locale: "ru" as const };
    savePrefs(p);
    assert.deepEqual(loadPrefs(), p);
  } finally {
    delete (globalThis as unknown as { localStorage?: Storage }).localStorage;
  }
});

test("loadPrefs falls back to defaults when storage is unavailable", () => {
  assert.deepEqual(loadPrefs(), DEFAULT_PREFS);
});

test("a corrupt/unknown stored locale is coerced back to English", () => {
  const store = new Map<string, string>([["dicebound:prefs:v1", JSON.stringify({ locale: "xx" })]]);
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: () => {}, removeItem: () => {}, clear: () => {}, key: () => null, length: 0,
  };
  try {
    assert.equal(loadPrefs().locale, "en");
  } finally {
    delete (globalThis as unknown as { localStorage?: Storage }).localStorage;
  }
});
