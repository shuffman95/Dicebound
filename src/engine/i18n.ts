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

  // topbar
  "topbar.gold": "gold",
  "topbar.journal": "Journal",
  "topbar.party": "Party",
  "topbar.save": "Save",

  // combat
  "common.cancel": "Cancel",
  "combat.round": "Round {n}",
  "combat.yourMove": " — your move",
  "combat.vs": "— vs —",
  "combat.acting": "{x} is acting…",
  "combat.chooseTarget": "Choose a target for",
  "combat.useItemPrompt": "Use <b>{x}</b> on whom?",
  "combat.defend": "🛡 Defend",
  "combat.item": "🎒 Item",
  "combat.flee": "Flee",
  "combat.fp": "{n} FP",
  "combat.free": "free",
  "combat.cd": "CD {n}",
  "victory.title": "Victory!",
  "victory.xp": "XP",
  "victory.gold": "gold",
  "victory.spoils": "Spoils",
  "victory.noLoot": "No loot dropped.",
  "victory.reachedLevel": "{name} reached Level {lvl}!",
  "victory.gains": "+{hp} HP, +{fp} FP",
  "victory.learned": ", learned {x}",

  // status effects (combat log / pills)
  "status.poison": "Poison", "status.burn": "Burn", "status.regen": "Regen",
  "status.shield": "Shield", "status.stun": "Stun", "status.weaken": "Weaken",
  "status.fortify": "Fortify", "status.rally": "Rally", "status.guard": "Guard",
  "status.chill": "Chill",
  "u.perTurn": "/turn", "u.t": "t", "u.atk": "atk", "u.def": "def", "u.dmg": "dmg",

  // journal
  "journal.quests": "Quests",
  "journal.completed": "Completed",
  "journal.codex": "Codex",
  "journal.noQuests": "No active quests.",
  "journal.noCodex": "No codex entries yet. Explore to uncover the world's history.",
  "journal.objective": "Objective:",
  "journal.doneSuffix": " — done",
  "journal.back": "Back to Journal",
  "quest.main": "main",
  "quest.side": "side",

  // party panel / talents / equip
  "common.use": "Use",
  "stat.xp": "XP",
  "stat.level": "Level {n}",
  "stat.lvlShort": "L",
  "attr.short.might": "MGT", "attr.short.agility": "AGI", "attr.short.wits": "WIT", "attr.short.spirit": "SPR",
  "slot.weapon": "weapon", "slot.armor": "armor", "slot.trinket": "trinket",
  "u.goldShort": "g",
  "party.tapSlot": "Tap a slot to change gear.",
  "party.talents": "Talents",
  "party.provisions": "Provisions",
  "party.spareGear": "Spare Gear",
  "party.materials": "Materials",
  "party.noProvisions": "No provisions.",
  "party.noSpareGear": "No spare gear.",
  "talents.heading": "Talents",
  "talents.learned": "Learned",
  "talents.learn": "Learn",
  "talents.tier": "Tier {n}",
  "talents.needs": "needs {n} spent",
  "talents.points": "{n} points available",
  "talents.help": "Earn 1 talent point per level. Higher tiers unlock as you spend points in the tree.",
  "equip.equipped": "Equipped:",
  "equip.equip": "Equip",
  "equip.unequip": "Unequip",
  "equip.noSpare": "No spare {slot} in the bag.",

  // shop / workshop
  "shop.title": "Apothecary & Smith",
  "shop.workshop": "🛠 Workshop",
  "shop.repairAll": "Repair all — {n}{g}",
  "shop.allRepaired": "All gear repaired",
  "shop.equipment": "Equipment",
  "shop.sellHeading": "Sell",
  "shop.soldOut": "Sold out for now.",
  "shop.nothingToSell": "Nothing to sell.",
  "shop.buy": "Buy",
  "shop.sellFor": "Sell {n}{g}",
  "shop.leave": "Leave",
  "craft.workshopTitle": "Workshop",
  "craft.noMaterials": "No materials yet — win fights and gather to collect them.",
  "craft.alchemy": "⚗️ Alchemy",
  "craft.smithing": "🔨 Smithing",
  "craft.needs": "Needs:",
  "craft.craft": "Craft",

  // item-use modals
  "items.useAnItem": "Use an Item",
  "items.noUsable": "No usable items.",
  "items.noValidTarget": "No valid target.",
  "items.useOn": "Use {x}",

  // endings
  "ending.returnTitle": "Return to Title",
  "ending.tryAgain": "Try Again",

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

  // topbar
  "topbar.gold": "золота",
  "topbar.journal": "Журнал",
  "topbar.party": "Отряд",
  "topbar.save": "Сохранить",

  // combat
  "common.cancel": "Отмена",
  "combat.round": "Раунд {n}",
  "combat.yourMove": " — ваш ход",
  "combat.vs": "— против —",
  "combat.acting": "{x} ходит…",
  "combat.chooseTarget": "Выберите цель для",
  "combat.useItemPrompt": "Применить <b>{x}</b> — на ком?",
  "combat.defend": "🛡 Защита",
  "combat.item": "🎒 Предмет",
  "combat.flee": "Бежать",
  "combat.fp": "{n} ФП",
  "combat.free": "беспл.",
  "combat.cd": "КД {n}",
  "victory.title": "Победа!",
  "victory.xp": "опыта",
  "victory.gold": "золота",
  "victory.spoils": "Добыча",
  "victory.noLoot": "Добычи не выпало.",
  "victory.reachedLevel": "{name} достигает уровня {lvl}!",
  "victory.gains": "+{hp} ОЗ, +{fp} ФП",
  "victory.learned": ", выучено: {x}",

  // status effects (combat log / pills)
  "status.poison": "Яд", "status.burn": "Ожог", "status.regen": "Регенерация",
  "status.shield": "Щит", "status.stun": "Оглушение", "status.weaken": "Ослабление",
  "status.fortify": "Укрепление", "status.rally": "Воодушевление", "status.guard": "Защита",
  "status.chill": "Озноб",
  "u.perTurn": "/ход", "u.t": "х", "u.atk": "атк", "u.def": "защ", "u.dmg": "урон",

  // journal
  "journal.quests": "Задания",
  "journal.completed": "Выполнено",
  "journal.codex": "Кодекс",
  "journal.noQuests": "Нет активных заданий.",
  "journal.noCodex": "Записей кодекса пока нет. Исследуйте мир, чтобы раскрыть его историю.",
  "journal.objective": "Цель:",
  "journal.doneSuffix": " — выполнено",
  "journal.back": "Назад к журналу",
  "quest.main": "основное",
  "quest.side": "побочное",

  // party panel / talents / equip
  "common.use": "Использовать",
  "stat.xp": "Опыт",
  "stat.level": "Уровень {n}",
  "stat.lvlShort": "Ур.",
  "attr.short.might": "СИЛ", "attr.short.agility": "ЛОВ", "attr.short.wits": "РАЗ", "attr.short.spirit": "ДУХ",
  "slot.weapon": "оружие", "slot.armor": "броня", "slot.trinket": "талисман",
  "u.goldShort": "з",
  "party.tapSlot": "Коснитесь ячейки, чтобы сменить снаряжение.",
  "party.talents": "Таланты",
  "party.provisions": "Припасы",
  "party.spareGear": "Запасное снаряжение",
  "party.materials": "Материалы",
  "party.noProvisions": "Припасов нет.",
  "party.noSpareGear": "Запасного снаряжения нет.",
  "talents.heading": "Таланты",
  "talents.learned": "Изучено",
  "talents.learn": "Изучить",
  "talents.tier": "Ярус {n}",
  "talents.needs": "нужно потрачено: {n}",
  "talents.points": "доступно очков: {n}",
  "talents.help": "1 очко таланта за каждый уровень. Высшие ярусы открываются по мере траты очков в дереве.",
  "equip.equipped": "Надето:",
  "equip.equip": "Надеть",
  "equip.unequip": "Снять",
  "equip.noSpare": "Нет запасного предмета ({slot}) в сумке.",

  // shop / workshop
  "shop.title": "Аптекарь и кузнец",
  "shop.workshop": "🛠 Мастерская",
  "shop.repairAll": "Починить всё — {n}{g}",
  "shop.allRepaired": "Всё снаряжение починено",
  "shop.equipment": "Снаряжение",
  "shop.sellHeading": "Продажа",
  "shop.soldOut": "Пока всё распродано.",
  "shop.nothingToSell": "Нечего продать.",
  "shop.buy": "Купить",
  "shop.sellFor": "Продать {n}{g}",
  "shop.leave": "Уйти",
  "craft.workshopTitle": "Мастерская",
  "craft.noMaterials": "Материалов пока нет — побеждайте в боях и собирайте их.",
  "craft.alchemy": "⚗️ Алхимия",
  "craft.smithing": "🔨 Кузнечное дело",
  "craft.needs": "Нужно:",
  "craft.craft": "Создать",

  // item-use modals
  "items.useAnItem": "Использовать предмет",
  "items.noUsable": "Нет подходящих предметов.",
  "items.noValidTarget": "Нет подходящей цели.",
  "items.useOn": "Использовать: {x}",

  // endings
  "ending.returnTitle": "Вернуться в меню",
  "ending.tryAgain": "Попробовать снова",

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
