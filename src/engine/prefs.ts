// Display & accessibility preferences. Persisted to localStorage and applied to
// the document as <body> classes that the stylesheet reacts to. Kept free of any
// direct DOM use here so the mapping/serialisation is unit-testable; main.ts owns
// the actual class application.

export interface DisplayPrefs {
  reduceMotion: boolean; // minimise animations & screen transitions
  largeText: boolean; // enlarge the main reading surfaces
  highContrast: boolean; // stronger colours for low light / low vision
  bigTouch: boolean; // taller, easier-to-tap controls
}

export type PrefKey = keyof DisplayPrefs;

export const DEFAULT_PREFS: DisplayPrefs = {
  reduceMotion: false,
  largeText: false,
  highContrast: false,
  bigTouch: false,
};

// Labels/help for the settings UI, in display order.
export const PREF_META: { key: PrefKey; label: string; help: string }[] = [
  { key: "largeText", label: "Larger text", help: "Bigger, easier-to-read story and menu text." },
  { key: "highContrast", label: "High contrast", help: "Stronger colours for low light or low vision." },
  { key: "bigTouch", label: "Large touch targets", help: "Taller buttons that are easier to tap." },
  { key: "reduceMotion", label: "Reduce motion", help: "Minimise animations and screen transitions." },
];

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
    if (raw) return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<DisplayPrefs>) };
  } catch { /* corrupt or unavailable storage — fall back to defaults */ }
  return { ...DEFAULT_PREFS };
}

export function savePrefs(p: DisplayPrefs): void {
  try {
    (globalThis as { localStorage?: Storage }).localStorage?.setItem(KEY, JSON.stringify(p));
  } catch { /* storage unavailable — prefs simply won't persist */ }
}
