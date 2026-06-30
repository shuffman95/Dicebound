// Content localization. Translations are keyed by namespace -> id -> field, where
// fields are the user-facing string fields of each def (name, blurb, description,
// summary, objective, title, text). `localizeDef` returns a shallow copy with the
// active locale's strings merged in; untranslated entries fall through to English,
// so this is safe to wire in before every locale is complete.
//
// Filled in stages: creation content (classes/races/backgrounds/traits) first;
// items/abilities/enemies/quests/lore and the story script follow.
import { getLocale } from "../engine/i18n.js";

type FieldMap = Record<string, string>;
type NsMap = Record<string, FieldMap>;

const RU: Record<string, NsMap> = {
  class: {
    vanguard: { name: "Авангард", blurb: "Железная стена. Принимает удары, оглушает врагов и прикрывает отряд." },
    arcanist: { name: "Чародей", blurb: "Хрупкая мощь. Сжигает, замораживает и стирает врагов целыми рядами." },
    shade: { name: "Тень", blurb: "Убийца во тьме. Криты, яды — и исчезает прежде, чем последует ответ." },
    warden: { name: "Хранитель", blurb: "Страж жизни. Лечит, воскрешает, восстанавливает и оберегает отряд." },
    berserker: { name: "Берсерк", blurb: "Буря ярости. Бьёт как обвал и свирепеет по мере пролитой крови." },
    ranger: { name: "Следопыт", blurb: "Меткий стрелок дикоземья. Осыпает стрелами, пригвождает врагов и не мажет дважды." },
    necromancer: { name: "Некромант", blurb: "Повелитель смерти. Вытягивает жизнь, сеет чуму и питается умирающими." },
    cleric: { name: "Жрец", blurb: "Сосуд святого света. Лечит, защищает, карает нечестивых и поднимает мёртвых." },
  },
  race: {
    aldermoorian: { name: "Алдермурец", blurb: "Люди павшего королевства — разносторонние, упрямые выживальщики." },
    sylvan: { name: "Лесной эльф", blurb: "Долгоживущий народ глухих лесов; быстрый, зоркий, тронутый магией." },
    stout: { name: "Крепыш", blurb: "Рождённые в горах и крепкие, как горы; их трудно свалить и ещё труднее сломить." },
    orcborn: { name: "Орочьерождённый", blurb: "Свирепые горные кланы, что бьются яростнее всего, прижатые к стене." },
    feykin: { name: "Фейский полукровка", blurb: "Полукровки с дикой магией фей; переполнены эфиром." },
    revenant: { name: "Возвращенец", blurb: "Тронуты Опустошением и отказываются оставаться мёртвыми. Хрупки, но встают снова." },
  },
  background: {
    soldier: { name: "Солдат", blurb: "Вы служили в королевском ополчении, пока не пришла порча. Закалённый, дисциплинированный." },
    scholar: { name: "Учёный", blurb: "Жизнь среди книг и старых карт. Вы знаете то, что другие забыли." },
    outlaw: { name: "Разбойник", blurb: "Разыскиваетесь в трёх городах. Знаете, какие замки вскрыть и кому подмазать ладонь." },
    acolyte: { name: "Послушник", blurb: "Выросли при святилище старых зелёных богов. Вера — тоже оружие." },
    noble: { name: "Дворянин", blurb: "Рождены в доме, ныне обращённом в пепел. Вы всё ещё несёте его кошель — и его надежды." },
    wanderer: { name: "Странник", blurb: "Ни дома, ни знамени, ни господина. Всему вас научила дорога." },
  },
  trait: {
    adaptable: { name: "Приспособленность", description: "Разностороннее воспитание: +1 ко всем проверкам навыков." },
    "keen-senses": { name: "Острые чувства", description: "Зоркий глаз и чуткий слух: +2 к проверкам Ловкости и Разума." },
    stoneblood: { name: "Каменная кровь", description: "Выносливость и упорство: +10 к макс. ОЗ." },
    bloodrage: { name: "Кровавая ярость", description: "Ярость загнанного: +3 к урону при половине ОЗ или ниже." },
    "mana-spring": { name: "Источник маны", description: "Связь с плетением: +2 Фокуса в начале каждого хода в бою." },
    undying: { name: "Неумирающий", description: "Тронут Опустошением: впервые павши за бой, вы поднимаетесь с 1 ОЗ." },
    drilled: { name: "Вымуштрованный", description: "Годы под ружьём: +6 к макс. ОЗ." },
    studied: { name: "Начитанный", description: "Начитанность: +2 к проверкам Разума." },
    underworld: { name: "Связи в преступном мире", description: "Уличная смётка: +2 к проверкам Ловкости." },
    faithful: { name: "Верующий", description: "Питаемы преданностью: +4 к макс. Фокусу." },
    survivor: { name: "Выживший", description: "Трудные дороги закаляют: +1 ко всем проверкам навыков." },
    tough: { name: "Крепкий", description: "+12 к макс. ОЗ." },
    focused: { name: "Сосредоточенный", description: "+6 к макс. Фокусу." },
    brawny: { name: "Силач", description: "+1 к Силе." },
    fleet: { name: "Быстрый", description: "+1 к Ловкости." },
    sharp: { name: "Смышлёный", description: "+1 к Разуму." },
    devout: { name: "Набожный", description: "+1 к Духу." },
    lucky: { name: "Везучий", description: "Удача на вашей стороне: +1 ко всем проверкам навыков." },
    warded: { name: "Огражденный", description: "Начинаете каждый бой с щитом на 6 единиц." },
  },
};

const TABLES: Record<string, Record<string, NsMap>> = { ru: RU };

// Return a copy of `def` with the active locale's translated string fields merged
// in. English (and any untranslated entry) passes through unchanged.
export function localizeDef<T extends { id: string }>(ns: string, def: T): T {
  const table = TABLES[getLocale()];
  const tr = table?.[ns]?.[def.id];
  return tr ? ({ ...def, ...tr } as T) : def;
}
