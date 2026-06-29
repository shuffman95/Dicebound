import { Ability, Combatant, StatusEffect, StatusKind, TargetMode } from "./types.js";
import { RNG } from "./rng.js";
import { roll, attackRoll } from "./dice.js";
import { getAbility } from "../data/abilities.js";
import { attackBonusFor, damageBonusFor, defenseOf, spiritMod, traitsOf, talentCritBonus, talentLifesteal } from "./character.js";

export type LogKind = "info" | "damage" | "heal" | "miss" | "crit" | "status" | "death" | "focus" | "roll";

export interface LogEntry {
  text: string;
  kind: LogKind;
  // structured dice info for the UI's animated roller (set on to-hit / check rolls)
  dice?: { d20: number; bonus: number; total: number; target: number; hit: boolean; crit: boolean; fumble: boolean };
}

export type Side = "players" | "enemies";

export class Combat {
  players: Combatant[];
  enemies: Combatant[];
  order: Combatant[] = [];
  turnIndex = 0;
  round = 1;
  log: LogEntry[] = [];
  rng: RNG;
  ended = false;

  constructor(players: Combatant[], enemies: Combatant[], rng: RNG) {
    this.players = players;
    this.enemies = enemies;
    this.rng = rng;
  }

  start(): void {
    // reset transient combat state but keep HP/focus carried between fights
    for (const c of [...this.players, ...this.enemies]) {
      c.statuses = [];
      c.cooldowns = {};
      c.combatFlags = {};
      c.alive = c.hp > 0;
      // trait: start-of-battle shield (Warded)
      for (const t of traitsOf(c)) {
        if (t.combat?.startShield && c.alive) {
          c.statuses.push({ kind: "shield", turns: 99, magnitude: t.combat.startShield });
        }
      }
    }
    // initiative: d20 + agility-based tiebreak
    const all = [...this.players, ...this.enemies];
    const init = new Map<string, number>();
    for (const c of all) init.set(c.id, this.rng.int(1, 20) + Math.floor(c.attributes.agility / 2));
    this.order = all.sort((a, b) => (init.get(b.id)! - init.get(a.id)!));
    this.turnIndex = 0;
    this.round = 1;
    this.log.push({ kind: "info", text: `⚔️ Battle begins! Initiative: ${this.order.map((c) => c.name).join(" → ")}` });
    this.beginTurn();
  }

  // ---- side helpers (targeting is relative to the actor) ----
  sideOf(c: Combatant): Side { return c.isPlayer ? "players" : "enemies"; }
  alliesOf(c: Combatant): Combatant[] { return c.isPlayer ? this.players : this.enemies; }
  foesOf(c: Combatant): Combatant[] { return c.isPlayer ? this.enemies : this.players; }
  livingAllies(c: Combatant): Combatant[] { return this.alliesOf(c).filter((x) => x.alive); }
  livingFoes(c: Combatant): Combatant[] { return this.foesOf(c).filter((x) => x.alive); }

  currentActor(): Combatant { return this.order[this.turnIndex]; }
  isPlayerTurn(): boolean { return this.currentActor()?.isPlayer ?? false; }

  isOver(): Side | null {
    if (this.players.every((p) => !p.alive)) return "enemies";
    if (this.enemies.every((e) => !e.alive)) return "players";
    return null;
  }

  // ---- status helpers ----
  statusTotal(c: Combatant, kind: StatusKind): number {
    return c.statuses.filter((s) => s.kind === kind).reduce((a, s) => a + s.magnitude, 0);
  }
  hasStatus(c: Combatant, kind: StatusKind): boolean {
    return c.statuses.some((s) => s.kind === kind);
  }

  defenseInCombat(c: Combatant): number {
    return defenseOf(c) + this.statusTotal(c, "fortify");
  }
  attackModInCombat(c: Combatant, attr: Parameters<typeof attackBonusFor>[1]): number {
    return attackBonusFor(c, attr) + this.statusTotal(c, "rally") - this.statusTotal(c, "weaken") - this.statusTotal(c, "chill");
  }
  damageModInCombat(c: Combatant, attr: Parameters<typeof damageBonusFor>[1]): number {
    return damageBonusFor(c, attr) + this.statusTotal(c, "rally");
  }

