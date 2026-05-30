import * as Phaser from "phaser";
import { SpriteManager } from "../sprites/SpriteManager";
import { getSelectedCharacter } from "../config";

const LOADING_MESSAGES = [
  "동물들이 회의 중입니다...",
  "7계명 작성 중...",
  "돼지들이 걷는 법을 배우는 중...",
  "밀짚모자 건조 중...",
  "풍차 설계도 검토 중...",
  "양떼 집합 중...",
  "비밀경찰 훈련 중...",
];

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload(): void {
    const { width, height } = this.scale;
    const barWidth = width * 0.6;
    const barHeight = 12;
    const barX = (width - barWidth) / 2;
    const barY = height / 2;

    this.add.rectangle(width / 2, barY, barWidth + 4, barHeight + 4, 0x333333);
    const bar = this.add.rectangle(barX + 2, barY, 0, barHeight, 0x8b5e3c);

    this.add.text(width / 2, barY - 50, "PIXODUS", {
      fontFamily: "monospace",
      fontSize: "24px",
      color: "#c4a35a",
    }).setOrigin(0.5);

    const hint = this.add.text(width / 2, barY + 25, LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)], {
      fontFamily: "monospace",
      fontSize: "10px",
      color: "#8b7355",
    }).setOrigin(0.5);

    this.load.on("progress", (value: number) => {
      bar.width = barWidth * value;
    });

    SpriteManager.generateAll(this);

    this.load.emit("complete");
  }

  create(): void {
    const char = getSelectedCharacter();
    this.scene.start("GameScene", { chapterId: 1, character: char });
  }
}
