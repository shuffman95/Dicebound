import { LoreDef } from "../engine/types.js";

// Codex entries unlocked through exploration and quests.
export const LORE: Record<string, LoreDef> = {
  "the-hollowing": {
    id: "the-hollowing", title: "On the Hollowing",
    text: "It did not come as armies come. It came as a grey quiet, seeping up from the barrow beneath the capital the night the old king was buried in his crown of cold iron. Where it passed, the living grew thin and forgetful, and the dead grew restless. The scholars named it the Hollowing, for that is what it leaves: a body that walks, emptied of the person who wore it.",
  },
  "wardens-oath": {
    id: "wardens-oath", title: "The Wardens' Oath",
    text: "We swear to walk into the rot when others flee it. We swear to remember the names the Hollowing steals. We swear that the last green thing will not die untended. The Oath is older than Aldermoor and will outlast it. — inscription, the Warden's shrine",
  },
  "the-pale-bishop": {
    id: "the-pale-bishop", title: "The Pale Bishop",
    text: "Before the rot, Brother Aldous tended the chapel by the marsh and was loved for his gentleness. The Hollowing did not kill him. It made him its mouth in the south, and now a hundred drowned throats speak his sermons. Pity him, then end him.",
  },
  "the-rimewood": {
    id: "the-rimewood", title: "The Rimewood",
    text: "East of Greyhollow the land climbs into a wood that never thaws. It was green once, they say, before the Hollowing reached it and the cold came down to meet the rot halfway. Now frost-wisps drift between black trunks and the snow remembers every footprint for a hundred years. Few who enter the Rimewood come back, and those who do come back quiet.",
  },
  "the-frozen-wardens": {
    id: "the-frozen-wardens", title: "The Frozen Wardens",
    text: "A cache beneath the ice: cloaks of the Oath, frozen mid-stride, and a journal. 'We came to burn out the rot at its eastern edge,' the last entry reads, 'but the cold here is older than the Hollowing and does not care which of us it takes. If you find this, do not mourn us. Finish the work. — Capt. Ilse Varn.' Their leader's blade, Winter's Edge, lies beneath them still keen.",
  },
  "the-grey-crown": {
    id: "the-grey-crown", title: "The Grey Crown",
    text: "Cold iron, beaten thin, set with no jewel — a pauper's crown for the proudest king. They say he forged it himself in his last madness, to 'hold the kingdom together when I am gone.' It holds, after a fashion. It holds everything it touches in grey, patient quiet.",
  },
};

export function getLore(id: string): LoreDef | undefined { return LORE[id]; }
