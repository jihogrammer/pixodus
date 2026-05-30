# SPRITE_GUIDE.md — 픽셀아트 스프라이트 구현 가이드

## 현재 상태 진단

`PreloadScene.ts`(99라인)는 현재 **단색 사각형**만 생성한다:

```typescript
// Player: 파란색 사각형 32x32 + 작은 네모 눈 2개 + 노란색 입
ctx.fillStyle = "#4a90d9";
ctx.fillRect(4, 4, size - 8, size - 8);

// Enemy: 빨간색 사각형 32x32 + 작은 네모 눈 2개
ctx.fillStyle = "#cc3333";
ctx.fillRect(4, 4, size - 8, size - 8);

// Projectile: 노란색 작은 사각형 8x8
ctx.fillStyle = "#ffff00";
ctx.fillRect(1, 1, size - 2, size - 2);
```

**문제**: 캐릭터 정체성이 전혀 없다. 동물농장 세계관과 무관.

## 목표

외부 PNG 에셋 없이 **Canvas API만으로** 스타듀밸리 수준의 귀여운 픽셀아트 캐릭터를 절차적으로 생성한다.

---

## 마이그레이션 전략

### Step 1: `SpriteManager.ts` 신규 파일 생성

`PreloadScene.ts`의 텍스처 생성 로직을 분리하고 픽셀아트로 업그레이드.

```
client/src/game/
├── scenes/
│   ├── PreloadScene.ts      # 로딩 화면만 담당 (씬 전환용)
│   └── GameScene.ts
├── sprites/                  # 신규 디렉토리
│   ├── SpriteManager.ts     # 모든 텍스처 생성 총괄
│   ├── characters.ts        # 캐릭터별 픽셀아트 그리기 함수
│   ├── enemies.ts           # 적 타입별 픽셀아트
│   └── palette.ts           # 컬러 팔레트 상수
```

### Step 2: `palette.ts` — 마스터 컬러 팔레트

```typescript
// sprites/palette.ts
export const PALETTE = {
  SNOWBALL_SKIN: "#FFE4D0",   // 흰돼지 피부
  SNOWBALL_NOSE: "#FFB6C1",   // 분홍 코
  SNOWBALL_HOOF: "#8B4513",   // 발굽
  SNOWBALL_EYE: "#2F1B14",    // 검은 눈
  BOXER_BODY: "#8B4513",      // 갈색 말털
  BOXER_MANE: "#FFD700",      // 금색 갈기
  BOXER_WRAP: "#FFF8E7",      // 붕대
  BENJAMIN_BODY: "#808080",   // 회색 당나귀
  BENJAMIN_NOSE: "#C0C0C0",
  NAPOLEON_BODY: "#2D1B0E",   // 검은돼지
  NAPOLEON_HAT: "#1A1A1A",    // 중절모
  RED_EYE: "#FF0000",
  MOLLIE_BODY: "#FFFFF0",     // 백마
  MOLLIE_RIBBON: "#FF69B4",   // 분홍 리본
  SHEEP_WOOL: "#FFF8E7",      // 양털
  SHEEP_EYE: "#333333",
  FARMHAND_SKIN: "#DEB887",   // 인간 피부
  FARMHAND_CLOTHES: "#8B7355",
  HUNTER_CLOTHES: "#4A4A4A",
  PROJECTILE_YELLOW: "#FFD700",
  BULLET_WHITE: "#FFFFFF",
} as const;
```

### Step 3: `characters.ts` — 캐릭터 그리기

