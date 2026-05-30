export interface PlayerState {
  health: number;
  maxHealth: number;
  speed: number;
  attack: number;
  attackSpeed: number;
  level: number;
  exp: number;
  expToNext: number;
}

export interface EnemyConfig {
  type: string;
  health: number;
  speed: number;
  damage: number;
  exp: number;
}

export interface WaveConfig {
  enemies: { type: string; count: number }[];
  duration: number;
}

export interface ChapterConfig {
  id: number;
  name: string;
  description: string;
  waves: WaveConfig[];
  boss: string;
}

export type GameEvent =
  | "game-start"
  | "game-over"
  | "game-pause"
  | "game-resume"
  | "wave-start"
  | "wave-end"
  | "player-damage"
  | "player-death"
  | "enemy-killed"
  | "upgrade-select"
  | "chapter-complete"
  | "skill-used"
  | "skill-ready"
  | "skill-levelup"
  | "skill-cooldowns"
  | "idea-fragments";