  private addStatus(c: Combatant, eff: StatusEffect): void {
    // refresh same-kind status rather than stacking infinitely
    const existing = c.statuses.find((s) => s.kind === eff.kind);
    if (existing) {
      existing.turns = Math.max(existing.turns, eff.turns);
      existing.magnitude = Math.max(existing.magnitude, eff.magnitude);
    } else {
      c.statuses.push({ ...eff });
    }
  }

  private applyDamage(target: Combatant, amount: number): number {
    let remaining = amount;
    // shields absorb first
    const shields = target.statuses.filter((s) => s.kind === "shield");
    for (const sh of shields) {
      if (remaining <= 0) break;
      const absorbed = Math.min(sh.magnitude, remaining);
      sh.magnitude -= absorbed;
      remaining -= absorbed;
    }
    target.statuses = target.statuses.filter((s) => s.kind !== "shield" || s.magnitude > 0);
    target.hp = Math.max(0, target.hp - remaining);
    if (target.hp === 0 && target.alive) {
      target.alive = false;
      // trait: rise again the first time felled each battle (Undying)
      for (const t of traitsOf(target)) {
        const rev = t.combat?.reviveOncePerBattle;
        if (rev && !(target.combatFlags?.undyingUsed)) {
          target.combatFlags = { ...(target.combatFlags ?? {}), undyingUsed: true };
          target.alive = true;
          target.hp = rev.hp;
          this.log.push({ kind: "heal", text: `✨ ${target.name} refuses to die and rises at ${rev.hp} HP! (${t.name})` });
        }
      }
    }
    return amount;
  }

  // Extra flat damage from traits (e.g. Bloodrage while wounded).
  private traitDamageBonus(actor: Combatant): number {
    let bonus = 0;
    for (const t of traitsOf(actor)) {
      const low = t.combat?.lowHpDamageBonus;
      if (low && actor.hp <= actor.maxHP * low.threshold) bonus += low.amount;
    }
    return bonus;
  }

  // ---- turn lifecycle ----
  private beginTurn(): void {
    if (this.ended) return;
    let guard = 0;
    // skip dead actors
    while (!this.currentActor().alive) {
      this.advanceIndex();
      if (++guard > 100) return;
    }
    const actor = this.currentActor();
    // tick cooldowns
    for (const k of Object.keys(actor.cooldowns)) {
      actor.cooldowns[k] = Math.max(0, actor.cooldowns[k] - 1);
    }
    // trait: focus regen at start of turn (Mana Spring)
    for (const t of traitsOf(actor)) {
      if (t.combat?.focusRegenPerTurn && actor.focus < actor.maxFocus) {
        const gain = Math.min(t.combat.focusRegenPerTurn, actor.maxFocus - actor.focus);
        actor.focus += gain;
      }
    }
    // tick statuses (DoT / HoT), then decay durations
    for (const s of [...actor.statuses]) {
      if (s.kind === "poison" || s.kind === "burn") {
        this.applyDamage(actor, s.magnitude);
        this.log.push({ kind: "damage", text: `${actor.name} suffers ${s.magnitude} ${s.kind} damage.` });
      } else if (s.kind === "regen") {
        const heal = Math.min(s.magnitude, actor.maxHP - actor.hp);
        if (heal > 0) { actor.hp += heal; this.log.push({ kind: "heal", text: `${actor.name} regenerates ${heal} HP.` }); }
      }
    }
    if (!actor.alive) { this.log.push({ kind: "death", text: `💀 ${actor.name} has fallen!` }); this.afterAction(); return; }
    for (const s of actor.statuses) s.turns -= 1;
    actor.statuses = actor.statuses.filter((s) => s.turns > 0 || s.kind === "shield");

    // stun: lose the turn
    if (this.hasStatus(actor, "stun")) {
      this.log.push({ kind: "status", text: `${actor.name} is stunned and loses the turn!` });
      actor.statuses = actor.statuses.filter((s) => s.kind !== "stun");
      this.afterAction();
    }
  }

