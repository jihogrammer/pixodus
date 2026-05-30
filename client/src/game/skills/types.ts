export type SkillKey = "Q" | "W" | "E" | "R";

export interface SkillProgressionTier {
  level: number;
  requiredXP: number;
  bonus: string;
}

export interface ActiveSkillDef {
  id: string;
  name: string;
  key: SkillKey;
  type: "active";
  description: string;
  baseCooldown: number;
  baseManaCost: number;
  baseDamage: number;
  baseDuration: number;
  baseRange: number;
  progression: SkillProgressionTier[];
}

export interface PassiveSkillDef {
  id: string;
  name: string;
  type: "passive";
  description: string;
  stat: string;
  baseValue: number;
  progression: SkillProgressionTier[];
}

export type SkillDef = ActiveSkillDef | PassiveSkillDef;

export interface SkillState {
  skillId: string;
  proficiencyLevel: number;
  proficiencyXP: number;
  cooldownRemaining: number;
}

export interface ActiveSkillState extends SkillState {
  isReady: boolean;
}

export interface CharacterSkillSet {
  characterId: string;
  Q: string;
  W: string;
  E: string;
  R: string;
  passives: string[];
}

export interface SkillEffect {
  type: "damage" | "heal" | "buff" | "debuff" | "summon" | "aoe" | "dash" | "slow";
  value: number;
  duration?: number;
  target?: "self" | "enemy" | "all_enemies" | "area";
  summonType?: string;
  summonCount?: number;
}
