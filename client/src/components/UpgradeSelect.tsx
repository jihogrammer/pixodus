"use client";

import { useState, useEffect } from "react";
import { UpgradeDef, RARITY_COLORS } from "@/game/upgrades/types";

interface UpgradeSelectProps {
  choices: UpgradeDef[];
  onSelect: (upgrade: UpgradeDef) => void;
}

function getRarityLabel(rarity: string): string {
  switch (rarity) {
    case "common": return "일반";
    case "rare": return "희귀";
    case "heroic": return "영웅";
    case "legendary": return "전설";
    default: return "";
  }
}

export function UpgradeSelectOverlay({ choices, onSelect }: UpgradeSelectProps) {
  return (
    <div className="upgrade-overlay">
      <div className="upgrade-box">
        <h2 className="upgrade-title">업그레이드 선택</h2>
        <p className="upgrade-sub">하나를 선택하세요</p>
        <div className="upgrade-choices">
          {choices.map((choice) => (
            <button
              key={choice.id}
              className="upgrade-card"
              style={{ borderColor: RARITY_COLORS[choice.rarity] }}
              onClick={() => onSelect(choice)}
            >
              <div
                className="upgrade-rarity"
                style={{ backgroundColor: RARITY_COLORS[choice.rarity] }}
              >
                {getRarityLabel(choice.rarity)}
              </div>
              <div className="upgrade-name">{choice.name}</div>
              <div className="upgrade-desc">{choice.description}</div>
              {choice.isSynergy && (
                <div className="upgrade-synergy-badge">시너지</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
