import * as Phaser from "phaser";
import { PreloadScene } from "./scenes/PreloadScene";
import { GameScene } from "./scenes/GameScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 480,
  height: 720,
  parent: "game-container",
  backgroundColor: "#2d1b00",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [PreloadScene, GameScene],
};

let selectedCharacter = "snowball";

export function setSelectedCharacter(char: string): void {
  selectedCharacter = char;
}

export function getSelectedCharacter(): string {
  return selectedCharacter;
}
