// Localization. English is the source/default; other locales fall back to the
// English string for any key not yet translated, so the game is never broken
// while translation is in progress. UI strings live here; content (story, lore,
// items, abilities…) is localized separately as that work lands.

export type Locale = "en" | "ru";

export const LANGUAGES: { id: Locale; label: string }[] = [
  { id: "en", label: "English" },
  { id: "ru", label: "Русский" },
];

let locale: Locale = "en";
export function getLocale(): Locale { return locale; }
export function setLocale(l: Locale): void { locale = l; }

type Dict = Record<string, string>;

const EN: Dict = {
  // title / menu
  "title.continue": "Continue",
  "title.new": "New Adventure",
  "title.load": "Load Game",
  "title.settings": "Settings",
  "title.how": "How to Play",
  "title.tagline": "v{v} · an original turn-based dice RPG — roll d20 + a stat vs a target number.<br>No copyrighted content — all setting, classes & story are original.",

  // common
  "common.done": "Done",
  "common.gotIt": "Got it",
  "common.back": "Back",
  "common.close": "Close",

  // settings
  "settings.title": "Settings",
  "settings.audio": "Audio",
  "settings.muteAll": "Mute all",
  "settings.muted": "Muted",
  "settings.on": "On",
  "settings.off": "Off",
  "settings.test": "Test ♪",
  "settings.master": "Master",
  "settings.music": "Music",
  "settings.effects": "Effects",
  "settings.audioNote": "All music and sound effects are generated in real time — no audio files. If you hear nothing on iPhone, tap once anywhere first (Safari requires a tap before audio can start).",
  "settings.display": "Display & Accessibility",
  "settings.language": "Language",

  // accessibility prefs
  "pref.largeText.label": "Larger text",
  "pref.largeText.help": "Bigger, easier-to-read story and menu text.",
  "pref.highContrast.label": "High contrast",
  "pref.highContrast.help": "Stronger colours for low light or low vision.",
  "pref.bigTouch.label": "Large touch targets",
  "pref.bigTouch.help": "Taller buttons that are easier to tap.",
  "pref.reduceMotion.label": "Reduce motion",
  "pref.reduceMotion.help": "Minimise animations and screen transitions.",

  // attributes
  "attr.might": "Might",
  "attr.agility": "Agility",
  "attr.wits": "Wits",
  "attr.spirit": "Spirit",
  "stat.hp": "HP",
  "stat.focus": "Focus",
  "stat.def": "Def",

  // character creation
  "create.title": "Forge Your Heroes",
  "create.subtitle": "Four sworn to the Wardens' Oath. Tap a slot to edit each one.",
  "create.namePlaceholder": "Name",
  "create.allocate": "Allocate Points",
  "create.left": "{n} left",
  "create.randomize": "🎲 Randomize Hero",
  "create.begin": "Begin the Adventure",
  "create.none": "None",
  "create.noTrait": "No extra trait.",
  "pick.class": "Class",
  "pick.race": "Race",
  "pick.bg": "Background",
  "pick.trait": "Starting Trait",

  // how to play
  "how.title": "How to Play",
  "how.body": `<b>The core roll.</b> Almost everything is a d20 plus an attribute modifier versus a target number. Beat it and you succeed; a natural 20 always hits (and crits for double dice), a natural 1 always misses.

<b>Attributes.</b>
• <b>Might</b> — melee attack & damage, brawn checks.
• <b>Agility</b> — defense, finesse strikes, stealth & lockpicking.
• <b>Wits</b> — arcane attack & damage, lore & perception.
• <b>Spirit</b> — healing power, Focus pool, resolve.

<b>Combat.</b> Initiative is rolled at the start. On a hero's turn, spend <b>Focus</b> on abilities or use a basic attack for free. Drop every enemy to win; if the whole party falls, it's over (Revive, Phoenix Tears, or the Warden can save a fallen ally).

<b>Story.</b> Choices marked with a stat and DC are dice checks — your best-suited hero rolls. Win fights for XP, gold and loot; spend gold at the apothecary and rest to heal.

<b>Saving.</b> The game autosaves as you travel; use Continue from the title.`,
};

