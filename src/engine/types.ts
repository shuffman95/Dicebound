// ---- Core shared types for Dicebound ----

export type Attr = "might" | "agility" | "wits" | "spirit";
export const ATTRS: Attr[] = ["might", "agility", "wits", "spirit"];

export interface Attributes {
  might: number; // melee attack & damage, HP
  agility: number; // defense, finesse attacks, evasion, stealth
  wits: number; // arcane attacks, perception, lore
  spirit: number; // healing power, focus pool, resolve
}

export type StatusKind =
  | "poison" // damage over time
  | "burn" // damage over time (bigger, shorter)
  | "regen" // heal over time
  | "shield" // flat damage absorption while active
  | "stun" // skip turn
  | "weaken" // -attack
  | "fortify" // +defense
  | "rally" // +attack/damage
  | "guard" // defending: % damage reduction + melee counter
  | "chill"; // slowed (−attack); shatters for bonus damage when struck

export type Element = "physical" | "fire" | "ice" | "lightning" | "poison" | "holy" | "dark";
export const ELEMENTS: Element[] = ["physical", "fire", "ice", "lightning", "poison", "holy", "dark"];

export interface StatusEffect {
  kind: StatusKind;
  turns: number;
  magnitude: number; // damage/heal per turn, or stat delta, or shield HP
}

export type TargetMode =
  | "enemy"
  | "ally"
  | "self"
  | "all-enemies"
  | "all-allies"
  | "any";

export type AbilityKind = "attack" | "heal" | "buff" | "debuff" | "utility";

export interface Ability {
  id: string;
  name: string;
  description: string;
  kind: AbilityKind;
  target: TargetMode;
  focusCost: number;
  cooldown: number; // turns; 0 = always available
  attackAttr?: Attr; // attribute used for the to-hit roll (attacks)
  damage?: string; // dice notation, modifier added from attackAttr
  flatDamageBonus?: number;
  heal?: string; // dice notation, spirit mod added
  applyStatus?: StatusEffect; // applied to the target(s) on use/hit
  selfStatus?: StatusEffect; // applied to the caster
  hits?: number; // multi-hit attacks (default 1)
  ignoreDefense?: boolean; // auto-hit utility/heal
  revive?: number; // if set, revives a fallen ally to this % of max HP
  element?: Element; // damage type for resistances/weaknesses (default physical)
}

export type EquipSlot = "weapon" | "armor" | "trinket";
export type ItemKind = "weapon" | "armor" | "trinket" | "consumable" | "material";
export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface ItemDef {
  id: string;
  name: string;
  kind: ItemKind;
  slot?: EquipSlot;
  price: number;
  description: string;
  itemLevel?: number; // base power tier; scales affix magnitudes when generated
  maxDurability?: number; // equipable items wear down; broken gear gives half stats
  setId?: string; // item-set membership
  // equipment bonuses (the item's intrinsic stats)
  attackBonus?: number;
  damageBonus?: number;
  defenseBonus?: number;
  hpBonus?: number;
  focusBonus?: number;
  attrBonus?: Partial<Attributes>;
  grantsAbility?: string;
  // consumable effect
  consumable?: {
    heal?: string;
    restoreFocus?: number;
    cureStatus?: StatusKind[];
    applyStatus?: StatusEffect; // e.g. a buff potion
    reviveHpPercent?: number; // revive a fallen ally
  };
}

// The stats an affix or set bonus can contribute.
export type AffixStat =
  | "attackBonus" | "damageBonus" | "defenseBonus" | "hpBonus" | "focusBonus"
  | "might" | "agility" | "wits" | "spirit";

export interface StatMods {
  attackBonus?: number;
  damageBonus?: number;
  defenseBonus?: number;
  hpBonus?: number;
  focusBonus?: number;
  attrBonus?: Partial<Attributes>;
}

