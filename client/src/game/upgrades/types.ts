export type UpgradeRarity = "common" | "rare" | "heroic" | "legendary";

export type UpgradeCategory = "offense" | "defense" | "utility" | "projectile";

export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  rarity: UpgradeRarity;
  category: UpgradeCategory;
  effects: UpgradeEffect[];
  requiredSynergies?: string[];
  isSynergy?: boolean;
}

export interface UpgradeEffect {
  stat: UpgradeStat;
  value: number;
  mode: "add" | "multiply";
}

export type UpgradeStat =
  | "attackDamage"
  | "attackSpeed"
  | "projectileSpeed"
  | "projectileCount"
  | "projectilePierce"
  | "maxHp"
  | "hpRegen"
  | "moveSpeed"
  | "manaRegen"
  | "damageReduction"
  | "extraShotsFront"
  | "extraShotsBack"
  | "extraShotsDiagonal"
  | "critChance"
  | "critMultiplier"
  | "aoeRadius";

export interface SelectedUpgrade {
  def: UpgradeDef;
  selectedAt: number;
}

export interface UpgradeBonus {
  attackDamage: number;
  attackSpeed: number;
  projectileSpeed: number;
  projectileCount: number;
  projectilePierce: number;
  maxHp: number;
  hpRegen: number;
  moveSpeed: number;
  manaRegen: number;
  damageReduction: number;
  extraShotsFront: number;
  extraShotsBack: number;
  extraShotsDiagonal: number;
  critChance: number;
  critMultiplier: number;
}

export const EMPTY_BONUS: UpgradeBonus = {
  attackDamage: 1,
  attackSpeed: 1,
  projectileSpeed: 1,
  projectileCount: 1,
  projectilePierce: 0,
  maxHp: 1,
  hpRegen: 0,
  moveSpeed: 1,
  manaRegen: 1,
  damageReduction: 0,
  extraShotsFront: 0,
  extraShotsBack: 0,
  extraShotsDiagonal: 0,
  critChance: 0,
  critMultiplier: 1.5,
};

export const RARITY_WEIGHTS: Record<UpgradeRarity, number> = {
  common: 60,
  rare: 25,
  heroic: 10,
  legendary: 5,
};

export const RARITY_COLORS: Record<UpgradeRarity, string> = {
  common: "#aaaaaa",
  rare: "#4a90d9",
  heroic: "#9932cc",
  legendary: "#ffaa00",
};