```typescript
// sprites/characters.ts
import { PALETTE } from "./palette";

export type CharacterDrawFn = (
  ctx: CanvasRenderingContext2D,
  frame: number,
  palette: typeof PALETTE
) => void;

export const characterDrawers: Record<string, CharacterDrawFn> = {
  snowball: drawPigSnowball,
  napoleon: drawPigNapoleon,
  boxer: drawHorseBoxer,
  benjamin: drawDonkeyBenjamin,
  mollie: drawMareMollie,
  sheep: drawSheep,
};

// ============================================================
// 스노볼 — 흰돼지 (전략가)
// ============================================================
function drawPigSnowball(ctx: CanvasRenderingContext2D, frame: number, p: typeof PALETTE): void {
  const s = 32; // 캔버스 사이즈
  ctx.clearRect(0, 0, s, s);

  // --- 몸통 (타원) ---
  ctx.fillStyle = p.SNOWBALL_SKIN;
  ctx.beginPath();
  ctx.ellipse(16, 18, 10, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- 그림자 (하단) ---
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.beginPath();
  ctx.ellipse(16, 26, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- 귀 (삼각형 2개) ---
  ctx.fillStyle = p.SNOWBALL_SKIN;
  drawEar(ctx, 8, 6, -0.5);  // 왼쪽 귀
  drawEar(ctx, 24, 6, 0.5);  // 오른쪽 귀

  // --- 코 (타원) ---
  ctx.fillStyle = p.SNOWBALL_NOSE;
  ctx.beginPath();
  ctx.ellipse(16, 20, 5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // 콧구멍 2개
  ctx.fillStyle = "#D4918B";
  ctx.fillRect(14, 21, 1.5, 1);
  ctx.fillRect(18, 21, 1.5, 1);

  // --- 눈 (반짝이게) ---
  drawEye(ctx, 12, 14, p.SNOWBALL_EYE);
  drawEye(ctx, 20, 14, p.SNOWBALL_EYE);

  // --- 발굽 ---
  ctx.fillStyle = p.SNOWBALL_HOOF;
  ctx.fillRect(10, 27, 5, 3);
  ctx.fillRect(17, 27, 5, 3);

  // --- 밴다나 ---
  ctx.fillStyle = "#CC2200";
  ctx.beginPath();
  ctx.moveTo(8, 12);
  ctx.lineTo(24, 12);
  ctx.lineTo(28, 9);
  ctx.lineTo(4, 9);
  ctx.closePath();
  ctx.fill();

  // --- 프레임 변형 ---
  if (frame === 1) { // walk1 - 살짝 위로
    applyWalkBounce(ctx, s, true);
  } else if (frame === 3) { // walk3 - 살짝 아래로
    applyWalkBounce(ctx, s, false);
  }
}

// ============================================================
// 복서 — 갈색말 (충직한 탱커)
// ============================================================
function drawHorseBoxer(ctx: CanvasRenderingContext2D, frame: number, p: typeof PALETTE): void {
  const s = 32;
  ctx.clearRect(0, 0, s, s);

  // 큰 체구
  ctx.fillStyle = p.BOXER_BODY;
  ctx.beginPath();
  ctx.ellipse(16, 16, 12, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // 갈기
  ctx.fillStyle = p.BOXER_MANE;
  ctx.fillRect(10, 4, 12, 4);
  ctx.fillRect(6, 6, 4, 8);
  ctx.fillRect(22, 6, 4, 8);

  // 긴 얼굴
  ctx.fillStyle = p.BOXER_BODY;
  ctx.beginPath();
  ctx.ellipse(16, 8, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // 눈
  drawEye(ctx, 13, 7, "#1A1A1A");
  drawEye(ctx, 19, 7, "#1A1A1A");

  // 붕대 (앞다리)
  ctx.fillStyle = p.BOXER_WRAP;
  ctx.fillRect(8, 22, 5, 8);
  ctx.fillRect(19, 22, 5, 8);

  // 붕대 줄무늬
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 0.5;
  for (let y = 25; y < 30; y += 3) {
    ctx.beginPath();
    ctx.moveTo(8, y); ctx.lineTo(13, y);
    ctx.moveTo(19, y); ctx.lineTo(24, y);
    ctx.stroke();
  }
}

// ... 추가 캐릭터들
```

### Step 4: `SpriteManager.ts` — 통합 텍스처 생성기

