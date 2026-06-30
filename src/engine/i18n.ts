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

  // toasts / feedback messages / notifications
  "check.success": "Success!",
  "check.fail": "Failed.",
  "toast.check": "{name} rolls {attr} — {result}",
  "toast.rested": "The party rests. Fully healed.",
  "toast.noGoldRest": "Not enough gold to rest (20).",
  "toast.invalidTarget": "Invalid target.",
  "toast.noSave": "No save found.",
  "toast.purchased": "Purchased {x}",
  "toast.cantAfford": "Can't afford that.",
  "toast.sold": "Sold.",
  "toast.allRepaired": "All gear repaired.",
  "toast.cantAffordRepairs": "Can't afford repairs.",
  "toast.crafted": "Crafted {x}",
  "toast.missingMaterials": "Missing materials.",
  "toast.equipped": "Equipped.",
  "toast.savedSlot": "Saved to slot {x}",
  "toast.emptySlot": "Empty or invalid slot.",
  "toast.fleeSuccess": "You slip away from the fight.",
  "toast.fleeFail": "Couldn't escape!",
  "log.fleeFail": "The party fails to flee!",
  "toast.exported": "Save exported.",
  "toast.copied": "Save copied to clipboard.",
  "toast.exportFailed": "Export failed.",
  "toast.imported": "Save imported.",
  "toast.invalidSave": "Invalid save data.",
  "msg.revived": "{name} is revived!",
  "msg.revivedAt": "{name} is revived at {hp} HP.",
  "msg.healsHp": "{name} heals {n} HP.",
  "msg.restoresHp": "{name} restores {n} HP.",
  "msg.restoresFocus": "{name} restores {n} Focus.",
  "msg.cleansed": "{name} is cleansed.",
  "msg.gains": "{name} gains {x}.",
  "notif.quest": "Quest",
  "notif.sideQuest": "Side quest",
  "notif.questPrefix": "📜 {type}: {name}",
  "notif.questComplete": "✅ Quest complete: {name}{reward}",
  "notif.reward": " (+{xp} XP, +{gold}{g}{loot})",
  "notif.loot": ", loot",
  "notif.codex": "📖 Codex updated",
  "prompt.pasteSave": "Paste an exported save (JSON):",
  "save.auto": "Auto",
  "save.empty": "— empty —",
  "save.andParty": " & party",
  "save.load": "Load",
  "save.title": "Save Game",
  "common.import": "📥 Import",
  "common.export": "📤 Export",

  // combat log
  "dice.vs": "vs",
  "combat.vsDef": "vs Def",
  "combat.fumble": "Fumble!",
  "combat.miss": "Miss.",
  "combat.crit": "CRIT!",
  "combat.hit": "Hit!",
  "combat.damageWord": "damage",
  "combat.weak": " Weak!",
  "combat.resisted": " Resisted.",
  "react.shatter": " ❄️💥 Shatter!",
  "react.ignite": " 🔥💥 Ignite!",
  "elem.fire": "fire", "elem.ice": "ice", "elem.lightning": "lightning",
  "elem.poison": "poison", "elem.holy": "holy", "elem.dark": "dark",
  "log.battleBegins": "⚔️ Battle begins! Initiative: {order}",
  "log.refusesToDie": "✨ {name} refuses to die and rises at {hp} HP! ({trait})",
  "log.suffersDot": "{name} suffers {n} {kind} damage.",
  "log.regenerates": "{name} regenerates {n} HP.",
  "log.hasFallen": "💀 {name} has fallen!",
  "log.stunned": "{name} is stunned and loses the turn!",
  "log.auraDamage": "{name} takes {n} {elem} damage from the aura.{dead}",
  "log.suffersStatus": "{name} suffers {status}.",
  "log.gainsStatus": "{name} gains {status}.",
  "log.afflicted": "{name} is afflicted: {status}.",
  "log.uses": "{name} uses {ability}.",
  "log.usesFocus": "{name} uses {ability} (−{n} Focus).",
  "log.siphons": "{name} siphons {n} HP.",
  "log.counters": "🛡️ {guarder} counters {attacker} for {n}!{dead}",
  "log.isSlain": "💀 {name} is slain!",
  "log.darkMend": "{name} draws on the Hollowing and recovers {n} HP!",
  "log.defendStance": "{name} takes a defensive stance (−50% damage, counters melee).",
  "log.healsFor": "{name} heals {target} for {n} HP.",
  "log.revives": "✨ {name} revives {target} at {n} HP!",
  "log.attackHead": "{name} → {target}: d20 {die}{bonus} = {total} {vsdef} {def} — ",

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

  // toasts / feedback messages / notifications
  "check.success": "Успех!",
  "check.fail": "Провал.",
  "toast.check": "{name}: бросок {attr} — {result}",
  "toast.rested": "Отряд отдыхает. Полностью исцелён.",
  "toast.noGoldRest": "Недостаточно золота для отдыха (20).",
  "toast.invalidTarget": "Неверная цель.",
  "toast.noSave": "Сохранение не найдено.",
  "toast.purchased": "Куплено: {x}",
  "toast.cantAfford": "Не хватает золота.",
  "toast.sold": "Продано.",
  "toast.allRepaired": "Всё снаряжение починено.",
  "toast.cantAffordRepairs": "Не хватает на починку.",
  "toast.crafted": "Создано: {x}",
  "toast.missingMaterials": "Не хватает материалов.",
  "toast.equipped": "Надето.",
  "toast.savedSlot": "Сохранено в ячейку {x}",
  "toast.emptySlot": "Пустая или неверная ячейка.",
  "toast.fleeSuccess": "Вы ускользаете из боя.",
  "toast.fleeFail": "Не удалось сбежать!",
  "log.fleeFail": "Отряд не сумел сбежать!",
  "toast.exported": "Сохранение выгружено.",
  "toast.copied": "Сохранение скопировано в буфер.",
  "toast.exportFailed": "Не удалось выгрузить.",
  "toast.imported": "Сохранение загружено.",
  "toast.invalidSave": "Неверные данные сохранения.",
  "msg.revived": "{name} воскрешён!",
  "msg.revivedAt": "{name} воскрешён с {hp} ОЗ.",
  "msg.healsHp": "{name} исцеляет {n} ОЗ.",
  "msg.restoresHp": "{name} восстанавливает {n} ОЗ.",
  "msg.restoresFocus": "{name} восстанавливает {n} Фокуса.",
  "msg.cleansed": "{name} очищен.",
  "msg.gains": "{name} получает {x}.",
  "notif.quest": "Задание",
  "notif.sideQuest": "Побочное задание",
  "notif.questPrefix": "📜 {type}: {name}",
  "notif.questComplete": "✅ Задание выполнено: {name}{reward}",
  "notif.reward": " (+{xp} опыта, +{gold}{g}{loot})",
  "notif.loot": ", добыча",
  "notif.codex": "📖 Кодекс обновлён",
  "prompt.pasteSave": "Вставьте выгруженное сохранение (JSON):",
  "save.auto": "Авто",
  "save.empty": "— пусто —",
  "save.andParty": " и отряд",
  "save.load": "Загрузить",
  "save.title": "Сохранить игру",
  "common.import": "📥 Импорт",
  "common.export": "📤 Экспорт",

  // combat log
  "dice.vs": "против",
  "combat.vsDef": "против Защ",
  "combat.fumble": "Провал!",
  "combat.miss": "Промах.",
  "combat.crit": "КРИТ!",
  "combat.hit": "Попадание!",
  "combat.damageWord": "урона",
  "combat.weak": " Уязвимость!",
  "combat.resisted": " Сопротивление.",
  "react.shatter": " ❄️💥 Раскол!",
  "react.ignite": " 🔥💥 Воспламенение!",
  "elem.fire": "огнём", "elem.ice": "льдом", "elem.lightning": "молнией",
  "elem.poison": "ядом", "elem.holy": "светом", "elem.dark": "тьмой",
  "log.battleBegins": "⚔️ Бой начинается! Инициатива: {order}",
  "log.refusesToDie": "✨ {name} отказывается умирать и поднимается с {hp} ОЗ! ({trait})",
  "log.suffersDot": "{name} получает {n} урона ({kind}).",
  "log.regenerates": "{name} восстанавливает {n} ОЗ.",
  "log.hasFallen": "💀 {name} пал!",
  "log.stunned": "{name} оглушён и теряет ход!",
  "log.auraDamage": "{name} получает {n} урона {elem} от ауры.{dead}",
  "log.suffersStatus": "{name} страдает: {status}.",
  "log.gainsStatus": "{name} получает {status}.",
  "log.afflicted": "{name} поражён: {status}.",
  "log.uses": "{name} применяет {ability}.",
  "log.usesFocus": "{name} применяет {ability} (−{n} Фокуса).",
  "log.siphons": "{name} высасывает {n} ОЗ.",
  "log.counters": "🛡️ {guarder} контратакует {attacker} на {n}!{dead}",
  "log.isSlain": "💀 {name} сражён!",
  "log.darkMend": "{name} черпает из Опустошения и восстанавливает {n} ОЗ!",
  "log.defendStance": "{name} встаёт в защитную стойку (−50% урона, контратака в ближнем бою).",
  "log.healsFor": "{name} исцеляет {target} на {n} ОЗ.",
  "log.revives": "✨ {name} воскрешает {target} с {n} ОЗ!",
  "log.attackHead": "{name} → {target}: d20 {die}{bonus} = {total} {vsdef} {def} — ",

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

// The element's adjective/instrumental word for damage lines ("" for physical).
export function elementWord(element: string): string {
  return element === "physical" ? "" : t(`elem.${element}`);
}
