import { ChapterConfig } from "./index";

export const CHAPTERS: Record<number, ChapterConfig> = {
  1: {
    id: 1,
    name: "1장 — 농장 탈환",
    description: "존즈와 인간들을 농장에서 몰아내라",
    waves: [
      { enemies: [{ type: "farmhand", count: 5 }], duration: 30 },
      { enemies: [{ type: "farmhand", count: 8 }, { type: "herder", count: 2 }], duration: 30 },
      { enemies: [{ type: "farmhand", count: 6 }, { type: "herder", count: 4 }], duration: 30 },
      { enemies: [{ type: "herder", count: 5 }, { type: "hunter", count: 3 }], duration: 30 },
      { enemies: [{ type: "hunter", count: 6 }, { type: "farmhand", count: 4 }], duration: 30 },
    ],
    boss: "jones",
  },
  2: {
    id: 2,
    name: "2장 — 동물농장 수호",
    description: "인간들의 역습으로부터 농장을 지켜라",
    waves: [
      { enemies: [{ type: "farmhand", count: 8 }], duration: 30 },
      { enemies: [{ type: "hunter", count: 5 }, { type: "farmhand", count: 5 }], duration: 30 },
      { enemies: [{ type: "herder", count: 4 }, { type: "hunter", count: 6 }], duration: 30 },
      { enemies: [{ type: "hunter", count: 8 }, { type: "herder", count: 4 }], duration: 30 },
      { enemies: [{ type: "farmhand", count: 6 }, { type: "hunter", count: 5 }, { type: "herder", count: 3 }], duration: 30 },
      { enemies: [{ type: "hunter", count: 8 }, { type: "herder", count: 5 }], duration: 30 },
      { enemies: [{ type: "hunter", count: 10 }, { type: "herder", count: 6 }], duration: 30 },
    ],
    boss: "frederick_pilkington",
  },
};