  private advanceIndex(): void {
    this.turnIndex += 1;
    if (this.turnIndex >= this.order.length) {
      this.turnIndex = 0;
      this.round += 1;
      this.roundStart();
    }
  }

  // Boss arena auras: damage/debuff the party at the start of each round.
  private roundStart(): void {
    for (const enemy of this.enemies) {
      const a = enemy.aura;
      if (!enemy.alive || !a) continue;
      if (a.afterPhaseOnly && !enemy.combatFlags?.phased) continue;
      if (a.message) this.log.push({ kind: "info", text: `✴️ ${a.message}` });
      if (a.damage) {
        for (const hero of this.players.filter((p) => p.alive)) {
          const mult = hero.resist?.[a.element ?? "dark"] ?? 1;
          const dmg = Math.max(1, Math.round(a.damage * mult));
          this.applyDamage(hero, dmg);
          this.log.push({ kind: "damage", text: `${hero.name} takes ${dmg} ${a.element ?? "dark"} damage from the aura.${hero.alive ? "" : " 💀"}` });
        }
      }
      if (a.applyStatus && this.rng.chance(a.chance ?? 1)) {
        const living = this.players.filter((p) => p.alive);
        if (living.length) {
          const victim = this.rng.pick(living);
          this.addStatus(victim, a.applyStatus);
          this.log.push({ kind: "status", text: `${victim.name} suffers ${describeStatus(a.applyStatus)}.` });
        }
      }
    }
  }

  // Called after any actor finishes; advances and runs enemy turns automatically
  // until it is a living player's turn or combat ends.
  private afterAction(): void {
    const over = this.isOver();
    if (over) { this.endCombat(over); return; }
    this.advanceIndex();
    this.beginTurn();
    const o2 = this.isOver();
    if (o2) { this.endCombat(o2); return; }
  }

  private endCombat(winner: Side): void {
    if (this.ended) return;
    this.ended = true;
    this.log.push({ kind: "info", text: winner === "players" ? "🏆 Victory!" : "☠️ The party has fallen..." });
  }

  // ---- targeting ----
  resolveTargets(actor: Combatant, ability: Ability, primary?: Combatant): Combatant[] {
    const mode: TargetMode = ability.target;
    switch (mode) {
      case "self": return [actor];
      case "all-allies": return this.livingAllies(actor);
      case "all-enemies": return this.livingFoes(actor);
      case "ally": {
        // revive targets a fallen ally; otherwise a living one
        if (ability.revive != null) {
          return primary ? [primary] : this.alliesOf(actor).filter((x) => !x.alive).slice(0, 1);
        }
        return primary ? [primary] : this.livingAllies(actor).slice(0, 1);
      }
      case "enemy": return primary ? [primary] : this.livingFoes(actor).slice(0, 1);
      case "any": return primary ? [primary] : this.livingFoes(actor).slice(0, 1);
    }
  }

  validTargets(actor: Combatant, ability: Ability): Combatant[] {
    if (ability.revive != null) return this.alliesOf(actor).filter((x) => !x.alive);
    switch (ability.target) {
      case "self": return [actor];
      case "ally": case "all-allies": return this.livingAllies(actor);
      case "enemy": case "all-enemies": case "any": return this.livingFoes(actor);
    }
  }

  abilityUsable(actor: Combatant, ability: Ability): boolean {
    if (actor.focus < ability.focusCost) return false;
    if ((actor.cooldowns[ability.id] ?? 0) > 0) return false;
    if (this.validTargets(actor, ability).length === 0) return false;
    return true;
  }