export interface AffixDef {
  id: string;
  name: string; // prefix ("Vicious") or suffix ("of the Bear")
  kind: "prefix" | "suffix";
  slots: EquipSlot[]; // slots it may roll on
  stat: AffixStat;
  base: number; // value at item level 1
  perLevel: number; // additional value per item level
}

// A rolled affix on an instance.
export interface Affix {
  id: string;
  name: string;
  kind: "prefix" | "suffix";
  stat: AffixStat;
  value: number;
}

// A concrete, owned equipment item (generated with rarity/affixes/durability).
export interface ItemInstance {
  uid: string;
  defId: string;
  rarity: Rarity;
  affixes: Affix[];
  setId?: string;
  durability: number;
  maxDurability: number;
}

export interface SetBonusTier {
  count: number; // pieces required
  mods: StatMods;
  desc: string;
}
export interface SetDef {
  id: string;
  name: string;
  pieces: string[]; // member defIds
  bonuses: SetBonusTier[];
}

// ---- Crafting ----
export interface RecipeDef {
  id: string;
  name: string;
  station: "alchemy" | "smithing";
  description: string;
  inputs: { defId: string; qty: number }[];
  goldCost?: number;
  output: { defId: string; qty: number };
}

// ---- Talents / skill trees ----
export interface TalentEffect {
  mods?: StatMods; // passive stat bonuses
  grantsAbility?: string; // unlocks an ability
  critBonus?: number; // widens crit range (e.g. 1 => crit on 19-20)
  lifestealPct?: number; // heal attacker for % of damage dealt
}
export interface TalentNode {
  id: string;
  name: string;
  description: string;
  tier: number; // row in the tree (0 = base)
  requiresPoints: number; // points already spent in this class tree to unlock
  cost: number; // talent points to learn (usually 1)
  ultimate?: boolean;
  effect: TalentEffect;
}

export interface ClassDef {
  id: string;
  name: string;
  blurb: string;
  baseAttributes: Attributes;
  hpBase: number;
  hpPerLevel: number;
  focusBase: number;
  focusPerLevel: number;
  baseDefense: number;
  startingAbilities: string[];
  abilityUnlocks: { level: number; abilityId: string }[];
  startingItems: string[];
  startingEquipment: Partial<Record<EquipSlot, string>>;
  // which attribute grows on level up (primary first)
  growth: Attr[];
}

// ---- Character build: races, backgrounds, traits ----

export interface TraitDef {
  id: string;
  name: string;
  description: string;
  attrBonus?: Partial<Attributes>;
  hpBonus?: number;
  focusBonus?: number;
  checkBonus?: { attrs: Attr[]; amount: number }; // bonus to story skill checks
  combat?: {
    focusRegenPerTurn?: number;
    lowHpDamageBonus?: { threshold: number; amount: number }; // +dmg while hp <= threshold*maxHP
    reviveOncePerBattle?: { hp: number }; // revive at N hp the first time felled each battle
    startShield?: number; // shield granted on combat start
  };
}

export interface RaceDef {
  id: string;
  name: string;
  blurb: string;
  attrBonus: Partial<Attributes>;
  hpBonus?: number;
  focusBonus?: number;
  traitId: string;
}

export interface BackgroundDef {
  id: string;
  name: string;
  blurb: string;
  attrBonus?: Partial<Attributes>;
  gold?: number;
  items?: string[];
  traitId?: string;
}

// A complete character build chosen at creation.
export interface HeroBuild {
  classId: string;
  raceId: string;
  backgroundId: string;
  name: string;
  allocations: Partial<Attributes>; // point-buy points spent on top of class+race
  traitId?: string; // chosen starting trait (feat)
}

