import { eventBus } from "../EventBus";
import { SkillState, ActiveSkillDef, PassiveSkillDef, SkillKey, SkillEffect } from "./types";
import {
  ACTIVE_SKILLS,
  PASSIVE_SKILLS,
  CHARACTER_SKILL_SETS,
  getActiveSkillById,
  getPassiveSkillById,
  getSkillSet,
} from "./definitions";

export class SkillManager {
  characterId: string;
  activeSkills: Map<SkillKey, SkillState> = new Map();
  passiveSkills: Map<string, SkillState> = new Map();

  private lastUpdateTime = 0;

  constructor(characterId: string) {
    this.characterId = characterId;
    this.loadProficiencies();
    this.initSkills();
  }

  private initSkills(): void {
    const set = getSkillSet(this.characterId);
    if (!set) return;

    const keys: SkillKey[] = ["Q", "W", "E", "R"];
    for (const key of keys) {
      const skillId = set[key];
      if (!this.activeSkills.has(key)) {
        this.activeSkills.set(key, {
          skillId,
          proficiencyLevel: this.getSavedLevel(skillId),
          proficiencyXP: this.getSavedXP(skillId),
          cooldownRemaining: 0,
        });
      }
    }

    for (const passiveId of set.passives) {
      if (!this.passiveSkills.has(passiveId)) {
        this.passiveSkills.set(passiveId, {
          skillId: passiveId,
          proficiencyLevel: this.getSavedLevel(passiveId),
          proficiencyXP: this.getSavedXP(passiveId),
          cooldownRemaining: 0,
        });
      }
    }
  }

  update(delta: number, time: number): void {
    if (this.lastUpdateTime === 0) {
      this.lastUpdateTime = time;
      return;
    }

    const realDelta = time - this.lastUpdateTime;
    this.lastUpdateTime = time;

    for (const [key, state] of this.activeSkills) {
      if (state.cooldownRemaining > 0) {
        state.cooldownRemaining = Math.max(0, state.cooldownRemaining - realDelta);
        if (state.cooldownRemaining === 0) {
          eventBus.emit("skill-ready", key);
        }
      }
    }
  }

  tryUseSkill(key: SkillKey): SkillEffect | null {
    const state = this.activeSkills.get(key);
    if (!state) return null;
    if (state.cooldownRemaining > 0) return null;

    const def = getActiveSkillById(state.skillId);
    if (!def) return null;

    const level = state.proficiencyLevel;
    const tier = def.progression[level - 1] ?? def.progression[def.progression.length - 1];

    const cooldownReduction = level >= 3 ? 0.15 : 0;
    const baseCd = def.baseCooldown * (1 - cooldownReduction);

    state.cooldownRemaining = baseCd;

    const damageMultiplier = 1 + (level - 1) * 0.2;
    const effect: SkillEffect = this.buildEffect(def, damageMultiplier, level);

    this.gainProficiency(state.skillId, 10 + level * 5);

    eventBus.emit("skill-used", { key, skillId: state.skillId, level, effect });

    return effect;
  }

  private buildEffect(def: ActiveSkillDef, multiplier: number, level: number): SkillEffect {
    const effectMap: Record<string, SkillEffect["type"]> = {
      benjamin_dash: "dash",
      benjamin_insight: "buff",
      benjamin_sarcasm: "slow",
      benjamin_awakening: "buff",
      boxer_charge: "dash",
      boxer_endure: "buff",
      boxer_earthquake: "aoe",
      boxer_workharder: "buff",
      napoleon_dogs: "summon",
      napoleon_propaganda: "debuff",
      napoleon_backstab: "damage",
      napoleon_commandments: "aoe",
    };

    return {
      type: effectMap[def.id] ?? "damage",
      value: def.baseDamage * multiplier,
      duration: def.baseDuration * (level >= 4 ? 1.3 : 1),
      target: def.id.includes("commandments") || def.id.includes("earthquake") ? "all_enemies" : "enemy",
      summonCount: def.id.includes("dogs") ? 2 + level - 1 : undefined,
      summonType: def.id.includes("dogs") ? "dog" : def.id.includes("awakening") ? "awakening" : undefined,
    };
  }

  getSkillCooldown(key: SkillKey): number {
    return this.activeSkills.get(key)?.cooldownRemaining ?? 0;
  }

  getSkillTotalCooldown(key: SkillKey): number {
    const state = this.activeSkills.get(key);
    if (!state) return 1;
    const def = getActiveSkillById(state.skillId);
    return def?.baseCooldown ?? 1;
  }

  isSkillReady(key: SkillKey): boolean {
    return this.getSkillCooldown(key) === 0;
  }

  getPassiveBonuses(): Record<string, number> {
    const bonuses: Record<string, number> = {};
    for (const [id, state] of this.passiveSkills) {
      const def = getPassiveSkillById(id);
      if (!def) continue;
      const level = state.proficiencyLevel;
      bonuses[def.stat] = def.baseValue * (1 + (level - 1) * 0.3);
    }
    return bonuses;
  }

  getActiveSkillDef(key: SkillKey) {
    const state = this.activeSkills.get(key);
    if (!state) return null;
    return getActiveSkillById(state.skillId);
  }

  private gainProficiency(skillId: string, xp: number): void {
    for (const [, state] of this.activeSkills) {
      if (state.skillId === skillId) {
        this.addXP(state, xp);
        break;
      }
    }
    for (const [id, state] of this.passiveSkills) {
      if (id === skillId) {
        this.addXP(state, xp);
        break;
      }
    }
  }

  private addXP(state: SkillState, xp: number): void {
    const def = getActiveSkillById(state.skillId) ?? getPassiveSkillById(state.skillId);
    if (!def) return;

    state.proficiencyXP += xp;
    const tier = def.progression[state.proficiencyLevel];
    if (tier && state.proficiencyXP >= tier.requiredXP && state.proficiencyLevel < def.progression.length) {
      state.proficiencyLevel++;
      state.proficiencyXP = 0;
      eventBus.emit("skill-levelup", { skillId: state.skillId, newLevel: state.proficiencyLevel });
    }
    this.saveProficiencies();
  }

  private SAVE_KEY = "pixodus_skill_proficiencies";

  private loadProficiencies(): void {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        this.savedLevels = data.levels ?? {};
        this.savedXP = data.xp ?? {};
      }
    } catch {
      // ignore
    }
  }

  private savedLevels: Record<string, number> = {};
  private savedXP: Record<string, number> = {};

  private getSavedLevel(skillId: string): number {
    return this.savedLevels[skillId] ?? 1;
  }

  private getSavedXP(skillId: string): number {
    return this.savedXP[skillId] ?? 0;
  }

  private saveProficiencies(): void {
    if (typeof window === "undefined") return;
    const levels: Record<string, number> = {};
    const xp: Record<string, number> = {};

    for (const [, state] of this.activeSkills) {
      levels[state.skillId] = state.proficiencyLevel;
      xp[state.skillId] = state.proficiencyXP;
    }
    for (const [id, state] of this.passiveSkills) {
      levels[id] = state.proficiencyLevel;
      xp[id] = state.proficiencyXP;
    }

    this.savedLevels = levels;
    this.savedXP = xp;
    localStorage.setItem(this.SAVE_KEY, JSON.stringify({ levels, xp }));
  }
}