  // ---- core resolution ----
  act(actorId: string, abilityId: string, targetId?: string): LogEntry[] {
    const before = this.log.length;
    const actor = this.order.find((c) => c.id === actorId);
    if (!actor || actor.id !== this.currentActor().id) return [];
    const ability = getAbility(abilityId);
    if (!this.abilityUsable(actor, ability)) return [];
    const target = targetId ? this.order.find((c) => c.id === targetId) : undefined;
    this.resolve(actor, ability, target);
    this.afterAction();
    return this.log.slice(before);
  }

  private resolve(actor: Combatant, ability: Ability, primary?: Combatant): void {
    actor.focus -= ability.focusCost;
    if (ability.cooldown > 0) actor.cooldowns[ability.id] = ability.cooldown + 1;
    const targets = this.resolveTargets(actor, ability, primary);

    if (ability.focusCost > 0) {
      this.log.push({ kind: "focus", text: `${actor.name} uses ${ability.name} (−${ability.focusCost} Focus).` });
    } else {
      this.log.push({ kind: "info", text: `${actor.name} uses ${ability.name}.` });
    }

    const isAttack = !!ability.damage;
    const hits = ability.hits ?? 1;

    for (const target of targets) {
      if (ability.revive != null) { this.doRevive(actor, target, ability.revive); continue; }
      if (isAttack) {
        for (let h = 0; h < hits; h++) {
          if (!target.alive) break;
          this.doAttack(actor, ability, target);
        }
      } else if (ability.heal) {
        this.doHeal(actor, ability, target);
      } else if (ability.applyStatus) {
        this.addStatus(target, ability.applyStatus);
        this.log.push({ kind: "status", text: `${target.name} gains ${describeStatus(ability.applyStatus)}.` });
      }
      // status riders on healing/utility (e.g. renewal regen)
      if (!isAttack && ability.heal && ability.applyStatus) {
        this.addStatus(target, ability.applyStatus);
        this.log.push({ kind: "status", text: `${target.name} gains ${describeStatus(ability.applyStatus)}.` });
      }
    }

    if (ability.selfStatus) {
      this.addStatus(actor, ability.selfStatus);
      this.log.push({ kind: "status", text: `${actor.name} gains ${describeStatus(ability.selfStatus)}.` });
    }
  }

