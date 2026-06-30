import { QuestDef } from "../engine/types.js";

export const QUESTS: Record<string, QuestDef> = {
  "hollow-crown": {
    id: "hollow-crown", name: "The Hollow Crown", type: "main",
    summary: "Aldermoor is dying under the grey rot of the Hollowing. As the last of the Wardens' Oath, you must reach the Ashen Keep and put out the Hollow King's crown.",
    objective: "Defeat the Hollow King.",
  },
  "warden-of-thorns": {
    id: "warden-of-thorns", name: "Echoes of the Warden", type: "side",
    summary: "A wounded scout speaks of a thing of bramble and bone on the Sunken Road — a Warden, like you, turned by the rot. It deserves an ending.",
    objective: "Lay the Warden of Thorns to rest.",
    reward: { gold: 30, xp: 25, items: ["war-tonic"] },
  },
  "drowned-faithful": {
    id: "drowned-faithful", name: "The Drowned Faithful", type: "side",
    summary: "The Drowned Chapel still sings to a dead god. Silence the Pale Bishop and free the congregation from the crown's grip.",
    objective: "Defeat the Pale Bishop.",
    reward: { gold: 40, xp: 35, items: ["potion-major"] },
  },
  "frozen-vigil": {
    id: "frozen-vigil", name: "The Frozen Vigil", type: "side",
    summary: "Old Hesken at the edge of the Rimewood says Wardens marched into the frozen pass a year ago and never returned — and that something cold and armored now keeps their vigil. Put it to rest.",
    objective: "Defeat the Hoarfrost Knight in the Rimewood.",
    reward: { gold: 70, xp: 60, items: ["trk-rimeheart"] },
  },
  "blighted-roots": {
    id: "blighted-roots", name: "Blighted Roots", type: "side",
    summary: "Old Sedge at the fen's edge speaks of Mother Wyste, a healer who walked into the Blightfen a season past to wring a cure for the Hollowing out of the rot itself — and of a crowned thing that now tends the fen where she vanished. Lay her to rest.",
    objective: "Defeat the Rotcrowned in the Blightfen.",
    reward: { gold: 75, xp: 60, items: ["trk-witch-phylactery"] },
  },
  "the-unhollowed": {
    id: "the-unhollowed", name: "The Unhollowed", type: "side",
    summary: "Before the Wardens marched, three of Greyhollow's own lost their nerve and fled south into the rot — a reed-cutter and her child, a pilgrim, and Wick the candlewright. Maren the apothecary asks you to learn what became of them, and to grant them mercy if mercy is all that's left.",
    objective: "Discover the fate of the three who fled south (Sunken Road, Drowned Chapel, Ashen Keep).",
    reward: { gold: 70, xp: 55, items: ["trk-keepsake"] },
  },
  "silver-of-the-keep": {
    id: "silver-of-the-keep", name: "Silver of the Keep", type: "side",
    summary: "The smith at Greyhollow swears the Ashen Keep is full of candle-silver worth a fortune. Gather what you can on the way to the throne.",
    objective: "Loot the silver from the Hall of Grey Candles.",
    reward: { gold: 60, xp: 30 },
  },
};

export function getQuest(id: string): QuestDef | undefined { return QUESTS[id]; }
export const QUEST_LIST = Object.values(QUESTS);
