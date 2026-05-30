const SAVE_KEY = "pixodus_save";

export interface SaveData {
  unlockedChapters: number[];
  unlockedCharacters: string[];
  chapterRanks: Record<number, "S" | "A" | "B" | "C">;
  playCount: number;
  totalKills: number;
}

const DEFAULT_SAVE: SaveData = {
  unlockedChapters: [1],
  unlockedCharacters: ["benjamin", "boxer", "napoleon"],
  chapterRanks: {},
  playCount: 0,
  totalKills: 0,
};

export function loadSave(): SaveData {
  if (typeof window === "undefined") return DEFAULT_SAVE;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    return { ...DEFAULT_SAVE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function writeSave(data: Partial<SaveData>): void {
  if (typeof window === "undefined") return;
  const current = loadSave();
  const merged = { ...current, ...data };
  localStorage.setItem(SAVE_KEY, JSON.stringify(merged));
}

export function resetSave(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SAVE_KEY);
}