  private doAttack(actor: Combatant, ability: Ability, target: Combatant): void {
    const attr = ability.attackAttr ?? "might";
    const bonus = this.attackModInCombat(actor, attr);
    const def = this.defenseInCombat(target);
    const critFrom = 20 - talentCritBonus(actor);
    const ar = attackRoll(bonus, def, this.rng, critFrom);
    const dice = { d20: ar.die, bonus, total: ar.attackTotal, target: def, hit: ar.hit, crit: ar.crit, fumble: ar.fumble };
    if (!ar.hit) {
      this.log.push({ kind: "miss", dice, text: `${actor.name} → ${target.name}: d20 ${ar.die}${fmt(bonus)} = ${ar.attackTotal} vs Def ${def} — ${ar.fumble ? "Fumble!" : "Miss."}` });
      return;
    }
    let dmgRoll = roll(ability.damage!, this.rng).total;
    if (ar.crit) dmgRoll += roll(ability.damage!, this.rng).total; // crit: roll damage dice twice
    let total = dmgRoll + this.damageModInCombat(actor, attr) + (ability.flatDamageBonus ?? 0) + this.traitDamageBonus(actor);
    // elemental resistance / weakness
    const element = ability.element ?? "physical";
    const mult = target.resist?.[element] ?? 1;
    total = Math.round(total * mult);
    // ---- elemental reactions ----
    let reaction = "";
    if (this.hasStatus(target, "chill") && (element === "physical" || element === "ice")) {
      total += Math.max(5, Math.ceil(total * 0.5)); // Shatter a frozen foe
      target.statuses = target.statuses.filter((s) => s.kind !== "chill");
      reaction = " ❄️💥 Shatter!";
    }
    if (this.hasStatus(target, "poison") && element === "fire") {
      const burst = target.statuses.filter((s) => s.kind === "poison").reduce((a, s) => a + s.magnitude * s.turns, 0);
      total += burst; // Ignite the poison for a burst
      target.statuses = target.statuses.filter((s) => s.kind !== "poison");
      reaction = " 🔥💥 Ignite!";
    }
    // guard (Defend) damage reduction
    const guard = this.guardPercent(target);
    if (guard > 0) total = Math.ceil(total * (1 - guard / 100));
    total = Math.max(1, total);
    this.applyDamage(target, total);
    // talent: lifesteal heals the attacker
    const ls = talentLifesteal(actor);
    if (ls > 0 && actor.alive) {
      const healed = Math.min(Math.floor(total * ls), actor.maxHP - actor.hp);
      if (healed > 0) { actor.hp += healed; this.log.push({ kind: "heal", text: `${actor.name} siphons ${healed} HP.` }); }
    }
    const elemNote = mult > 1 ? " Weak!" : mult < 1 ? " Resisted." : "";
    const elemWord = element !== "physical" ? `${element} ` : "";
    this.log.push({
      kind: ar.crit ? "crit" : "damage", dice,
      text: `${actor.name} → ${target.name}: d20 ${ar.die}${fmt(bonus)} = ${ar.attackTotal} vs Def ${def} — ${ar.crit ? "CRIT! " : "Hit! "}${total} ${elemWord}damage.${elemNote}${reaction}${target.alive ? "" : " 💀"}`,
    });
    // counterattack: a defending target strikes back at melee (physical) attackers
    if (target.alive && guard > 0 && element === "physical" && actor !== target) this.counterAttack(target, actor);
    if (target.alive && ability.applyStatus) {
      this.addStatus(target, ability.applyStatus);
      this.log.push({ kind: "status", text: `${target.name} is afflicted: ${describeStatus(ability.applyStatus)}.` });
    }
    if (!target.alive) this.log.push({ kind: "death", text: `💀 ${target.name} is slain!` });
    this.checkPhase(target);
  }

  private guardPercent(c: Combatant): number {
    const g = c.statuses.find((s) => s.kind === "guard");
    return g ? g.magnitude : 0;
  }

  // Lower = a more appealing target. Prefers low-HP foes and avoids countering defenders.
  private aiThreatScore(c: Combatant): number {
    return c.hp + (this.guardPercent(c) > 0 ? 1000 : 0);
  }

  private counterAttack(guarder: Combatant, attacker: Combatant): void {
    if (!guarder.alive || !attacker.alive) return;
    const dmg = Math.max(1, roll("1d6", this.rng).total + damageBonusFor(guarder, "might"));
    this.applyDamage(attacker, dmg);
    this.log.push({ kind: "damage", text: `🛡️ ${guarder.name} counters ${attacker.name} for ${dmg}!${attacker.alive ? "" : " 💀"}` });
    if (!attacker.alive) this.log.push({ kind: "death", text: `💀 ${attacker.name} is slain!` });
    this.checkPhase(attacker);
  }

  // One-time boss phase transition when HP crosses the threshold.
  private checkPhase(enemy: Combatant): void {
    const ph = enemy.phase;
    if (!ph || enemy.isPlayer || !enemy.alive) return;
    if (enemy.combatFlags?.phased) return;
    if (enemy.hp > enemy.maxHP * ph.atHpPercent / 100) return;
    enemy.combatFlags = { ...(enemy.combatFlags ?? {}), phased: true };
    this.log.push({ kind: "info", text: `⚠️ ${ph.message}` });
    if (ph.addAbilities) for (const a of ph.addAbilities) {
      if (!enemy.abilities.includes(a)) enemy.abilities.push(a);
      if (enemy.enemyAI && !enemy.enemyAI.includes(a)) enemy.enemyAI.push(a);
    }
    if (ph.healPercent) {
      const heal = Math.floor(enemy.maxHP * ph.healPercent / 100);
      enemy.hp = Math.min(enemy.maxHP, enemy.hp + heal);
      this.log.push({ kind: "heal", text: `${enemy.name} draws on the Hollowing and recovers ${heal} HP!` });
    }
    if (ph.selfBuff) { this.addStatus(enemy, ph.selfBuff); this.log.push({ kind: "status", text: `${enemy.name} gains ${describeStatus(ph.selfBuff)}.` }); }
  }

