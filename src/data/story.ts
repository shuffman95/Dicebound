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
      { text: "Ask Maren about the folk who fled south", goto: "town1_missing", hideIfFlag: "q_unhollowed" },
      { text: "Forage the waystation for moonherb", gather: true, effects: { giveItems: ["mat-moonherb", "mat-moonherb"], setFlag: "gather_town1" }, hideIfFlag: "gather_town1" },
      { text: "Rest at the stable — heal the party (20 gold)", rest: true },
      { text: "Take the Sunken Road south", goto: "road1" },
    ],
  },
  town1_missing: {
    id: "town1_missing",
    title: "Maren's Worry",
    art: "🕯️",
    text:
      "The apothecary straightens with a wince — Maren, the survivors call her. 'Before your Oath ever reached us, three of ours lost their nerve and ran south, thinking the rot ran thinner that way. The reed-cutter and her girl. A pilgrim, half-sick already. And Wick, who made our candles thirty winters.' She presses a dried sprig of moonherb into your hand. 'If you find them out there — and you will, the road keeps everything — do for them what I couldn't. That's the whole of what I ask.'",
    onEnter: { startQuest: "the-unhollowed", unlockLore: "maren-of-greyhollow", setFlag: "q_unhollowed" },
    choices: [{ text: "Give Maren your word", goto: "town1" }],
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
      { text: "A child's reed-doll snags your boot — follow the trail", goto: "road_lost", requiresFlag: "q_unhollowed", hideIfFlag: "found_road" },
      { text: "Leave it and press on", goto: "road3" },
    ],
  },
  road_lost: {
    id: "road_lost",
    title: "The Reed Mother",
    art: "🪺",
    text:
      "The trail of small dropped things ends at a half-sunk coracle. The reed-cutter sits in the black water with her girl held close — both gone grey and still, hollowed mid-embrace. They do not rise to fight you; the rot left them only this last shape. You work the reed-doll free from the child's hand, lay the two of them down beneath the reeds where the current won't take them, and stand a moment in the cold before you can go on.",
    onEnter: { setFlag: "found_road", gold: 20, giveItems: ["potion-major"], unlockLore: "the-reed-mother" },
    choices: [{ text: "Return to the wreck", goto: "road2" }],
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
      { text: "Descend into the Blightfen (optional)", goto: "fen_enter" },
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
      { text: "A muffled prayer behind a collapsed pew — investigate (Spirit, DC 13)", check: { attr: "spirit", dc: 13, successNode: "chapel_lost_save", failNode: "chapel_lost_late" }, requiresFlag: "q_unhollowed", hideIfFlag: "found_chapel" },
      { text: "Ignore it and find the bishop", goto: "chapel_boss" },
    ],
  },
  chapel_lost_save: {
    id: "chapel_lost_save",
    title: "A Voice Still Human",
    art: "🙏",
    text:
      "Behind the fallen pew crouches an old man — the pilgrim, thin and fevered but himself, his eyes clearing from terror to weeping as he understands you are warm, and living, and kind. He cannot walk the road at your side, but you give him your spare salve, a lit brand, and the bearing north to Greyhollow and Maren's fire. 'Tell her,' he whispers, gripping your sleeve, 'tell her one of us came back.' It is not much, against all of this. Out here, it is everything.",
    onEnter: { setFlag: "found_chapel", gold: 25, giveItems: ["phoenix-tear"], unlockLore: "the-last-pilgrim" },
    choices: [{ text: "Return to the reliquary", goto: "chapel2" }],
  },
  chapel_lost_late: {
    id: "chapel_lost_late",
    title: "Too Late by an Hour",
    art: "🕯️",
    text:
      "You reach the pilgrim just as the grey is reaching him — far enough gone that there is no calling him back, near enough that he knows your face for a kind one. You hold his hand while the light goes out of him cleanly, before the Hollowing can finish its work and make him walk. A mercy, and a small one, and the only one the chapel left to give.",
    onEnter: { setFlag: "found_chapel", gold: 15, unlockLore: "the-last-pilgrim" },
    choices: [{ text: "Return to the reliquary", goto: "chapel2" }],
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
      { text: "A grey figure weeps in a side cell — approach", goto: "keep_lost", requiresFlag: "q_unhollowed", hideIfFlag: "found_keep" },
      { text: "Fight through the mages", combat: { enemies: ["hollow-mage", "hollow-mage", "wraith-knight"], victoryNode: "keep3" } },
    ],
  },
  keep_lost: {
    id: "keep_lost",
    title: "The Candlewright",
    art: "🕯️",
    text:
      "In a side cell a figure rocks over a guttered candle, trying with grey and clumsy fingers to coax a flame that will not come — Wick, who lit Greyhollow's winters for thirty years. What's left of her lifts a ruined face toward you. 'Can't,' she says, and it is almost a question, 'can't keep it lit—' and then the Hollowing closes over the last of her, and she comes at you with the candle-iron raised.",
    choices: [
      { text: "Give her the light she's chasing", combat: { enemies: ["the-candlewright"], victoryNode: "keep_lost_end" } },
    ],
  },
  keep_lost_end: {
    id: "keep_lost_end",
    title: "A Candle, Snuffed",
    art: "🕯️",
    text:
      "It is over quickly, and quietly. You set the cold candle back into her stilled hands and leave her looking, almost, at peace. Three sought a thinner rot to the south and found only more of it; you have given all three the only ending the rot left to give. Maren will want to know how their story closed. She will not thank you for it. But she will know — and the dead will have their last page.",
    onEnter: { setFlag: "found_keep", completeQuest: "the-unhollowed", gold: 30, unlockLore: "the-candlewright" },
    choices: [{ text: "Return to the hall", goto: "keep2" }],
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

  // ===================== Optional region: The Blightfen =====================
  fen_enter: {
    id: "fen_enter",
    title: "The Blightfen — Edge",
    art: "🪵",
    text:
      "The track west sinks into a country of black water and pale fungus. At a hummock of dry peat, an old cutter named Sedge tends a smudge-fire against the spores. 'Mother Wyste set my fever once, years back — good woman,' he says, not looking up. 'She went in there a season past, chasing a cure for the grey rot. Now there's a thing in a crown of mushrooms keeps her garden. If she's still in there somewhere, the kindest thing is to put it down.'",
    onEnter: { startQuest: "blighted-roots", unlockLore: "the-blightfen" },
    choices: [
      { text: "Ask Sedge what he knows", goto: "fen_sedge" },
      { text: "Wade into the fen", goto: "fen_path" },
      { text: "Return to Greyhollow", goto: "town2" },
    ],
  },
  fen_sedge: {
    id: "fen_sedge",
    title: "Sedge's Telling",
    art: "🔥",
    text:
      "'She weren't mad, whatever they say. She had a notion the cure for the rot had to be made of rot — that you fight a poison with a smaller poison. Reckon she was right and reckon it ate her anyway.' He pokes the smudge-fire. 'The crowned thing don't like flame. Stands to reason — fire's the one thing that ever cleaned this fen. Take a torch to it, if you've the wit.'",
    choices: [{ text: "Step into the fen", goto: "fen_path" }],
  },
  fen_path: {
    id: "fen_path",
    title: "The Sunken Causeway",
    art: "🌫️",
    text:
      "A causeway of half-drowned logs threads the pools. Reeds taller than a man crowd one side; on the other, the roofline of a flooded stillroom breaks the water — Mother Wyste's, perhaps, and worth a look.",
    choices: [
      { text: "Pick along the sunken causeway (Agility, DC 13)", check: { attr: "agility", dc: 13, successNode: "fen_pools", failNode: "fen_hurt" } },
      { text: "Force a path through the reeds (Might, DC 13)", check: { attr: "might", dc: 13, successNode: "fen_pools", failNode: "fen_hurt" } },
      { text: "Search the flooded stillroom (Wits, DC 14)", check: { attr: "wits", dc: 14, successNode: "fen_secret", failNode: "fen_pools" } },
    ],
  },
  fen_hurt: {
    id: "fen_hurt",
    title: "Into the Mire",
    art: "🩹",
    text: "A log rolls underfoot and someone goes in to the chest, coming up coughing and slick with rot before you haul them clear. You press on, fouled and shaken.",
    onEnter: { healPercent: -12 },
    choices: [{ text: "Press deeper", goto: "fen_pools" }],
  },
  fen_secret: {
    id: "fen_secret",
    title: "The Drowned Stillroom",
    art: "🧪",
    text:
      "The stillroom stands to its windows in black water, jars furred green on their shelves. You take what the fen can't use: coin in a tin, Mother Wyste's good silver shears — and her journal, which tells you what she became.",
    onEnter: { gold: 40, giveItems: ["mat-silver-ingot", "treasure-gilded-idol"], unlockLore: "the-lost-herbalist" },
    choices: [{ text: "Press deeper", goto: "fen_pools" }],
  },
  fen_pools: {
    id: "fen_pools",
    title: "The Spore Pools",
    art: "🍄",
    text: "The causeway opens onto a basin of still pools lit by drifting clouds of spores. Pale shapes uncurl from the muck and the air itself seems to turn toward the warmth of the living.",
    choices: [
      { text: "Cut a way through", combat: { enemies: ["mire-spore", "mire-spore", "blight-hound"], victoryNode: "fen_deep" } },
    ],
  },
  fen_deep: {
    id: "fen_deep",
    title: "Where the Reeds Drown",
    art: "🌾",
    text:
      "The reeds thin to a ring of dead willows hung with fat blightcaps, and beyond them a hummock crowned with mushroom and a kneeling shape. Her thralls rise from the water first, to keep the vigil a moment longer.",
    choices: [
      { text: "Harvest blightcaps from the dead willows", gather: true, effects: { giveItems: ["mat-blightcap", "mat-moonherb"], setFlag: "gather_fen" }, hideIfFlag: "gather_fen" },
      { text: "Approach the crowned figure", combat: { enemies: ["plague-thrall", "plague-thrall", "rot-shaman"], victoryNode: "fen_boss" } },
    ],
  },
  fen_boss: {
    id: "fen_boss",
    title: "The Rotcrowned",
    art: "👑",
    text:
      "On the hummock kneels a figure in a gown of moss and bog-cotton, a crown of pale mushrooms ringing her brow — Mother Wyste, who walked into the fen to wring a cure from the rot and let the rot answer instead. She lifts a face soft with grey spores and smiles, almost kindly. 'I found it,' she breathes. 'I found the cure. It only costs everything.'",
    choices: [
      { text: "Give her the ending she sought (bring fire)", combat: { enemies: ["the-rotcrowned"], victoryNode: "fen_clear" } },
    ],
  },
  fen_clear: {
    id: "fen_clear",
    title: "The Fen Quiets",
    art: "🌅",
    text:
      "The crown of mushrooms blackens and falls, and Mother Wyste with it — only an old woman again, at the last, and at rest. The Mirecrown Scepter she carried still hums with the half-thing she nearly made. The spore-light thins; somewhere a frog, the first living thing in a season, dares to call. Sedge will want to know.",
    onEnter: { xp: 45, completeQuest: "blighted-roots" },
    choices: [{ text: "Return to Greyhollow", goto: "town2" }],
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