```typescript
// sprites/SpriteManager.ts
import * as Phaser from "phaser";
import { characterDrawers, CharacterDrawFn } from "./characters";
import { PALETTE } from "./palette";

export class SpriteManager {
  /**
   * Phaser scene의 texture manager에 모든 게임 스프라이트를 등록한다.
   * PreloadScene.preload()에서 호출.
   */
  static generateAllTextures(scene: Phaser.Scene): void {
    this.generateCharacterTextures(scene);
    this.generateEnemyTextures(scene);
    this.generateProjectileTexture(scene);
  }

  private static generateCharacterTextures(scene: Phaser.Scene): void {
    const size = 32;
    const frames = 4; // idle, walk1, walk2, walk3

    for (const [charId, drawFn] of Object.entries(characterDrawers)) {
      const canvas = document.createElement("canvas");
      canvas.width = size * frames;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;

      for (let f = 0; f < frames; f++) {
        ctx.save();
        ctx.translate(f * size, 0);
        drawFn(ctx, f, PALETTE);
        ctx.restore();
      }

      scene.textures.addSpriteSheet(
        `char_${charId}`,
        canvas as unknown as HTMLImageElement,
        { frameWidth: size, frameHeight: size }
      );

      // 프레임별 애니메이션 생성
      scene.anims.create({
        key: `${charId}_idle`,
        frames: [{ key: `char_${charId}`, frame: 0 }],
        frameRate: 0,
        repeat: -1,
      });
      scene.anims.create({
        key: `${charId}_walk`,
        frames: scene.anims.generateFrameNumbers(`char_${charId}`, { start: 1, end: 3 }),
        frameRate: 10,
        repeat: -1,
      });
    }
  }

  private static generateEnemyTextures(scene: Phaser.Scene): void {
    const types = [
      { key: "enemy_farmhand", palette: { body: "#CC6633", eyes: "#330000" } },
      { key: "enemy_herder", palette: { body: "#996633", eyes: "#330000" } },
      { key: "enemy_hunter", palette: { body: "#336699", eyes: "#FFFFFF" } },
      { key: "enemy_sheeple", palette: { body: "#FFF8E7", eyes: "#333333" } },
      { key: "enemy_secretdog", palette: { body: "#2D1B0E", eyes: "#FF0000" } },
      { key: "enemy_propagandist", palette: { body: "#FFB6C1", eyes: "#FF0000" } },
    ];

    for (const { key, palette } of types) {
      const size = 32;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;

      // 기본 원형
      ctx.fillStyle = palette.body;
      ctx.beginPath();
      ctx.ellipse(16, 16, 10, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // 눈
      ctx.fillStyle = palette.eyes;
      ctx.fillRect(10, 12, 4, 3);
      ctx.fillRect(18, 12, 4, 3);

      scene.textures.addSpriteSheet(key, canvas as unknown as HTMLImageElement, { frameWidth: size, frameHeight: size });
    }
  }

  private static generateProjectileTexture(scene: Phaser.Scene): void {
    const size = 8;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = PALETTE.PROJECTILE_YELLOW;
    ctx.beginPath();
    ctx.arc(4, 4, 3, 0, Math.PI * 2);
    ctx.fill();

    // 발광 효과
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.arc(4, 4, 1.5, 0, Math.PI * 2);
    ctx.fill();

    scene.textures.addSpriteSheet("projectile", canvas as unknown as HTMLImageElement, { frameWidth: size, frameHeight: size });
  }
}

// 유틸리티 함수들
function drawEar(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.ellipse(0, 0, 3.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawEye(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  // 흰자
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(x, y, 4, 3);
  // 눈동자
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 0.5, 2, 2);
  // 하이라이트
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(x + 1, y, 1, 1);
}

function applyWalkBounce(ctx: CanvasRenderingContext2D, size: number, up: boolean): void {
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = up ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = "source-over";
}
```

### Step 5: `PreloadScene.ts` 교체

