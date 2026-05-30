import { ActiveSkillDef, PassiveSkillDef, CharacterSkillSet, SkillProgressionTier } from "./types";

const COMMON_PROGRESSION: SkillProgressionTier[] = [
  { level: 1, requiredXP: 0, bonus: "기본 효과" },
  { level: 2, requiredXP: 50, bonus: "위력 20% 증가" },
  { level: 3, requiredXP: 150, bonus: "쿨타임 15% 감소" },
  { level: 4, requiredXP: 350, bonus: "범위 20% 증가" },
  { level: 5, requiredXP: 700, bonus: "추가 효과 해금" },
  { level: 6, requiredXP: 1200, bonus: "위력 30% 증가 + 특수 효과" },
];

export const ACTIVE_SKILLS: Record<string, ActiveSkillDef> = {
  // ============================================================
  // BENJAMIN — 당나귀, 냉소적 관찰자
  // ============================================================
  benjamin_dash: {
    id: "benjamin_dash",
    name: "회피 기동",
    key: "Q",
    type: "active",
    description: "짧은 거리를 즉시 이동하며 적과 충돌하지 않는다. 벤자민은 누구보다 상황을 빨리 파악한다.",
    baseCooldown: 4000,
    baseManaCost: 15,
    baseDamage: 0,
    baseDuration: 200,
    baseRange: 80,
    progression: [
      { level: 1, requiredXP: 0, bonus: "기본 대시" },
      { level: 2, requiredXP: 40, bonus: "거리 20% 증가" },
      { level: 3, requiredXP: 120, bonus: "쿨타임 1초 감소" },
      { level: 4, requiredXP: 300, bonus: "대시 후 1초간 무적" },
      { level: 5, requiredXP: 600, bonus: "통과한 적에게 데미지 + 둔화" },
    ],
  },
  benjamin_insight: {
    id: "benjamin_insight",
    name: "통찰",
    key: "W",
    type: "active",
    description: "모든 적의 공격 선딜레이를 표시하고 잠시 치명타율이 증가한다.",
    baseCooldown: 12000,
    baseManaCost: 25,
    baseDamage: 0,
    baseDuration: 5000,
    baseRange: 0,
    progression: [
      { level: 1, requiredXP: 0, bonus: "지속 5초, 치명타율 +15%" },
      { level: 2, requiredXP: 60, bonus: "치명타율 +25%" },
      { level: 3, requiredXP: 180, bonus: "지속 8초" },
      { level: 4, requiredXP: 400, bonus: "적 방어력 30% 무시" },
      { level: 5, requiredXP: 800, bonus: "지속시간 동안 적 처치 시 체력 회복" },
    ],
  },
  benjamin_sarcasm: {
    id: "benjamin_sarcasm",
    name: "냉소",
    key: "E",
    type: "active",
    description: "주변 적들을 조롱하여 이동속도와 공격력을 감소시킨다.",
    baseCooldown: 10000,
    baseManaCost: 20,
    baseDamage: 0,
    baseDuration: 4000,
    baseRange: 120,
    progression: [
      { level: 1, requiredXP: 0, bonus: "이속 -30%, 공격력 -15%" },
      { level: 2, requiredXP: 50, bonus: "이속 -40%, 공격력 -25%" },
      { level: 3, requiredXP: 160, bonus: "범위 30% 증가" },
      { level: 4, requiredXP: 350, bonus: "영향받은 적이 받는 피해 20% 증가" },
      { level: 5, requiredXP: 750, bonus: "지속시간 종료 시 2초 스턴" },
    ],
  },
  benjamin_awakening: {
    id: "benjamin_awakening",
    name: "마지막 통찰",
    key: "R",
    type: "active",
    description: "시간을 느리게 만들고 공격속도가 폭발적으로 증가한다. 벤자민은 이미 결말을 알고 있다.",
    baseCooldown: 30000,
    baseManaCost: 50,
    baseDamage: 0,
    baseDuration: 5000,
    baseRange: 0,
    progression: [
      { level: 1, requiredXP: 0, bonus: "시간 50% 느려짐, 공속 2배" },
      { level: 2, requiredXP: 100, bonus: "공속 3배" },
      { level: 3, requiredXP: 300, bonus: "지속 7초" },
      { level: 4, requiredXP: 700, bonus: "발사체 관통 추가" },
      { level: 5, requiredXP: 1400, bonus: "지속 중 모든 적에게 치명타" },
    ],
  },

  // ============================================================
  // BOXER — 말, 충직한 노동자
  // ============================================================
  boxer_charge: {
    id: "boxer_charge",
    name: "돌진",
    key: "Q",
    type: "active",
    description: "전방으로 돌진하며 경로상의 적들에게 피해를 주고 밀쳐낸다.",
    baseCooldown: 5000,
    baseManaCost: 15,
    baseDamage: 25,
    baseDuration: 300,
    baseRange: 120,
    progression: [
      { level: 1, requiredXP: 0, bonus: "기본 피해 + 밀침" },
      { level: 2, requiredXP: 50, bonus: "피해 30% 증가" },
      { level: 3, requiredXP: 150, bonus: "밀침 거리 50% 증가" },
      { level: 4, requiredXP: 350, bonus: "돌진 종료 지점에 충격파" },
      { level: 5, requiredXP: 700, bonus: "적 벽에 충돌 시 추가 피해" },
    ],
  },
  boxer_endure: {
    id: "boxer_endure",
    name: "인내",
    key: "W",
    type: "active",
    description: "피해 감소 상태가 되어 전방에서 버틴다. 박서는 절대 물러서지 않는다.",
    baseCooldown: 15000,
    baseManaCost: 20,
    baseDamage: 0,
    baseDuration: 6000,
    baseRange: 0,
    progression: [
      { level: 1, requiredXP: 0, bonus: "피해 감소 40%" },
      { level: 2, requiredXP: 60, bonus: "피해 감소 55%" },
      { level: 3, requiredXP: 180, bonus: "지속 중 HP 회복" },
      { level: 4, requiredXP: 400, bonus: "받은 피해의 30% 반사" },
      { level: 5, requiredXP: 800, bonus: "지속 중 받는 CC 무시" },
    ],
  },
  boxer_earthquake: {
    id: "boxer_earthquake",
    name: "지진",
    key: "E",
    type: "active",
    description: "발을 구르며 주변에 강력한 충격파를 일으킨다.",
    baseCooldown: 8000,
    baseManaCost: 25,
    baseDamage: 40,
    baseDuration: 100,
    baseRange: 100,
    progression: [
      { level: 1, requiredXP: 0, bonus: "기본 범위 피해" },
      { level: 2, requiredXP: 50, bonus: "피해 25% 증가" },
      { level: 3, requiredXP: 160, bonus: "범위 30% 증가" },
      { level: 4, requiredXP: 360, bonus: "적 1초 스턴" },
      { level: 5, requiredXP: 750, bonus: "2회 연속 충격파" },
    ],
  },
  boxer_workharder: {
    id: "boxer_workharder",
    name: "더 열심히 일하겠습니다",
    key: "R",
    type: "active",
    description: "극한의 힘을 발휘한다. 지속시간 후 반동으로 잠시 약해진다.",
    baseCooldown: 25000,
    baseManaCost: 45,
    baseDamage: 0,
    baseDuration: 8000,
    baseRange: 0,
    progression: [
      { level: 1, requiredXP: 0, bonus: "공격력 +50%, 이속 +30%" },
      { level: 2, requiredXP: 100, bonus: "공격력 +80%, 이속 +40%" },
      { level: 3, requiredXP: 300, bonus: "지속 중 매초 HP 5% 회복" },
      { level: 4, requiredXP: 700, bonus: "반동 페널티 50% 감소" },
      { level: 5, requiredXP: 1400, bonus: "지속 중 사망 시 1회 부활" },
    ],
  },

  // ============================================================
  // NAPOLEON — 돼지, 독재자
  // ============================================================
  napoleon_dogs: {
    id: "napoleon_dogs",
    name: "비밀경찰 소환",
    key: "Q",
    type: "active",
    description: "충성스러운 개들을 소환하여 적을 공격하게 한다.",
    baseCooldown: 8000,
    baseManaCost: 20,
    baseDamage: 15,
    baseDuration: 6000,
    baseRange: 60,
    progression: [
      { level: 1, requiredXP: 0, bonus: "개 2마리 소환" },
      { level: 2, requiredXP: 50, bonus: "개 3마리 소환" },
      { level: 3, requiredXP: 160, bonus: "개 지속시간 2초 증가" },
      { level: 4, requiredXP: 360, bonus: "개 공격력 40% 증가" },
      { level: 5, requiredXP: 750, bonus: "개들이 적 처치 시 새로 소환" },
    ],
  },
  napoleon_propaganda: {
    id: "napoleon_propaganda",
    name: "선전",
    key: "W",
    type: "active",
    description: "일부 적을 세뇌하여 일시적으로 아군으로 만든다.",
    baseCooldown: 18000,
    baseManaCost: 30,
    baseDamage: 0,
    baseDuration: 5000,
    baseRange: 130,
    progression: [
      { level: 1, requiredXP: 0, bonus: "가장 가까운 적 1명 포섭" },
      { level: 2, requiredXP: 70, bonus: "2명 포섭" },
      { level: 3, requiredXP: 200, bonus: "지속 7초" },
      { level: 4, requiredXP: 450, bonus: "포섭된 적이 사망 시 폭발" },
      { level: 5, requiredXP: 900, bonus: "보스도 3초간 포섭 가능" },
    ],
  },
  napoleon_backstab: {
    id: "napoleon_backstab",
    name: "배후 찌르기",
    key: "E",
    type: "active",
    description: "가장 가까운 적의 뒤로 순간이동하여 강력한 일격을 가한다.",
    baseCooldown: 7000,
    baseManaCost: 20,
    baseDamage: 60,
    baseDuration: 100,
    baseRange: 150,
    progression: [
      { level: 1, requiredXP: 0, bonus: "기본 순간이동 + 피해" },
      { level: 2, requiredXP: 50, bonus: "피해 40% 증가" },
      { level: 3, requiredXP: 150, bonus: "2명의 적에게 연속 사용" },
      { level: 4, requiredXP: 350, bonus: "사용 후 1초 무적" },
      { level: 5, requiredXP: 700, bonus: "대상이 사망 시 쿨타임 초기화" },
    ],
  },
  napoleon_commandments: {
    id: "napoleon_commandments",
    name: "7계명 선포",
    key: "R",
    type: "active",
    description: "현장의 적 수에 비례하여 맵 전체에 피해를 입힌다.",
    baseCooldown: 35000,
    baseManaCost: 55,
    baseDamage: 10,
    baseDuration: 500,
    baseRange: 99999,
    progression: [
      { level: 1, requiredXP: 0, bonus: "적 1명당 피해 10" },
      { level: 2, requiredXP: 100, bonus: "적 1명당 피해 15" },
      { level: 3, requiredXP: 300, bonus: "피해를 입은 적 둔화" },
      { level: 4, requiredXP: 700, bonus: "처치된 적 폭발" },
      { level: 5, requiredXP: 1400, bonus: "쿨타임 10초 감소 + 생존 적 공포" },
    ],
  },
};

