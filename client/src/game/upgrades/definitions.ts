import { UpgradeDef } from "./types";

export const ALL_UPGRADES: UpgradeDef[] = [
  // offense - common
  {
    id: "atk_1",
    name: "더 세게!",
    description: "공격력 +10%",
    rarity: "common",
    category: "offense",
    effects: [{ stat: "attackDamage", value: 0.1, mode: "multiply" }],
  },
  {
    id: "atk_2",
    name: "갈매기처럼 찌르기",
    description: "공격력 +15%",
    rarity: "common",
    category: "offense",
    effects: [{ stat: "attackDamage", value: 0.15, mode: "multiply" }],
  },
  {
    id: "atk_crit",
    name: "약점 공격",
    description: "치명타 확률 +5%",
    rarity: "common",
    category: "offense",
    effects: [{ stat: "critChance", value: 0.05, mode: "add" }],
  },
  // offense - rare
  {
    id: "atk_3",
    name: "네 발굽의 힘",
    description: "공격력 +25%",
    rarity: "rare",
    category: "offense",
    effects: [{ stat: "attackDamage", value: 0.25, mode: "multiply" }],
  },
  {
    id: "aspd_1",
    name: "발 빠른 채찍질",
    description: "공격 속도 +20%",
    rarity: "rare",
    category: "offense",
    effects: [{ stat: "attackSpeed", value: 0.2, mode: "multiply" }],
  },
  {
    id: "crit_boost",
    name: "핵심을 찔렀어",
    description: "치명타 확률 +10%",
    rarity: "rare",
    category: "offense",
    effects: [{ stat: "critChance", value: 0.1, mode: "add" }],
  },
  // offense - heroic
  {
    id: "atk_heroic",
    name: "동물의 분노",
    description: "공격력 +40%",
    rarity: "heroic",
    category: "offense",
    effects: [{ stat: "attackDamage", value: 0.4, mode: "multiply" }],
  },
  {
    id: "aspd_heroic",
    name: "돼지기의 속도",
    description: "공격 속도 +40%",
    rarity: "heroic",
    category: "offense",
    effects: [{ stat: "attackSpeed", value: 0.4, mode: "multiply" }],
  },
  {
    id: "crit_legend",
    name: "철저한 혁명",
    description: "치명타 확률 +15%, 치명타 배율 +100%",
    rarity: "heroic",
    category: "offense",
    effects: [
      { stat: "critChance", value: 0.15, mode: "add" },
      { stat: "critMultiplier", value: 1.0, mode: "add" },
    ],
  },
  // offense - legendary
  {
    id: "omni_power",
    name: "모든 동물은 평등하다",
    description: "공격력 +60%, 공격 속도 +30%",
    rarity: "legendary",
    category: "offense",
    effects: [
      { stat: "attackDamage", value: 0.6, mode: "multiply" },
      { stat: "attackSpeed", value: 0.3, mode: "multiply" },
    ],
  },
  {
    id: "executioner",
    name: "혁명의 집행자",
    description: "치명타 확률 +20%, 치명타 시 즉시 처형 (HP 20% 이하 적)",
    rarity: "legendary",
    category: "offense",
    effects: [
      { stat: "critChance", value: 0.2, mode: "add" },
      { stat: "critMultiplier", value: 1.5, mode: "add" },
    ],
  },

  // defense - common
  {
    id: "hp_1",
    name: "두꺼운 가죽",
    description: "최대 체력 +15%",
    rarity: "common",
    category: "defense",
    effects: [{ stat: "maxHp", value: 0.15, mode: "multiply" }],
  },
  {
    id: "hp_2",
    name: "튼튼한 발굽",
    description: "최대 체력 +10%",
    rarity: "common",
    category: "defense",
    effects: [{ stat: "maxHp", value: 0.1, mode: "multiply" }],
  },
  {
    id: "hp_regen_1",
    name: "자연 회복",
    description: "초당 HP 재생 +2",
    rarity: "common",
    category: "defense",
    effects: [{ stat: "hpRegen", value: 2, mode: "add" }],
  },
  // defense - rare
  {
    id: "hp_rare",
    name: "코끼리 못지않은",
    description: "최대 체력 +30%",
    rarity: "rare",
    category: "defense",
    effects: [{ stat: "maxHp", value: 0.3, mode: "multiply" }],
  },
  {
    id: "dmg_reduce",
    name: "무감각",
    description: "받는 피해 15% 감소",
    rarity: "rare",
    category: "defense",
    effects: [{ stat: "damageReduction", value: 0.15, mode: "add" }],
  },
  // defense - heroic
  {
    id: "hp_heroic",
    name: "불굴의 의지",
    description: "최대 체력 +50%",
    rarity: "heroic",
    category: "defense",
    effects: [{ stat: "maxHp", value: 0.5, mode: "multiply" }],
  },
  {
    id: "hp_regen_heroic",
    name: "재생의 선물",
    description: "초당 HP 재생 +5, 받는 피해 10% 감소",
    rarity: "heroic",
    category: "defense",
    effects: [
      { stat: "hpRegen", value: 5, mode: "add" },
      { stat: "damageReduction", value: 0.1, mode: "add" },
    ],
  },
  // defense - legendary
  {
    id: "invincible",
    name: "7계명의 가호",
    description: "최대 체력 +80%, 매 웨이브 시작 시 HP 30% 회복",
    rarity: "legendary",
    category: "defense",
    effects: [{ stat: "maxHp", value: 0.8, mode: "multiply" }],
  },
  {
    id: "second_wind",
    name: "혁명은 계속된다",
    description: "치명적인 피해를 받아도 HP 1로 한 번 생존 (전투당 1회)",
    rarity: "legendary",
    category: "defense",
    effects: [{ stat: "maxHp", value: 0.2, mode: "multiply" }],
  },

  // utility - common
  {
    id: "speed_1",
    name: "재빠른 발",
    description: "이동 속도 +10%",
    rarity: "common",
    category: "utility",
    effects: [{ stat: "moveSpeed", value: 0.1, mode: "multiply" }],
  },
  {
    id: "mana_regen_1",
    name: "사념의 샘",
    description: "마나 재생 +20%",
    rarity: "common",
    category: "utility",
    effects: [{ stat: "manaRegen", value: 0.2, mode: "multiply" }],
  },
  // utility - rare
  {
    id: "speed_rare",
    name: "바람과 함께",
    description: "이동 속도 +25%",
    rarity: "rare",
    category: "utility",
    effects: [{ stat: "moveSpeed", value: 0.25, mode: "multiply" }],
  },
  {
    id: "mana_regen_rare",
    name: "지혜의 우물",
    description: "마나 재생 +50%, 최대 마나 +15%",
    rarity: "rare",
    category: "utility",
    effects: [
      { stat: "manaRegen", value: 0.5, mode: "multiply" },
      { stat: "manaRegen", value: 1, mode: "add" },
    ],
  },
  // utility - heroic
  {
    id: "speed_heroic",
    name: "독수리의 날개",
    description: "이동 속도 +40%, 대시 쿨타임 30% 감소",
    rarity: "heroic",
    category: "utility",
    effects: [{ stat: "moveSpeed", value: 0.4, mode: "multiply" }],
  },
  // utility - legendary
  {
    id: "speed_legend",
    name: "사족보행의 달인",
    description: "이동 속도 +60%, 공격 중 이동 속도 감소 없음",
    rarity: "legendary",
    category: "utility",
    effects: [{ stat: "moveSpeed", value: 0.6, mode: "multiply" }],
  },

  // projectile - common
  {
    id: "multi_1",
    name: "이중 사격",
    description: "발사체 +1 (전방)",
    rarity: "common",
    category: "projectile",
    effects: [{ stat: "extraShotsFront", value: 1, mode: "add" }],
  },
  {
    id: "pierce_1",
    name: "관통 사격",
    description: "발사체가 한 번 관통",
    rarity: "common",
    category: "projectile",
    effects: [{ stat: "projectilePierce", value: 1, mode: "add" }],
  },
  // projectile - rare
  {
    id: "multi_rear",
    name: "후방 경계",
    description: "후방 발사체 +1",
    rarity: "rare",
    category: "projectile",
    effects: [{ stat: "extraShotsBack", value: 1, mode: "add" }],
  },
  {
    id: "multi_diag",
    name: "사각 공격",
    description: "대각선 발사체 +2",
    rarity: "rare",
    category: "projectile",
    effects: [{ stat: "extraShotsDiagonal", value: 2, mode: "add" }],
  },
  {
    id: "multi_front_2",
    name: "부채꼴 사격",
    description: "전방 발사체 +2",
    rarity: "rare",
    category: "projectile",
    effects: [{ stat: "extraShotsFront", value: 2, mode: "add" }],
  },
  {
    id: "pierce_2",
    name: "목표까지 직진",
    description: "발사체가 두 번 관통, 발사체 속도 +20%",
    rarity: "rare",
    category: "projectile",
    effects: [
      { stat: "projectilePierce", value: 2, mode: "add" },
      { stat: "projectileSpeed", value: 0.2, mode: "multiply" },
    ],
  },
  // projectile - heroic
  {
    id: "aoe_heroic",
    name: "폭발성 산탄",
    description: "적중 시 주변 적에게 30% 피해 (범위 60px)",
    rarity: "heroic",
    category: "projectile",
    effects: [{ stat: "aoeRadius", value: 60, mode: "add" }],
  },
  {
    id: "multi_heroic",
    name: "전방위 사격",
    description: "전방 +3, 후방 +2 발사체",
    rarity: "heroic",
    category: "projectile",
    effects: [
      { stat: "extraShotsFront", value: 3, mode: "add" },
      { stat: "extraShotsBack", value: 2, mode: "add" },
    ],
  },
  // projectile - legendary
  {
    id: "pierce_legend",
    name: "모든 것을 꿰뚫어라",
    description: "발사체 무제한 관통, 피해량 +20%감소마다 1회 남음",
    rarity: "legendary",
    category: "projectile",
    effects: [
      { stat: "projectilePierce", value: 5, mode: "add" },
      { stat: "attackDamage", value: -0.15, mode: "multiply" },
    ],
  },
  {
    id: "orbital",
    name: "공전하는 혁명",
    description: "자신 주변을 공전하는 발사체 2개 생성",
    rarity: "legendary",
    category: "projectile",
    effects: [{ stat: "extraShotsFront", value: 2, mode: "add" }],
  },
];

// synergy upgrades
export const SYNERGY_UPGRADES: UpgradeDef[] = [
  {
    id: "omni_shot",
    name: "전방위 혁명",
    description: "모든 방향으로 발사! 모든 추가 사격 +3",
    rarity: "legendary",
    category: "projectile",
    isSynergy: true,
    requiredSynergies: ["extraShotsFront", "extraShotsBack", "extraShotsDiagonal"],
    effects: [
      { stat: "extraShotsFront", value: 3, mode: "add" },
      { stat: "extraShotsBack", value: 3, mode: "add" },
      { stat: "extraShotsDiagonal", value: 3, mode: "add" },
    ],
  },
];