const RU: Dict = {
  // title / menu
  "title.continue": "Продолжить",
  "title.new": "Новое приключение",
  "title.load": "Загрузить игру",
  "title.settings": "Настройки",
  "title.how": "Как играть",
  "title.tagline": "v{v} · оригинальная пошаговая игра на кубиках — бросайте d20 + характеристику против целевого числа.<br>Никакого защищённого авторским правом контента — мир, классы и сюжет полностью оригинальны.",

  // common
  "common.done": "Готово",
  "common.gotIt": "Понятно",
  "common.back": "Назад",
  "common.close": "Закрыть",

  // settings
  "settings.title": "Настройки",
  "settings.audio": "Звук",
  "settings.muteAll": "Выключить весь звук",
  "settings.muted": "Выкл.",
  "settings.on": "Вкл.",
  "settings.off": "Выкл.",
  "settings.test": "Проба ♪",
  "settings.master": "Общий",
  "settings.music": "Музыка",
  "settings.effects": "Эффекты",
  "settings.audioNote": "Вся музыка и звуки создаются в реальном времени — без аудиофайлов. Если на iPhone ничего не слышно, коснитесь экрана один раз (Safari требует касания перед запуском звука).",
  "settings.display": "Отображение и доступность",
  "settings.language": "Язык",

  // accessibility prefs
  "pref.largeText.label": "Крупный текст",
  "pref.largeText.help": "Более крупный, удобный для чтения текст сюжета и меню.",
  "pref.highContrast.label": "Высокий контраст",
  "pref.highContrast.help": "Более насыщенные цвета для слабого освещения или слабого зрения.",
  "pref.bigTouch.label": "Крупные кнопки",
  "pref.bigTouch.help": "Более высокие кнопки, по которым легче попадать.",
  "pref.reduceMotion.label": "Меньше анимаций",
  "pref.reduceMotion.help": "Свести к минимуму анимации и переходы между экранами.",

  // attributes
  "attr.might": "Сила",
  "attr.agility": "Ловкость",
  "attr.wits": "Разум",
  "attr.spirit": "Дух",
  "stat.hp": "ОЗ",
  "stat.focus": "Фокус",
  "stat.def": "Защ",

  // character creation
  "create.title": "Создайте героев",
  "create.subtitle": "Четверо, давших Клятву Хранителей. Коснитесь ячейки, чтобы изменить каждого.",
  "create.namePlaceholder": "Имя",
  "create.allocate": "Распределите очки",
  "create.left": "осталось: {n}",
  "create.randomize": "🎲 Случайный герой",
  "create.begin": "Начать приключение",
  "create.none": "Нет",
  "create.noTrait": "Без дополнительной черты.",
  "pick.class": "Класс",
  "pick.race": "Раса",
  "pick.bg": "Происхождение",
  "pick.trait": "Стартовая черта",

  // how to play
  "how.title": "Как играть",
  "how.body": `<b>Основной бросок.</b> Почти всё решается броском d20 плюс модификатор характеристики против целевого числа. Превзойдите его — и вы преуспели; натуральная 20 всегда попадает (и наносит критический урон удвоенными костями), натуральная 1 всегда промахивается.

<b>Характеристики.</b>
• <b>Сила</b> — ближний бой: атака и урон, проверки на грубую силу.
• <b>Ловкость</b> — защита, точные удары, скрытность и взлом замков.
• <b>Разум</b> — магические атака и урон, знания и внимательность.
• <b>Дух</b> — сила исцеления, запас Фокуса, стойкость.

<b>Бой.</b> В начале определяется инициатива. В свой ход герой тратит <b>Фокус</b> на способности или бесплатно наносит обычную атаку. Победа — когда повержены все враги; если падёт весь отряд, игра окончена (Воскрешение, Слёзы феникса или Хранитель способны поднять павшего союзника).

<b>Сюжет.</b> Выборы, помеченные характеристикой и СЛ, — это проверки кубиком: бросает наиболее подходящий герой. Побеждайте в боях ради опыта, золота и добычи; тратьте золото у аптекаря и отдыхайте, чтобы исцелиться.

<b>Сохранение.</b> Игра сохраняется автоматически в пути; используйте «Продолжить» в главном меню.`,
};

const TABLES: Record<Locale, Dict> = { en: EN, ru: RU };

// Translate a UI key for the active locale, falling back to English then the key
// itself. Optional {placeholder} substitution.
export function t(key: string, vars?: Record<string, string | number>): string {
  let s = TABLES[locale][key] ?? EN[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}
