// Display & accessibility preferences. Persisted to localStorage and applied to
// the document as <body> classes that the stylesheet reacts to. Kept free of any
// direct DOM use here so the mapping/serialisation is unit-testable; main.ts owns
// the actual class application.

import type { Locale } from "./i18n.js";

export interface DisplayPrefs {
  reduceMotion: boolean; // minimise animations & screen transitions
  largeText: boolean; // enlarge the main reading surfaces
  highContrast: boolean; // stronger colours for low light / low vision
  bigTouch: boolean; // taller, easier-to-tap controls
  locale: Locale; // UI/content language ("en" default)
}

// The boolean accessibility toggles (locale is handled separately).
export type PrefKey = "reduceMotion" | "largeText" | "highContrast" | "bigTouch";

export const DEFAULT_PREFS: DisplayPrefs = {
  reduceMotion: false,
  largeText: false,
  highContrast: false,
  bigTouch: false,
  locale: "en",
};

// Accessibility toggles in display order. Their labels/help live in i18n
// (keys "pref.<key>.label" / "pref.<key>.help") so they localize.
export const PREF_KEYS: PrefKey[] = ["largeText", "highContrast", "bigTouch", "reduceMotion"];

// Every body class this system may toggle (so the applier can clear them cleanly).
export const ALL_PREF_CLASSES = ["reduce-motion", "text-large", "high-contrast", "big-touch"];

// The <body> classes a given set of prefs implies.
export function prefsBodyClasses(p: DisplayPrefs): string[] {
  const out: string[] = [];
  if (p.reduceMotion) out.push("reduce-motion");
  if (p.largeText) out.push("text-large");
  if (p.highContrast) out.push("high-contrast");
  if (p.bigTouch) out.push("big-touch");
  return out;
}

const KEY = "dicebound:prefs:v1";

export function loadPrefs(): DisplayPrefs {
  try {
    const raw = (globalThis as { localStorage?: Storage }).localStorage?.getItem(KEY);
    if (raw) {
      const merged = { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<DisplayPrefs>) };
      // Guard against an unknown/corrupt stored locale — English is the default.
      if (merged.locale !== "en" && merged.locale !== "ru") merged.locale = "en";
      return merged;
    }
  } catch { /* corrupt or unavailable storage — fall back to defaults */ }
  return { ...DEFAULT_PREFS };
}

export function savePrefs(p: DisplayPrefs): void {
  try {
    (globalThis as { localStorage?: Storage }).localStorage?.setItem(KEY, JSON.stringify(p));
  } catch { /* storage unavailable — prefs simply won't persist */ }
}
