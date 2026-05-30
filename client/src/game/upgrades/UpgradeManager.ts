import { ALL_UPGRADES, SYNERGY_UPGRADES } from "./definitions";
import {
  EMPTY_BONUS,
  RARITY_WEIGHTS,
  SelectedUpgrade,
  UpgradeBonus,
  UpgradeDef,
  UpgradeRarity,
  UpgradeStat,
} from "./types";

function weightedRandomRarity(): UpgradeRarity {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    r -= weight;
    if (r <= 0) return rarity as UpgradeRarity;
  }
  return "common";
}

export class UpgradeManager {
  private selected: SelectedUpgrade[] = [];

  get count(): number {
    return this.selected.length;
  }

  get all(): SelectedUpgrade[] {
    return [...this.selected];
  }

  hasUpgrade(id: string): boolean {
    return this.selected.some((u) => u.def.id === id);
  }

  selectUpgrade(def: UpgradeDef): void {
    if (this.hasUpgrade(def.id)) return;
    this.selected.push({ def, selectedAt: Date.now() });
  }

  getBonuses(): UpgradeBonus {
    const bonus = { ...EMPTY_BONUS, critMultiplier: EMPTY_BONUS.critMultiplier };
    for (const upgrade of this.selected) {
      for (const effect of upgrade.def.effects) {
        const current = bonus[effect.stat as keyof UpgradeBonus];
        if (effect.mode === "add") {
          (bonus as Record<string, number>)[effect.stat] = current + effect.value;
        } else {
          (bonus as Record<string, number>)[effect.stat] = current * (1 + effect.value);
        }
      }
    }
    return bonus;
  }

  getSelectedIds(): string[] {
    return this.selected.map((u) => u.def.id);
  }

  hasStatBonus(stat: UpgradeStat): boolean {
    return this.selected.some((u) =>
      u.def.effects.some((e) => e.stat === stat)
    );
  }

  getAvailableSynergy(): UpgradeDef | null {
    const activeSynergies = this.getSelectedIds();
    for (const synergy of SYNERGY_UPGRADES) {
      if (activeSynergies.includes(synergy.id)) continue;
      if (!synergy.requiredSynergies) continue;
      const hasAll = synergy.requiredSynergies.every((stat) =>
        this.hasStatBonus(stat as UpgradeStat)
      );
      if (hasAll) return synergy;
    }
    return null;
  }

  generateChoices(count = 3): UpgradeDef[] {
    const synergy = this.getAvailableSynergy();
    const choices: UpgradeDef[] = [];

    if (synergy) {
      choices.push(synergy);
    }

    // pool from available upgrades (not yet selected, non-synergy unless triggered)
    const pool = ALL_UPGRADES.filter(
      (u) => !this.hasUpgrade(u.id) && !u.isSynergy
    );

    // weighted selection
    const remaining = count - choices.length;
    const selectedIds = new Set<string>(choices.map((c) => c.id));

    for (let i = 0; i < remaining && pool.length > 0; i++) {
      const rarity = weightedRandomRarity();
      const byRarity = pool.filter(
        (u) => u.rarity === rarity && !selectedIds.has(u.id)
      );
      const candidates = byRarity.length > 0 ? byRarity : pool.filter((u) => !selectedIds.has(u.id));

      if (candidates.length > 0) {
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        choices.push(pick);
        selectedIds.add(pick.id);
      }
    }

    return choices;
  }
}