export interface Combatant {
  id: string; // unique instance id
  name: string;
  isPlayer: boolean;
  classId?: string;
  raceId?: string;
  backgroundId?: string;
  traits: string[]; // race/background/chosen trait ids (drive passive & combat hooks)
  talents: Record<string, number>; // talent node id -> rank learned
  level: number;
  attributes: Attributes;
  bonusHP: number; // flat HP from race/background/traits
  bonusFocus: number; // flat Focus from race/background/traits
  maxHP: number;
  hp: number;
  maxFocus: number;
  focus: number;
  baseDefense: number;
  abilities: string[];
  equipment: Partial<Record<EquipSlot, ItemInstance>>;
  statuses: StatusEffect[];
  cooldowns: Record<string, number>;
  combatFlags?: Record<string, boolean>; // per-battle transient flags (e.g. revive used)
  // enemy-only
  enemyAI?: string[]; // ability ids the enemy may use
  xpReward?: number;
  goldReward?: number;
  lootTable?: { itemId: string; chance: number }[];
  resist?: Partial<Record<Element, number>>;
  phase?: BossPhase;
  aura?: AuraDef;
  ai?: EnemyAI;
  alive: boolean;
}

export interface BossPhase {
  atHpPercent: number; // triggers when HP drops to/below this %
  message: string;
  addAbilities?: string[]; // new moves the boss gains
  selfBuff?: StatusEffect; // e.g. rally/fortify
  healPercent?: number; // heal a % of max HP on transition
}

// An arena/aura effect a boss radiates at the start of each round.
export interface AuraDef {
  message?: string;
  element?: Element;
  damage?: number; // dealt to every hero each round
  applyStatus?: StatusEffect; // applied to a random hero
  chance?: number; // probability for applyStatus (default 1)
  afterPhaseOnly?: boolean; // only active once the boss has phased
}

export type EnemyAI = "default" | "aggressive" | "tactician" | "support" | "berserker";

export interface EnemyDef {
  id: string;
  name: string;
  attributes: Attributes;
  maxHP: number;
  baseDefense: number;
  abilities: string[];
  xpReward: number;
  goldReward: number;
  lootTable?: { itemId: string; chance: number }[];
  isBoss?: boolean;
  resist?: Partial<Record<Element, number>>; // damage multiplier per element (>1 weak, <1 resistant)
  phase?: BossPhase; // one-time mid-fight transition
  aura?: AuraDef; // round-start arena effect
  ai?: EnemyAI; // behavior personality
}

// ---- Story / adventure structure ----

export interface SkillCheckSpec {
  attr: Attr;
  dc: number;
  successNode: string;
  failNode: string;
}

export interface ChoiceEffects {
  gold?: number;
  giveItems?: string[];
  healPercent?: number; // heal whole party by % of max
  restoreFocusPercent?: number;
  recruit?: string; // class id to add to party (if room)
  xp?: number;
  setFlag?: string;
  startQuest?: string;
  completeQuest?: string;
  unlockLore?: string;
}

export interface QuestDef {
  id: string;
  name: string;
  type: "main" | "side";
  summary: string; // shown in the journal
  objective: string; // what to do
  reward?: { gold?: number; xp?: number; items?: string[] };
}

export interface LoreDef {
  id: string;
  title: string;
  text: string;
}

export interface StoryChoice {
  text: string;
  // exactly one resolution mechanism is typically used:
  goto?: string; // jump to node
  check?: SkillCheckSpec; // roll; branch on success/fail
  combat?: { enemies: string[]; victoryNode: string; defeatNode?: string };
  effects?: ChoiceEffects;
  effectsNext?: string; // node to go to after applying effects
  requiresFlag?: string; // only show if a flag is set
  hideIfFlag?: string;
  shop?: boolean; // open the shop, then return here
  rest?: boolean; // full heal at an inn (costs gold via effects)
  gather?: boolean; // cosmetic: marks a gathering choice (uses effects to grant materials)
}

export interface StoryNode {
  id: string;
  title: string;
  text: string;
  art?: string; // emoji/glyph banner
  choices: StoryChoice[];
  isEnding?: "victory" | "defeat";
  onEnter?: ChoiceEffects;
}

export interface Area {
  id: string;
  name: string;
  startNode: string;
  nodes: Record<string, StoryNode>;
}
