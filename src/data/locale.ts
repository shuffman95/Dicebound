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
  enemy: {
    "hollow-rat": { name: "Полая крыса" },
    "rot-crawler": { name: "Гнилостный ползун" },
    "husk-bandit": { name: "Разбойник-шелуха" },
    "pale-acolyte": { name: "Бледный послушник" },
    "bog-lurker": { name: "Болотный хищник" },
    "wraith-knight": { name: "Рыцарь-призрак" },
    "hollow-mage": { name: "Полый маг" },
    "warden-of-thorns": { name: "Хранитель Терний" },
    "the-pale-bishop": { name: "Бледный Епископ" },
    "frost-wisp": { name: "Морозный огонёк" },
    "rime-stalker": { name: "Инеевый охотник" },
    "frozen-thrall": { name: "Ледяной невольник" },
    "the-hoarfrost-knight": { name: "Рыцарь Изморози" },
    "mire-spore": { name: "Топяная спора" },
    "blight-hound": { name: "Гончая порчи" },
    "rot-shaman": { name: "Шаман гнили" },
    "plague-thrall": { name: "Чумной невольник" },
    "the-rotcrowned": { name: "Гнилоувенчанная" },
    "the-candlewright": { name: "Свечница" },
    "the-hollow-king": { name: "Полый Король" },
  },
  quest: {
    "hollow-crown": {
      name: "Полая корона",
      summary: "Алдермур умирает под серой порчей Опустошения. Как последние из давших Клятву Хранителей, вы должны дойти до Пепельной Цитадели и погасить корону Полого Короля.",
      objective: "Победите Полого Короля.",
    },
    "warden-of-thorns": {
      name: "Эхо Хранителя",
      summary: "Раненый разведчик говорит о существе из терния и кости на Затонувшей Дороге — Хранителе, как и вы, обращённом порчей. Оно заслуживает конца.",
      objective: "Упокойте Хранителя Терний.",
    },
    "drowned-faithful": {
      name: "Утонувшая паства",
      summary: "Утонувшая Часовня всё ещё поёт мёртвому богу. Заставьте Бледного Епископа умолкнуть и освободите паству из хватки короны.",
      objective: "Победите Бледного Епископа.",
    },
    "frozen-vigil": {
      name: "Морозное бдение",
      summary: "Старый Хескен на краю Морозного леса говорит, что Хранители вошли в мёрзлый перевал год назад и не вернулись — а теперь нечто холодное и закованное в латы несёт их дозор. Упокойте его.",
      objective: "Победите Рыцаря Изморози в Морозном лесу.",
    },
    "blighted-roots": {
      name: "Поражённые корни",
      summary: "Старый Седж на краю топи рассказывает о Матушке Висте, целительнице, что ушла в Гнилотопь сезон назад в поисках лекарства от Опустошения — и об увенчанном существе, что теперь возделывает гниль на месте её исчезновения. Упокойте её.",
      objective: "Победите Гнилоувенчанную в Гнилотопи.",
    },
    "the-unhollowed": {
      name: "Неопустошённые",
      summary: "До того как Хранители выступили, трое жителей Грейхоллоу не выдержали и бежали на юг в гниль, и о них больше не слышали — резчица тростника с дочерью, пилигрим и Вик-свечница. Аптекарша Марен просит узнать, что с ними сталось, и даровать им милость, если милость — всё, что осталось.",
      objective: "Узнайте судьбу троих, бежавших на юг (Затонувшая Дорога, Утонувшая Часовня, Пепельная Цитадель).",
    },
    "silver-of-the-keep": {
      name: "Серебро Цитадели",
      summary: "Кузнец в Грейхоллоу клянётся, что Пепельная Цитадель полна свечного серебра несметной цены. Соберите по пути к трону всё, что сможете.",
      objective: "Соберите серебро в Зале Серых Свечей.",
    },
  },
  item: {
    "potion-minor": { name: "Малая мазь", description: "Восстанавливает 2d6+4 ОЗ одному союзнику." },
    "potion-major": { name: "Большая мазь", description: "Восстанавливает 4d6+8 ОЗ одному союзнику." },
    "potion-focus": { name: "Эфирное зелье", description: "Восстанавливает 8 Фокуса одному союзнику." },
    antidote: { name: "Противоядие", description: "Снимает Яд и Ожог с одного союзника." },
    "smoke-bomb": { name: "Дымовая шашка", description: "Даёт союзнику +4 к Защите на 2 хода." },
    "phoenix-tear": { name: "Слеза феникса", description: "Воскрешает павшего союзника с 50% ОЗ." },
    "potion-cleanse": { name: "Очищающий отвар", description: "Восстанавливает 2d6 ОЗ и снимает Яд и Ожог с одного союзника." },
    "war-tonic": { name: "Боевой тоник", description: "Даёт союзнику Воодушевление (+2 к атаке и урону) на 3 хода." },
    "wpn-broadsword": { name: "Палаш", description: "+2 к атаке, +1 к урону." },
    "wpn-aether-rod": { name: "Эфирный жезл", description: "+2 к атаке, +1 к урону." },
    "wpn-twin-daggers": { name: "Парные кинжалы", description: "+2 к атаке, +1 к урону." },
    "wpn-bramble-staff": { name: "Терновый посох", description: "+1 к атаке, +1 к урону." },
    "wpn-greataxe": { name: "Секира", description: "+2 к атаке, +3 к урону." },
    "wpn-longbow": { name: "Длинный лук", description: "+3 к атаке, +1 к урону." },
    "wpn-bone-wand": { name: "Костяная палочка", description: "+2 к атаке, +2 к урону." },
    "wpn-holy-mace": { name: "Священная булава", description: "+2 к атаке, +1 к урону, +1 к Духу." },
    "wpn-starsteel-blade": { name: "Клинок звёздной стали", description: "+4 к атаке, +3 к урону." },
    "wpn-stormrod": { name: "Жезл громовержца", description: "+3 к атаке, +4 к урону." },
    "wpn-shadowfang": { name: "Крис «Теневой клык»", description: "+4 к атаке, +3 к урону." },
    "wpn-lifebough": { name: "Посох Живой Ветви", description: "+3 к атаке, +2 к урону, +1 к Духу." },
    "wpn-vigil-glaive": { name: "Глефа Бдения", description: "+3 к атаке, +2 к урону." },
    "wpn-ember-brand": { name: "Тлеющий клинок", description: "+2 к атаке, +4 к урону, +1 к Разуму." },
    "wpn-winters-edge": { name: "Грань Зимы", description: "+4 к атаке, +4 к урону, +1 к Ловкости." },
    "wpn-mirecrown-scepter": { name: "Скипетр Топяной Короны", description: "+3 к атаке, +3 к урону, +1 к Разуму." },
    "wpn-kingsbane": { name: "Погибель Королей", description: "+6 к атаке, +6 к урону, +1 к Силе." },
    "arm-robe": { name: "Тканая роба", description: "+1 к Защите." },
    "arm-leather": { name: "Варёная кожа", description: "+2 к Защите." },
    "arm-chain": { name: "Кольчуга", description: "+3 к Защите." },
    "arm-warded-plate": { name: "Зачарованный доспех", description: "+5 к Защите, +6 ОЗ." },
    "arm-runed-vest": { name: "Рунический жилет", description: "+3 к Защите, +6 Фокуса." },
    "arm-nightcloak": { name: "Ночной плащ", description: "+4 к Защите, +1 к Ловкости." },
    "arm-vigil-mail": { name: "Кольчуга Бдения", description: "+5 к Защите, +6 ОЗ." },
    "arm-ember-weave": { name: "Тлеющее плетение", description: "+3 к Защите, +8 Фокуса." },
    "trk-iron-band": { name: "Железное кольцо", description: "+4 ОЗ." },
    "trk-wits-charm": { name: "Талисман учёного", description: "+1 к Разуму." },
    "trk-agile-ring": { name: "Кольцо ртути", description: "+1 к Ловкости." },
    "trk-spirit-amulet": { name: "Изумрудный амулет", description: "+1 к Духу." },
    "trk-bloodstone": { name: "Кровавик", description: "+12 ОЗ." },
    "trk-focus-lens": { name: "Фокусирующая линза", description: "+8 Фокуса." },
    "trk-warding-eye": { name: "Оберегающее око", description: "+2 к Защите." },
    "trk-titan-seal": { name: "Печать титана", description: "+2 к Силе, +10 ОЗ." },
    "trk-vigil-seal": { name: "Печать Бдения", description: "+1 к Духу, +6 ОЗ." },
    "trk-ember-eye": { name: "Тлеющее око", description: "+1 к Разуму, +6 Фокуса." },
    "trk-rimeheart": { name: "Сердце Изморози", description: "+2 к Защите, +14 ОЗ." },
    "trk-witch-phylactery": { name: "Филактерия ведьмы", description: "+1 к Духу, +8 Фокуса." },
    "trk-keepsake": { name: "Памятка пилигрима", description: "+1 к Духу, +6 ОЗ. Память о тех, кто бежал и не вернулся." },
    "mat-iron-scrap": { name: "Железный лом", description: "Собранный металл. Пригодится кузнецу." },
    "mat-silver-ingot": { name: "Серебряный слиток", description: "Брусок очищенного серебра." },
    "mat-moonherb": { name: "Лунотрав", description: "Бледная травка, что слабо светится. Алхимики её ценят." },
    "mat-emberdust": { name: "Тлеющая пыль", description: "Тёплая на ощупь, никогда не остывает." },
    "mat-bone-charm": { name: "Костяной амулет", description: "Резной талисман, снятый с Опустошённого." },
    "mat-blightcap": { name: "Гнилогриб", description: "Бледный топяной гриб, склизкий от гнили. Алхимики осторожно перегоняют его в лекарства." },
    "treasure-ancient-coin": { name: "Древняя монета", description: "Деньги королевства старше Алдермура." },
    "treasure-gilded-idol": { name: "Позолоченный идол", description: "Маленький идол из кованого золота. Стоит немало." },
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