  // The Defend action: brace for −50% damage until your next turn, countering melee.
  defend(actorId: string): LogEntry[] {
    const before = this.log.length;
    const actor = this.currentActor();
    if (!actor || actor.id !== actorId) return [];
    actor.statuses = actor.statuses.filter((s) => s.kind !== "guard");
    actor.statuses.push({ kind: "guard", turns: 1, magnitude: 50 });
    this.log.push({ kind: "status", text: `${actor.name} takes a defensive stance (−50% damage, counters melee).` });
    this.afterAction();
    return this.log.slice(before);
  }

  private doHeal(actor: Combatant, ability: Ability, target: Combatant): void {
    if (!target.alive) return;
    const amount = roll(ability.heal!, this.rng).total + spiritMod(actor);
    const healed = Math.min(amount, target.maxHP - target.hp);
    target.hp += healed;
    this.log.push({ kind: "heal", text: `${actor.name} heals ${target.name} for ${healed} HP.` });
  }

  private doRevive(actor: Combatant, target: Combatant, percent: number): void {
    if (target.alive) return;
    target.alive = true;
    target.hp = Math.max(1, Math.floor(target.maxHP * percent / 100));
    target.statuses = [];
    this.log.push({ kind: "heal", text: `✨ ${actor.name} revives ${target.name} at ${target.hp} HP!` });
  }

  // Push a log line (used by the UI for item use, etc.).
  pushLog(text: string, kind: LogKind = "info"): void {
    this.log.push({ text, kind });
  }

  // The UI uses this after an out-of-band action (e.g. using a consumable)
  // to consume the current actor's turn and advance combat.
  endTurnManually(): LogEntry[] {
    const before = this.log.length;
    this.afterAction();
    return this.log.slice(before);
  }

  // Rough average damage of an ability (for AI to pick its best hit).
  private abilityPower(a: Ability): number {
    if (!a.damage) return 0;
    const m = a.damage.match(/^(\d*)d(\d+)([+-]\d+)?$/i);
    if (!m) return 0;
    const count = m[1] === "" ? 1 : parseInt(m[1], 10);
    const sides = parseInt(m[2], 10);
    const flat = m[3] ? parseInt(m[3], 10) : 0;
    return (count * (sides + 1) / 2 + flat) * (a.hits ?? 1);
  }

