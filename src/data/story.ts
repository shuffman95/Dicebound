import { StoryNode } from "../engine/types.js";

// The adventure as a graph of nodes. Choices can jump, run a d20 skill check,
// start combat, or apply effects (gold/items/heal). Shop & rest are handled by
// the game layer (they re-render the same node afterward).
export const NODES: Record<string, StoryNode> = {
  intro: {
    id: "intro",
    title: "The Hollowing",
    art: "🏰",
    text:
      "Aldermoor was a green kingdom once. Then the Hollow King rose from the barrow under the capital, and a grey rot — the Hollowing — crept out from his crown. Crops turned to ash. The dead would not stay dead.\n\nYou four are the last of the Wardens' Oath: sworn to walk into the rot and put out the crown's grey fire. The road south begins at the ruined waystation of Greyhollow.",
    choices: [{ text: "Begin the journey", goto: "town1" }],
  },

  town1: {
    id: "town1",
    title: "Greyhollow Waystation",
    art: "🏚️",
    text:
      "A handful of survivors huddle around a peat fire. A crook-backed apothecary has set up a stall of salves and oddments, and the old stable still has dry straw to sleep on. South, the Sunken Road drowns into mist.",
    onEnter: { startQuest: "hollow-crown", unlockLore: "the-hollowing" },
    choices: [
      { text: "Visit the apothecary (Shop)", shop: true },
      { text: "Forage the waystation for moonherb", gather: true, effects: { giveItems: ["mat-moonherb", "mat-moonherb"], setFlag: "gather_town1" }, hideIfFlag: "gather_town1" },
      { text: "Rest at the stable — heal the party (20 gold)", rest: true },
      { text: "Take the Sunken Road south", goto: "road1" },
    ],
  },

  road1: {
    id: "road1",
    title: "The Sunken Road",
    art: "🌫️",
    text:
      "Black water laps at a causeway of broken stone. Something pale skitters away into the reeds — then more of them turn, and come back hungry.",
    choices: [
      { text: "Stand and fight", combat: { enemies: ["hollow-rat", "hollow-rat", "rot-crawler"], victoryNode: "road2" } },
    ],
  },

  road2: {
    id: "road2",
    title: "The Drowned Wagon",
    art: "🛒",
    text:
      "A merchant's wagon lies half-sunk in the mire, its strongbox glinting beneath the murk. The wood is rotten and the water deeper than it looks.",
    choices: [
      { text: "Study the wreck for traps and footing (Wits, DC 13)", check: { attr: "wits", dc: 13, successNode: "road2_loot", failNode: "road2_ambush" } },
      { text: "Force the strongbox open by main strength (Might, DC 14)", check: { attr: "might", dc: 14, successNode: "road2_loot", failNode: "road2_ambush" } },
      { text: "Salvage scrap metal from the wreck", gather: true, effects: { giveItems: ["mat-iron-scrap", "mat-iron-scrap"], setFlag: "gather_road2" }, hideIfFlag: "gather_road2" },
      { text: "Leave it and press on", goto: "road3" },
    ],
  },
  road2_loot: {
    id: "road2_loot",
    title: "A Lucky Find",
    art: "💰",
    text: "You work the box free without disturbing the muck. Inside: coin, and a vial that smells of copper and life.",
    onEnter: { gold: 45, giveItems: ["potion-major"] },
    choices: [{ text: "Pocket it and move on", goto: "road3" }],
  },
  road2_ambush: {
    id: "road2_ambush",
    title: "Sprung!",
    art: "🪤",
    text: "The wagon shifts — and husks that were hiding beneath it rise out of the water, blades drawn.",
    choices: [{ text: "Fight!", combat: { enemies: ["husk-bandit", "husk-bandit", "rot-crawler"], victoryNode: "road3" } }],
  },

  road3: {
    id: "road3",
    title: "The Toll Bridge",
    art: "🌉",
    text:
      "A collapsed gatehouse blocks the bridge. You could heave the rubble aside, or slip along the slick ledge around it — one wrong step into the current, though.",
    choices: [
      { text: "Clear the rubble together (Might, DC 12)", check: { attr: "might", dc: 12, successNode: "road3_clear", failNode: "road3_hurt" } },
      { text: "Edge around on the ledge (Agility, DC 13)", check: { attr: "agility", dc: 13, successNode: "road3_clear", failNode: "road3_hurt" } },
    ],
  },
  road3_clear: {
    id: "road3_clear",
    title: "Across",
    art: "✅",
    text: "You make it across without a scratch and catch your breath on the far bank.",
    choices: [{ text: "Press toward the chapel bell", goto: "road_boss" }],
  },
  road3_hurt: {
    id: "road3_hurt",
    title: "A Hard Crossing",
    art: "🩹",
    text: "Someone slips; the current drags before you haul them out, soaked and battered. You cross, but worse for wear.",
    onEnter: { healPercent: -15 },
    choices: [{ text: "Press toward the chapel bell", goto: "road_boss" }],
  },

  road_boss: {
    id: "road_boss",
    title: "The Warden of Thorns",
    art: "🌿",
    text:
      "At the end of the road, a thing of bramble and bone unfolds from the ruined shrine — the Hollowing wearing a dead druid like a glove. It was a Warden once, like you. It remembers the Oath, and hates it.",
    onEnter: { startQuest: "warden-of-thorns" },
    choices: [
      { text: "End its suffering", combat: { enemies: ["warden-of-thorns"], victoryNode: "road_clear" } },
    ],
  },
  road_clear: {
    id: "road_clear",
    title: "First Light",
    art: "🌅",
    text:
      "The bramble-thing comes apart into ordinary thorns, and for a moment the mist thins. Among its roots: a phoenix tear, and the way south to the Drowned Chapel. There's time to return to Greyhollow first.",
    onEnter: { xp: 30, completeQuest: "warden-of-thorns", unlockLore: "wardens-oath" },
    choices: [
      { text: "Return to Greyhollow", goto: "town2" },
      { text: "Push on to the Drowned Chapel", goto: "chapel1" },
    ],
  },

  town2: {
    id: "town2",
    title: "Greyhollow Waystation",
    art: "🏚️",
    text: "Word of the Warden's fall has spread; the survivors look at you with something like hope. The apothecary has restocked.",
    choices: [
      { text: "Visit the apothecary (Shop)", shop: true },
      { text: "Rest at the stable — heal the party (20 gold)", rest: true },
      { text: "Brave the Rimewood (optional)", goto: "rime_enter" },
      { text: "Travel to the Drowned Chapel", goto: "chapel1" },
    ],
  },

  chapel1: {
    id: "chapel1",
    title: "The Drowned Chapel",
    art: "⛪",
    text:
      "The chapel has sunk to its windows in black water. Candlelight moves behind the glass though no living hand could light it. Pale acolytes drift between the pews, chanting to the crown.",
    onEnter: { startQuest: "drowned-faithful" },
    choices: [
      { text: "Cut through the congregation", combat: { enemies: ["pale-acolyte", "pale-acolyte", "bog-lurker"], victoryNode: "chapel2" } },
    ],
  },
  chapel2: {
    id: "chapel2",
    title: "The Reliquary",
    art: "🕯️",
    text:
      "Behind the altar, a locked reliquary hums with warded power. The lock is a puzzle of brass rings; the wards will bite the careless.",
    choices: [
      { text: "Pick the warded lock (Agility, DC 14)", check: { attr: "agility", dc: 14, successNode: "chapel2_loot", failNode: "chapel2_zap" } },
      { text: "Unravel the wards by lore (Wits, DC 15)", check: { attr: "wits", dc: 15, successNode: "chapel2_loot", failNode: "chapel2_zap" } },
      { text: "Pry a bone charm from the reliquary frame", gather: true, effects: { giveItems: ["mat-bone-charm", "mat-moonherb"], setFlag: "gather_chapel2" }, hideIfFlag: "gather_chapel2" },
      { text: "Ignore it and find the bishop", goto: "chapel_boss" },
    ],
  },
  chapel2_loot: {
    id: "chapel2_loot",
    title: "The Reliquary Opens",
    art: "📿",
    text: "The rings click home and the wards sigh out. Within: a runed vest and a purse of old coin.",
    onEnter: { gold: 60, giveItems: ["arm-runed-vest"] },
    choices: [{ text: "Seek the bishop", goto: "chapel_boss" }],
  },
  chapel2_zap: {
    id: "chapel2_zap",
    title: "Warded!",
    art: "⚡",
    text: "The wards discharge in a sheet of cold fire. The reliquary stays shut, and you stagger back smarting.",
    onEnter: { healPercent: -12 },
    choices: [{ text: "Seek the bishop", goto: "chapel_boss" }],
  },
  chapel_boss: {
    id: "chapel_boss",
    title: "The Pale Bishop",
    art: "☦️",
    text:
      "At the flooded altar stands the Pale Bishop, the Hollow King's mouth in the south. It raises grey hands, and the drowned dead raise their heads. 'Kneel,' it says, with a hundred throats, 'and be hollow, and be at peace.'",
    onEnter: { unlockLore: "the-pale-bishop" },
    choices: [
      { text: "Refuse", combat: { enemies: ["the-pale-bishop", "pale-acolyte"], victoryNode: "chapel_clear" } },
    ],
  },
  chapel_clear: {
    id: "chapel_clear",
    title: "The Bell Tolls Once",
    art: "🔔",
    text:
      "The Bishop folds inward and is gone. Its stormcaller rod clatters to the wet stone, still crackling. North, past the marsh, the Ashen Keep rises black against a sky the color of a bruise — the Hollow King waits there.",
    onEnter: { xp: 45, giveItems: ["wpn-stormrod"], completeQuest: "drowned-faithful" },
    choices: [
      { text: "Return to Greyhollow to prepare", goto: "town3" },
      { text: "March on the Ashen Keep", goto: "keep1" },
    ],
  },

  town3: {
    id: "town3",
    title: "Greyhollow — The Last Night",
    art: "🔥",
    text:
      "The survivors give what they have: a hot meal, a whetstone, a blessing. Everyone knows what marching on the Keep means. The apothecary presses her finest wares on you and will not take no.",
    choices: [
      { text: "Visit the apothecary (Shop)", shop: true },
      { text: "Rest at the stable — heal the party (20 gold)", rest: true },
      { text: "March on the Ashen Keep", goto: "keep1" },
    ],
  },

  keep1: {
    id: "keep1",
    title: "The Ashen Keep — Gatehouse",
    art: "🏰",
    text:
      "Wraith knights stand the gate, grey banners hanging in air that does not move. They lower their lances as one.",
    onEnter: { startQuest: "silver-of-the-keep" },
    choices: [
      { text: "Break through the gate", combat: { enemies: ["wraith-knight", "wraith-knight"], victoryNode: "keep2" } },
    ],
  },
  keep2: {
    id: "keep2",
    title: "The Hall of Grey Candles",
    art: "🕯️",
    text:
      "A long hall of guttering candles. Hollow mages turn from their books, and the air goes thin with old magic. A side passage might let you slip past — if you're quiet enough.",
    choices: [
      { text: "Slip past in the dark (Agility, DC 15)", check: { attr: "agility", dc: 15, successNode: "keep3", failNode: "keep2_fight" } },
      { text: "Loot silver and emberdust from the hall", gather: true, effects: { giveItems: ["mat-silver-ingot", "mat-emberdust", "mat-silver-ingot"], setFlag: "gather_keep2", completeQuest: "silver-of-the-keep" }, hideIfFlag: "gather_keep2" },
      { text: "Fight through the mages", combat: { enemies: ["hollow-mage", "hollow-mage", "wraith-knight"], victoryNode: "keep3" } },
    ],
  },
  keep2_fight: {
    id: "keep2_fight",
    title: "Spotted!",
    art: "👁️",
    text: "A candle gutters at the wrong moment. The mages' heads turn together, eyes full of grey light.",
    choices: [{ text: "No choice but to fight", combat: { enemies: ["hollow-mage", "hollow-mage"], victoryNode: "keep3" } }],
  },
  keep3: {
    id: "keep3",
    title: "The Barrow Throne",
    art: "👑",
    text:
      "The throne room is a barrow opened to the sky. On a seat of root and bone sits the Hollow King, the grey crown burning cold above his brow. He does not rise. He does not need to.\n\n'You carry the Oath,' he says, and his voice is the Hollowing itself. 'Good. I have been so lonely, and the Oath makes such patient hollows.'\n\nThis is what you came for. Rest now, or end it.",
    onEnter: { unlockLore: "the-grey-crown" },
    choices: [
      { text: "Steady yourselves (Rest — 20 gold)", rest: true },
      { text: "Use the moment to ready gear (Shop)", shop: true },
      { text: "Put out the grey fire", combat: { enemies: ["the-hollow-king"], victoryNode: "ending_victory" } },
    ],
  },

  // ===================== Optional region: The Rimewood =====================
  rime_enter: {
    id: "rime_enter",
    title: "The Rimewood — Edge",
    art: "🌲",
    text:
      "The road east climbs into a wood gripped by endless winter. At a lean-to of frozen hide, a one-eyed old soldier named Hesken warms his hands over coals that barely glow. 'Wardens went in a year past,' he rasps. 'None came out. But I hear armor on the wind some nights. Something keeps their watch now. Put it down, would you?'",
    onEnter: { startQuest: "frozen-vigil", unlockLore: "the-rimewood" },
    choices: [
      { text: "Ask Hesken what he saw", goto: "rime_hesken" },
      { text: "Enter the frozen wood", goto: "rime_path" },
      { text: "Return to Greyhollow", goto: "town2" },
    ],
  },
  rime_hesken: {
    id: "rime_hesken",
    title: "Hesken's Tale",
    art: "🔥",
    text:
      "'Captain Varn led them — good Wardens, every one. The cold here ain't natural; it's older than the rot, and it don't melt for spring nor fire. They marched to a cairn deep in, where the trees stop. That's where the armor walks.' He spits into the coals. 'Take their blade if you find it. They'd want it used, not buried.'",
    choices: [{ text: "Step into the wood", goto: "rime_path" }],
  },
  rime_path: {
    id: "rime_path",
    title: "The Frozen Trail",
    art: "❄️",
    text:
      "Black trunks crowd a trail of blue ice. A frozen river bars the way, a thicket of ice-sheathed bramble to one side, and—half-buried—the corner of a Warden's cache catching the grey light.",
    choices: [
      { text: "Cross the frozen river (Agility, DC 13)", check: { attr: "agility", dc: 13, successNode: "rime_grove", failNode: "rime_hurt" } },
      { text: "Break through the frozen thicket (Might, DC 13)", check: { attr: "might", dc: 13, successNode: "rime_grove", failNode: "rime_hurt" } },
      { text: "Dig out the half-buried cache (Wits, DC 14)", check: { attr: "wits", dc: 14, successNode: "rime_secret", failNode: "rime_grove" } },
    ],
  },
  rime_hurt: {
    id: "rime_hurt",
    title: "Through the Cold",
    art: "🩹",
    text: "The ice gives way; someone goes through to the waist before you haul them out, blue-lipped and shaking. You press on, chilled to the bone.",
    onEnter: { healPercent: -12 },
    choices: [{ text: "Press deeper", goto: "rime_grove" }],
  },
  rime_secret: {
    id: "rime_secret",
    title: "The Warden's Cache",
    art: "🧊",
    text:
      "Beneath the ice lie cloaks of the Oath, frozen mid-stride, and a captain's journal. You take what they can no longer use — coin, old silver, and the truth of what happened here.",
    onEnter: { gold: 40, giveItems: ["mat-silver-ingot", "treasure-ancient-coin"], unlockLore: "the-frozen-wardens" },
    choices: [{ text: "Press deeper", goto: "rime_grove" }],
  },
  rime_grove: {
    id: "rime_grove",
    title: "The Pale Grove",
    art: "🌫️",
    text: "Frost-wisps drift between the trunks like cold lanterns — and turn, as one, toward the warmth of the living.",
    choices: [
      { text: "Cut through them", combat: { enemies: ["frost-wisp", "frost-wisp", "rime-stalker"], victoryNode: "rime_deep" } },
    ],
  },
  rime_deep: {
    id: "rime_deep",
    title: "Where the Trees Stop",
    art: "⛰️",
    text:
      "The wood thins to a clearing of black stone and a cairn ringed with frozen Wardens, still kneeling. The air here hums with cold. Their watcher is near.",
    choices: [
      { text: "Chip frozen silver from the dead trees", gather: true, effects: { giveItems: ["mat-silver-ingot", "mat-emberdust"], setFlag: "gather_rime" }, hideIfFlag: "gather_rime" },
      { text: "Approach the cairn", combat: { enemies: ["frozen-thrall", "frozen-thrall", "frost-wisp"], victoryNode: "rime_boss" } },
    ],
  },
  rime_boss: {
    id: "rime_boss",
    title: "The Hoarfrost Knight",
    art: "🛡️",
    text:
      "From the cairn rises a figure in rimed plate, a Warden's cloak frozen to its shoulders — Captain Varn, or what the cold made of her. Frost sheets off the armor as it lifts a blade of blue ice. It keeps the vigil still.",
    choices: [
      { text: "Give the vigil its rest", combat: { enemies: ["the-hoarfrost-knight"], victoryNode: "rime_clear" } },
    ],
  },
  rime_clear: {
    id: "rime_clear",
    title: "The Cold Breaks",
    art: "🌅",
    text:
      "The armor comes apart in a fall of frost, and for the first time in a year the Rimewood is merely cold, not cruel. Winter's Edge lies bright in the snow. The frozen Wardens, freed, sink quietly into rest. Hesken will sleep easier — and so, perhaps, will you.",
    onEnter: { xp: 40, completeQuest: "frozen-vigil" },
    choices: [
      { text: "Return to Greyhollow", goto: "town2" },
    ],
  },

  ending_victory: {
    id: "ending_victory",
    title: "The Crown Goes Out",
    art: "🌄",
    text:
      "The grey crown cracks like river ice and the cold fire gutters out. The Hollow King sighs — almost grateful — and is, at last, only a dead man on a throne of roots.\n\nFar to the north, in Greyhollow, the peat fire burns a little warmer, and the first green thing in a year pushes up through the ash. The Wardens' Oath is kept.\n\n— THE END —\n\nThank you for playing Dicebound: The Hollow Crown.",
    isEnding: "victory",
    onEnter: { completeQuest: "hollow-crown" },
    choices: [{ text: "Return to the title", goto: "intro" }],
  },
  ending_defeat: {
    id: "ending_defeat",
    title: "Hollowed",
    art: "💀",
    text:
      "The grey light takes you, one by one, and the Oath becomes another patient hollow in the Hollow King's long quiet court.\n\nBut the dead remember. Somewhere, someone takes up the Oath again...\n\n— DEFEAT —",
    isEnding: "defeat",
    choices: [{ text: "Try again", goto: "intro" }],
  },
};

export const START_NODE = "intro";
