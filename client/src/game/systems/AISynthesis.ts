export interface SynthesisContext {
  characterId: string;
  characterName: string;
  chapterId: number;
  chapterName: string;
  wave: number;
  score: number;
  skillProficiencies: { skillId: string; skillName: string; level: number }[];
  worldState: {
    unlockedChapters: number[];
    unlockedCharacters: string[];
    totalPlayCount: number;
    totalKills: number;
  };
  ideaFragments: number;
}

export interface SynthesisResult {
  type: "weapon" | "artifact" | "buff" | "ending_fragment" | "character_skin";
  name: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  effects: string[];
}

export class AISynthesis {
  private static SYNTHESIS_COST = 100;

  static canSynthesize(ideaFragments: number): boolean {
    return ideaFragments >= this.SYNTHESIS_COST;
  }

  static async synthesize(context: SynthesisContext): Promise<SynthesisResult | null> {
    if (!this.canSynthesize(context.ideaFragments)) return null;

    // AI 합성을 시뮬레이션: 캐릭터·챕터·숙련도를 종합해 결과 생성
    return this.mockSynthesis(context);
  }

  private static mockSynthesis(ctx: SynthesisContext): SynthesisResult {
    const { characterId, chapterId, skillProficiencies } = ctx;

    const totalProficiency = skillProficiencies.reduce((sum, s) => sum + s.level, 0);
    const avgProficiency = skillProficiencies.length > 0 ? totalProficiency / skillProficiencies.length : 1;

    let rarity: SynthesisResult["rarity"] = "common";
    if (avgProficiency >= 5) rarity = "legendary";
    else if (avgProficiency >= 4) rarity = "epic";
    else if (avgProficiency >= 3) rarity = "rare";

    const charPrefix = characterId.slice(0, 4).toUpperCase();
    const chapterSuffix = chapterId > 3 ? "종언" : `제${chapterId}장`;

    if (characterId === "napoleon" && chapterId === 3) {
      return {
        type: "ending_fragment",
        name: "독재자의 유언",
        description: "권력의 정점에서 나폴레옹은 마침내 깨달았다. 모든 동물은 평등하다.",
        rarity: "legendary",
        effects: ["진엔딩 단서 #1", "나폴레옹의 진심", "피그 엑소더스 루트 해금"],
      };
    }

    const results: SynthesisResult[] = [
      {
        type: "weapon",
        name: `${charPrefix}-${chapterSuffix}의 창`,
        description: `숙련도 평균 ${avgProficiency.toFixed(1)}레벨의 기운이 깃든 무기.`,
        rarity,
        effects: ["공격력 +15%", "적 처치 시 5% 확률로 이데아의 조각 추가 획득"],
      },
      {
        type: "artifact",
        name: "망각의 건초더미",
        description: "이 건초 속에는 모든 동물농장의 진실이 숨겨져 있다.",
        rarity,
        effects: ["받는 피해 10% 감소", "전투 시작 시 보호막"],
      },
      {
        type: "buff",
        name: "메이저의 축복",
        description: "늙은 멧돼지의 영혼이 잠시나마 함께 싸운다.",
        rarity,
        effects: ["3웨이브 동안 모든 능력치 20% 증가"],
      },
      {
        type: "ending_fragment",
        name: "찢어진 7계명 조각",
        description: '"모든 동물은 평등하다. 그러나 어떤 동물은..." 그 뒤는 찢겨 있다.',
        rarity: "epic",
        effects: ["진엔딩 단서 #2", "숨겨진 기록"],
      },
    ];

    return results[Math.floor(Math.random() * results.length)];
  }
}

export interface IdeaFragmentState {
  balance: number;
  totalEarned: number;
}

const IDEA_KEY = "pixodus_idea_fragments";

export function loadIdeaFragments(): IdeaFragmentState {
  if (typeof window === "undefined") return { balance: 0, totalEarned: 0 };
  try {
    const raw = localStorage.getItem(IDEA_KEY);
    return raw ? JSON.parse(raw) : { balance: 0, totalEarned: 0 };
  } catch {
    return { balance: 0, totalEarned: 0 };
  }
}

export function earnIdeaFragments(amount: number): IdeaFragmentState {
  const current = loadIdeaFragments();
  current.balance += amount;
  current.totalEarned += amount;
  localStorage.setItem(IDEA_KEY, JSON.stringify(current));
  return current;
}

export function spendIdeaFragments(amount: number): IdeaFragmentState | null {
  const current = loadIdeaFragments();
  if (current.balance < amount) return null;
  current.balance -= amount;
  localStorage.setItem(IDEA_KEY, JSON.stringify(current));
  return current;
}