  // Choose an enemy's action based on its personality.
  private pickEnemyAction(actor: Combatant, usable: Ability[]): { choice: Ability; target?: Combatant } {
    const foes = this.livingFoes(actor);
    const allies = this.livingAllies(actor);
    const ai = actor.ai ?? "default";
    const damaging = usable.filter((a) => a.damage);
    const aoe = damaging.filter((a) => a.target === "all-enemies");
    const single = damaging.filter((a) => a.target === "enemy" || a.target === "any");
    const heals = usable.filter((a) => a.heal);
    const buffs = usable.filter((a) => a.kind === "buff");
    const debuffs = usable.filter((a) => a.applyStatus && a.damage); // damaging + status riders

    const weakestFoe = () => [...foes].sort((a, b) => this.aiThreatScore(a) - this.aiThreatScore(b))[0];
    const casterFoe = () => [...foes].sort((a, b) => a.maxHP - b.maxHP)[0]; // squishiest = likely a caster
    const strongest = (list: Ability[]) => [...list].sort((a, b) => this.abilityPower(b) - this.abilityPower(a))[0];
    const single1 = (c?: Ability): { choice: Ability; target?: Combatant } => ({ choice: c ?? this.rng.pick(single.length ? single : damaging.length ? damaging : usable), target: (c ?? single[0])?.target === "all-enemies" ? undefined : weakestFoe() });

    // support/healer: mend a wounded ally, else buff, else attack
    if (ai === "support") {
      const wounded = [...allies].sort((a, b) => a.hp / a.maxHP - b.hp / b.maxHP)[0];
      if (heals.length && wounded && wounded.hp < wounded.maxHP * 0.7) return { choice: heals[0], target: wounded };
      if (buffs.length && this.rng.chance(0.5)) return { choice: this.rng.pick(buffs), target: actor };
      return single1();
    }
    // self-heal when low regardless of personality
    const selfHeal = heals.find((a) => a.target === "self" && actor.hp < actor.maxHP * 0.4);
    if (selfHeal) return { choice: selfHeal, target: actor };

    if (ai === "aggressive") {
      // always the hardest single hit at the weakest foe
      const best = strongest(single.length ? single : damaging);
      return best ? { choice: best, target: best.target === "all-enemies" ? undefined : weakestFoe() } : single1();
    }
    if (ai === "berserker") {
      // biggest hit available, ignores defenders (pure aggression)
      const best = strongest(damaging.length ? damaging : usable);
      const tgt = best && (best.target === "enemy" || best.target === "any") ? [...foes].sort((a, b) => a.hp - b.hp)[0] : undefined;
      return { choice: best ?? usable[0], target: tgt };
    }
    if (ai === "tactician") {
      // prefer AoE on a group, then debuffs, then strike the caster
      if (aoe.length && foes.length >= 2 && this.rng.chance(0.6)) return { choice: this.rng.pick(aoe) };
      if (debuffs.length && this.rng.chance(0.5)) { const c = this.rng.pick(debuffs); return { choice: c, target: c.target === "all-enemies" ? undefined : casterFoe() }; }
      return single1(strongest(single));
    }
    // default
    if (heals.length && actor.hp < actor.maxHP * 0.5) return { choice: heals[0], target: actor };
    if (aoe.length && foes.length >= 2 && this.rng.chance(0.5)) return { choice: this.rng.pick(aoe) };
    if (single.length) return { choice: this.rng.pick(single), target: weakestFoe() };
    return { choice: damaging.length ? this.rng.pick(damaging) : this.rng.pick(usable) };
  }

  // ---- enemy AI ----
  enemyAct(): LogEntry[] {
    const before = this.log.length;
    const actor = this.currentActor();
    if (!actor || actor.isPlayer || !actor.alive) { return []; }
    const usable = actor.abilities.map(getAbility).filter((a) => this.abilityUsable(actor, a));
    if (usable.length === 0) {
      this.log.push({ kind: "info", text: `${actor.name} hesitates.` });
      this.afterAction();
      return this.log.slice(before);
    }
    const { choice, target } = this.pickEnemyAction(actor, usable);
    this.resolve(actor, choice, target);
    this.afterAction();
    return this.log.slice(before);
  }
}

function fmt(n: number): string { return n >= 0 ? `+${n}` : `${n}`; }

export function describeStatus(s: StatusEffect): string {
  switch (s.kind) {
    case "poison": return `Poison (${s.magnitude}/turn, ${s.turns}t)`;
    case "burn": return `Burn (${s.magnitude}/turn, ${s.turns}t)`;
    case "regen": return `Regen (${s.magnitude}/turn, ${s.turns}t)`;
    case "shield": return `Shield (${s.magnitude})`;
    case "stun": return `Stun (${s.turns}t)`;
    case "weaken": return `Weaken (−${s.magnitude} atk, ${s.turns}t)`;
    case "fortify": return `Fortify (+${s.magnitude} def, ${s.turns}t)`;
    case "rally": return `Rally (+${s.magnitude} atk/dmg, ${s.turns}t)`;
    case "guard": return `Guard (−${s.magnitude}% dmg)`;
    case "chill": return `Chill (−${s.magnitude} atk, ${s.turns}t)`;
  }
}
