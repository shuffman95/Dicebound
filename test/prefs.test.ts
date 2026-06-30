import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PREFS, PREF_META, ALL_PREF_CLASSES, prefsBodyClasses, loadPrefs, savePrefs } from "../src/engine/prefs.js";

test("the default preferences imply no body classes", () => {
  assert.deepEqual(prefsBodyClasses(DEFAULT_PREFS), []);
});

test("all four prefs map onto exactly the known body classes", () => {
  const all = prefsBodyClasses({ reduceMotion: true, largeText: true, highContrast: true, bigTouch: true });
  assert.deepEqual([...all].sort(), [...ALL_PREF_CLASSES].sort());
});

test("every settings row targets a real preference key", () => {
  assert.ok(PREF_META.length >= 4);
  for (const m of PREF_META) assert.ok(m.key in DEFAULT_PREFS, `${m.key} is a real pref`);
});

test("each preference maps to its own single class", () => {
  assert.deepEqual(prefsBodyClasses({ ...DEFAULT_PREFS, highContrast: true }), ["high-contrast"]);
  assert.deepEqual(prefsBodyClasses({ ...DEFAULT_PREFS, reduceMotion: true }), ["reduce-motion"]);
  assert.deepEqual(prefsBodyClasses({ ...DEFAULT_PREFS, largeText: true }), ["text-large"]);
  assert.deepEqual(prefsBodyClasses({ ...DEFAULT_PREFS, bigTouch: true }), ["big-touch"]);
});

test("preferences round-trip through storage", () => {
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
    const p = { ...DEFAULT_PREFS, largeText: true, bigTouch: true };
    savePrefs(p);
    assert.deepEqual(loadPrefs(), p);
  } finally {
    delete (globalThis as unknown as { localStorage?: Storage }).localStorage;
  }
});

test("loadPrefs falls back to defaults when storage is unavailable", () => {
  assert.deepEqual(loadPrefs(), DEFAULT_PREFS);
});