```typescript
// scenes/PreloadScene.ts (수정)
import * as Phaser from "phaser";
import { SpriteManager } from "../sprites/SpriteManager";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload(): void {
    // 기존 로딩 프로그레스 바 (시각적인 프리로더 유지)
    this.showLoadingBar();

    // 모든 텍스처를 Canvas API로 생성
    SpriteManager.generateAllTextures(this);

    // 실제 외부 에셋 로드 (Phase 3)
    // this.load.spritesheet("player", "/assets/sprites/player.png", { ... });
    // this.load.audio("bgm", "/assets/audio/farm_theme.mp3");
  }

  create(): void {
    this.scene.start("GameScene", { chapterId: 1, character: "snowball" });
  }

  private showLoadingBar(): void {
    const { width, height } = this.scale;
    const barWidth = width * 0.6;
    const barHeight = 12;
    const barX = (width - barWidth) / 2;
    const barY = height / 2;

    this.add.rectangle(width / 2, barY, barWidth + 4, barHeight + 4, 0x333333);
    const bar = this.add.rectangle(barX + 2, barY, 0, barHeight, 0x8b5e3c);

    const label = this.add.text(width / 2, barY - 40, "PIXODUS", {
      fontFamily: "monospace",
      fontSize: "24px",
      color: "#c4a35a",
    });
    label.setOrigin(0.5);

    // 로딩 메시지도 병맛으로
    const hints = [
      "동물들이 회의 중입니다...",
      "7계명 작성 중...",
      "돼지들이 걷는 법을 배우는 중...",
    ];
    const hint = this.add.text(width / 2, barY - 20, hints[Math.floor(Math.random() * hints.length)], {
      fontFamily: "monospace",
      fontSize: "10px",
      color: "#8b7355",
    });
    hint.setOrigin(0.5);

    this.load.on("progress", (value: number) => {
      bar.width = barWidth * value;
    });
  }
}
```

---

## 캐릭터 스프라이트 우선순위

| 우선순위 | 캐릭터 | 복잡도 | 예상 시간 |
|---|---|---|---|
| P0 | 스노볼 (돼지) | 중 | 2h |
| P0 | 복서 (말) | 중 | 2h |
| P0 | 벤자민 (당나귀) | 중 | 2h |
| P0 | 적 — farmhand | 하 | 30m |
| P0 | 적 — herder | 하 | 30m |
| P0 | 적 — hunter | 하 | 30m |
| P1 | 나폴레옹 (돼지) | 상 | 3h |
| P1 | 몰리 (암말) | 중 | 2h |
| P1 | 양 (Sheeple) | 하 | 1h |
| P1 | 적 — sheeple | 하 | 30m |
| P1 | 적 — secretdog | 중 | 1h |
| P2 | 보스 — 존스 | 대 | 3h |
| P2 | 보스 — 프레드릭 | 대 | 3h |
| P2 | 보스 — 나폴레옹 | 대 | 4h |

**Phase A 총 작업량**: 약 25시간

---

## Phase B: PNG 스프라이트 시트로 전환

Phase A에서 Canvas API 생성을 완료한 후, 다음 단계:

1. Aseprite 또는 Piskel에서 실제 픽셀아트 제작
2. `/public/assets/sprites/characters/snowball.png` 등에 배치
3. `SpriteManager.ts`의 `generateCharacterTextures`를 로더로 교체:
```typescript
// Canvas API 생성 → 이미지 로드로 교체
this.load.spritesheet("char_snowball", "/assets/sprites/characters/snowball.png", {
  frameWidth: 32,
  frameHeight: 32,
});
```

**Canvas API만으로도 출시 가능한 퀄리티**가 목표. PNG는 시간과 리소스가 허락할 때.

---

## 참고: Phaser.Physics.Arcade.Sprite → 커스텀 스프라이트 적용

현재 `Player.ts`에서는 `"player"` 텍스처 키를 사용:
```typescript
super(scene, x, y, "player");
```

변경 후:
```typescript
constructor(scene, x, y, character = "snowball") {
  super(scene, x, y, `char_${character}`);  // "char_snowball"
  this.play(`${character}_idle`);
}
```

`Enemy.ts`도 마찬가지:
```typescript
constructor(scene, x, y, type = "farmhand") {
  super(scene, x, y, `enemy_${type}`);  // "enemy_farmhand"
}
```