export const PASSIVE_SKILLS: Record<string, PassiveSkillDef> = {
  benjamin_reader: {
    id: "benjamin_reader",
    name: "읽을 줄 아는 자",
    type: "passive",
    description: "적의 체력바가 항상 표시되고, 적 처치 경험치가 증가한다.",
    stat: "exp_bonus",
    baseValue: 20,
    progression: [
      { level: 1, requiredXP: 0, bonus: "EXP +20%, HP바 표시" },
      { level: 2, requiredXP: 80, bonus: "EXP +35%" },
      { level: 3, requiredXP: 250, bonus: "EXP +50%, 적 약점 표시" },
      { level: 4, requiredXP: 550, bonus: "EXP +70%, 보물상자 탐지" },
      { level: 5, requiredXP: 1100, bonus: "EXP +100%, 다음 웨이브 미리보기" },
    ],
  },
  boxer_sturdy: {
    id: "boxer_sturdy",
    name: "강인한 육체",
    type: "passive",
    description: "최대 체력이 증가하고 일정 시간마다 체력이 회복된다.",
    stat: "max_hp",
    baseValue: 30,
    progression: [
      { level: 1, requiredXP: 0, bonus: "HP +30%, 5초당 HP 1% 회복" },
      { level: 2, requiredXP: 80, bonus: "HP +45%, 회복량 2%" },
      { level: 3, requiredXP: 250, bonus: "HP +60%, 3초당 회복" },
      { level: 4, requiredXP: 550, bonus: "HP +80%, 치명적 피해 시 1회 생존" },
      { level: 5, requiredXP: 1100, bonus: "HP +100%, 회복량 5%" },
    ],
  },
  napoleon_tasteofpower: {
    id: "napoleon_tasteofpower",
    name: "권력의 맛",
    type: "passive",
    description: "적을 처치할 때마다 공격력이 중첩 증가한다.",
    stat: "attack_stack",
    baseValue: 3,
    progression: [
      { level: 1, requiredXP: 0, bonus: "처치당 공격력 +3 (최대 10중첩)" },
      { level: 2, requiredXP: 80, bonus: "처치당 공격력 +5 (최대 15중첩)" },
      { level: 3, requiredXP: 250, bonus: "처치당 공격력 +7 (최대 20중첩)" },
      { level: 4, requiredXP: 550, bonus: "중첩당 이속 +1% 추가" },
      { level: 5, requiredXP: 1100, bonus: "처치당 공격력 +10 (최대 30중첩, 중첩 유지시간 2배)" },
    ],
  },
};

export const CHARACTER_SKILL_SETS: Record<string, CharacterSkillSet> = {
  benjamin: {
    characterId: "benjamin",
    Q: "benjamin_dash",
    W: "benjamin_insight",
    E: "benjamin_sarcasm",
    R: "benjamin_awakening",
    passives: ["benjamin_reader"],
  },
  boxer: {
    characterId: "boxer",
    Q: "boxer_charge",
    W: "boxer_endure",
    E: "boxer_earthquake",
    R: "boxer_workharder",
    passives: ["boxer_sturdy"],
  },
  napoleon: {
    characterId: "napoleon",
    Q: "napoleon_dogs",
    W: "napoleon_propaganda",
    E: "napoleon_backstab",
    R: "napoleon_commandments",
    passives: ["napoleon_tasteofpower"],
  },
};

export function getActiveSkillById(id: string): ActiveSkillDef | undefined {
  return ACTIVE_SKILLS[id];
}

export function getPassiveSkillById(id: string): PassiveSkillDef | undefined {
  return PASSIVE_SKILLS[id];
}

export function getSkillSet(characterId: string): CharacterSkillSet | undefined {
  return CHARACTER_SKILL_SETS[characterId];
}
