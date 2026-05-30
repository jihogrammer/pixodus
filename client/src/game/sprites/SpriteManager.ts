import * as Phaser from "phaser";
import { P } from "./palette";

function canvas(size: number) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  return { canvas: c, ctx: c.getContext("2d")! };
}

function ear(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, size = 3.5) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size + 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function eye(ctx: CanvasRenderingContext2D, x: number, y: number, pupil: string) {
  ctx.fillStyle = P.WHITE;
  ctx.fillRect(x, y, 5, 4);
  ctx.fillStyle = pupil;
  ctx.fillRect(x + 1, y + 0.5, 3, 3);
  ctx.fillStyle = P.WHITE;
  ctx.fillRect(x + 1, y, 2, 1.5);
}

function shadow(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number) {
  ctx.fillStyle = P.SHADOW;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function hoof(ctx: CanvasRenderingContext2D, x: number, y: number, w = 5, h = 4) {
  ctx.fillStyle = P.BLACK;
  ctx.fillRect(x, y, w, h);
}

type DrawFn = (ctx: CanvasRenderingContext2D, frame: number) => void;

function makeSheet(scene: Phaser.Scene, key: string, size: number, frames: number, draw: DrawFn) {
  const c = document.createElement("canvas");
  c.width = size * frames;
  c.height = size;
  const ctx = c.getContext("2d")!;
  for (let f = 0; f < frames; f++) {
    ctx.save();
    ctx.translate(f * size, 0);
    draw(ctx, f);
    ctx.restore();
  }
  scene.textures.addSpriteSheet(key, c as unknown as HTMLImageElement, { frameWidth: size, frameHeight: size });
}

function makeAnim(scene: Phaser.Scene, charId: string) {
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

function bounceY(frame: number): number {
  if (frame === 1) return -1;
  if (frame === 3) return 1;
  return 0;
}

// ============================================================
// 캐릭터 드로잉 함수들
// ============================================================

function drawSnowball(ctx: CanvasRenderingContext2D, frame: number): void {
  const s = 32;
  const by = bounceY(frame);
  ctx.clearRect(0, 0, s, s);

  // 그림자
  shadow(ctx, 16, 28, 10, 4);

  // 몸통 — 분홍빛 돼지
  ctx.fillStyle = P.SNOWBALL_SKIN;
  ctx.beginPath();
  ctx.ellipse(16, 17 + by, 11, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // 통통한 볼
  ctx.fillStyle = "#FFE0D0";
  ctx.beginPath();
  ctx.ellipse(10, 19 + by, 4, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(22, 19 + by, 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 귀 — 돼지 귀 (삼각형)
  ctx.fillStyle = P.SNOWBALL_SKIN;
  ctx.beginPath();
  ctx.moveTo(5, 6 + by); ctx.lineTo(3, 1 + by); ctx.lineTo(10, 4 + by); ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(27, 6 + by); ctx.lineTo(29, 1 + by); ctx.lineTo(22, 4 + by); ctx.closePath();
  ctx.fill();

  // 큰 코 — 돼지는 코가 중요하다
  ctx.fillStyle = P.SNOWBALL_NOSE;
  ctx.beginPath();
  ctx.ellipse(16, 16 + by, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // 콧구멍
  ctx.fillStyle = "#D46A6A";
  ctx.beginPath();
  ctx.arc(13.5, 17 + by, 1.5, 0, Math.PI * 2);
  ctx.arc(18.5, 17 + by, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // 눈 — 영리한 눈빛
  ctx.fillStyle = P.WHITE;
  ctx.fillRect(9, 11 + by, 6, 5);
  ctx.fillRect(17, 11 + by, 6, 5);
  ctx.fillStyle = P.SNOWBALL_EYE;
  ctx.fillRect(10, 12 + by, 4, 3);
  ctx.fillRect(18, 12 + by, 4, 3);
  // 하이라이트
  ctx.fillStyle = P.WHITE;
  ctx.fillRect(10, 11 + by, 2, 2);
  ctx.fillRect(18, 11 + by, 2, 2);

  // 꼬리 — 돼지의 상징! 말린 꼬리
  ctx.strokeStyle = P.SNOWBALL_TAIL;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(28, 16 + by);
  ctx.quadraticCurveTo(30, 12 + by, 29, 9 + by);
  ctx.quadraticCurveTo(28, 7 + by, 26, 8 + by);
  ctx.stroke();

  // 발굽
  hoof(ctx, 8, 26 + by, 5, 3);
  hoof(ctx, 19, 26 + by, 5, 3);

  // 빨간 밴다나 — 혁명가의 상징
  ctx.fillStyle = P.SNOWBALL_BANDANA;
  ctx.beginPath();
  ctx.moveTo(5, 9 + by);
  ctx.lineTo(27, 9 + by);
  ctx.lineTo(29, 6 + by);
  ctx.lineTo(3, 6 + by);
  ctx.closePath();
  ctx.fill();
  // 밴다나 매듭
  ctx.fillStyle = P.SNOWBALL_BANDANA;
  ctx.beginPath();
  ctx.moveTo(3, 6 + by);
  ctx.lineTo(0, 4 + by);
  ctx.lineTo(3, 4 + by);
  ctx.closePath();
  ctx.fill();
}

function drawBoxer(ctx: CanvasRenderingContext2D, frame: number): void {
  const s = 32;
  const by = bounceY(frame);
  ctx.clearRect(0, 0, s, s);

  // 그림자
  shadow(ctx, 16, 28, 12, 5);

  // 거대한 몸통
  ctx.fillStyle = P.BOXER_BODY;
  ctx.beginPath();
  ctx.ellipse(16, 17 + by, 13, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // 배쪽 하이라이트
  ctx.fillStyle = "#A06030";
  ctx.beginPath();
  ctx.ellipse(16, 22 + by, 9, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // 황금 갈기
  ctx.fillStyle = P.BOXER_MANE;
  ctx.fillRect(7, 1 + by, 18, 5);
  ctx.beginPath();
  ctx.ellipse(16, 3 + by, 11, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // 긴 말 얼굴
  ctx.fillStyle = P.BOXER_BODY;
  ctx.beginPath();
  ctx.ellipse(16, 8 + by, 7, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  // 주둥이 연한 부분
  ctx.fillStyle = "#C08050";
  ctx.beginPath();
  ctx.ellipse(16, 14 + by, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // 콧구멍
  ctx.fillStyle = P.BLACK;
  ctx.fillRect(13, 14 + by, 3, 2.5);
  ctx.fillRect(17, 14 + by, 3, 2.5);

  // 순박한 큰 눈
  ctx.fillStyle = P.WHITE;
  ctx.fillRect(10, 5 + by, 6, 5);
  ctx.fillRect(17, 5 + by, 6, 5);
  ctx.fillStyle = P.BOXER_EYE;
  ctx.fillRect(11, 6 + by, 4, 3);
  ctx.fillRect(18, 6 + by, 4, 3);
  ctx.fillStyle = P.WHITE;
  ctx.fillRect(11, 5 + by, 2, 2);
  ctx.fillRect(18, 5 + by, 2, 2);

  // 붕대 — 박서의 트레이드마크
  ctx.fillStyle = P.BOXER_WRAP;
  ctx.fillRect(6, 22 + by, 7, 9);
  ctx.fillRect(19, 22 + by, 7, 9);
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1;
  for (let i = 25 + by; i < 30 + by; i += 3) {
    ctx.beginPath();
    ctx.moveTo(6, i); ctx.lineTo(13, i);
    ctx.moveTo(19, i); ctx.lineTo(26, i);
    ctx.stroke();
  }

  // 발굽
  ctx.fillStyle = P.BLACK;
  ctx.fillRect(6, 30 + by, 7, 3);
  ctx.fillRect(19, 30 + by, 7, 3);
}

function drawBenjamin(ctx: CanvasRenderingContext2D, frame: number): void {
  const s = 32;
  const by = bounceY(frame);
  ctx.clearRect(0, 0, s, s);

  shadow(ctx, 16, 28, 8, 3);

  // 몸통
  ctx.fillStyle = P.BENJAMIN_BODY;
  ctx.beginPath();
  ctx.ellipse(16, 18 + by, 9, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // 배 하이라이트
  ctx.fillStyle = "#A0A0A0";
  ctx.beginPath();
  ctx.ellipse(16, 22 + by, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 당나귀의 상징 — 긴 귀
  ctx.fillStyle = P.BENJAMIN_BODY;
  ctx.beginPath();
  ctx.ellipse(7, 1 + by, 4, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(25, 1 + by, 4, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // 귀 안쪽
  ctx.fillStyle = "#B0B0B0";
  ctx.beginPath();
  ctx.ellipse(7, 2 + by, 2, 7, 0, 0, Math.PI * 2);
  ctx.ellipse(25, 2 + by, 2, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // 긴 얼굴 — 당나귀 특유의 긴 주둥이
  ctx.fillStyle = P.BENJAMIN_BODY;
  ctx.beginPath();
  ctx.ellipse(16, 10 + by, 6, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // 주둥이 하이라이트
  ctx.fillStyle = P.BENJAMIN_NOSE;
  ctx.beginPath();
  ctx.ellipse(16, 15 + by, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = P.BLACK;
  ctx.fillRect(14, 14 + by, 2, 2);
  ctx.fillRect(17, 14 + by, 2, 2);

  // 시니컬한 반쯤 감긴 눈
  ctx.fillStyle = P.WHITE;
  ctx.fillRect(9, 8 + by, 6, 4);
  ctx.fillRect(17, 8 + by, 6, 4);
  ctx.fillStyle = P.BENJAMIN_EYE;
  ctx.fillRect(10, 9 + by, 4, 3);
  ctx.fillRect(18, 9 + by, 4, 3);
  // 눈꺼풀 (시니컬하게 반쯤 감기게)
  ctx.fillStyle = P.BENJAMIN_BODY;
  ctx.fillRect(9, 8 + by, 6, 2);
  ctx.fillRect(17, 8 + by, 6, 2);

  // 작은 허리 책
  ctx.fillStyle = "#5B2A1A";
  ctx.fillRect(3, 17 + by, 5, 7);
  ctx.fillStyle = "#FFF8DC";
  ctx.fillRect(4, 18 + by, 3, 4);

  // 발굽
  hoof(ctx, 8, 27 + by, 5, 3);
  hoof(ctx, 19, 27 + by, 5, 3);
}

function drawNapoleon(ctx: CanvasRenderingContext2D, frame: number): void {
  const s = 32;
  const by = bounceY(frame);
  ctx.clearRect(0, 0, s, s);

  shadow(ctx, 16, 29, 11, 4);

  // 거대한 몸통
  ctx.fillStyle = P.NAPOLEON_BODY;
  ctx.beginPath();
  ctx.ellipse(16, 18 + by, 12, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // 배 강조
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(16, 23 + by, 9, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 귀
  ctx.fillStyle = P.NAPOLEON_BODY;
  ear(ctx, 7, 5 + by, -0.5);
  ear(ctx, 25, 5 + by, 0.5);

  // 중절모
  ctx.fillStyle = P.NAPOLEON_HAT;
  ctx.fillRect(5, 1 + by, 22, 4);
  ctx.fillRect(8, -2 + by, 16, 4);
  // 빨간 띠
  ctx.fillStyle = P.NAPOLEON_HAT_BAND;
  ctx.fillRect(5, 5 + by, 22, 2);

  // 코
  ctx.fillStyle = P.SNOWBALL_NOSE;
  ctx.beginPath();
  ctx.ellipse(16, 20 + by, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // 교활한 눈
  ctx.fillStyle = P.RED_EYE;
  ctx.fillRect(10, 13 + by, 5, 3);
  ctx.fillRect(17, 13 + by, 5, 3);
  ctx.fillStyle = P.NAPOLEON_EYE;
  ctx.fillRect(11, 13 + by, 3, 3);
  ctx.fillRect(18, 13 + by, 3, 3);
  // 눈 하이라이트 (사악하게)
  ctx.fillStyle = P.WHITE;
  ctx.fillRect(12, 13 + by, 1, 1);
  ctx.fillRect(19, 13 + by, 1, 1);

  // 담배
  ctx.fillStyle = P.WHITE;
  ctx.fillRect(22, 15 + by, 6, 2);
  ctx.fillStyle = "#FF6600";
  ctx.fillRect(26, 14 + by, 2, 3);

  hoof(ctx, 8, 27 + by);
  hoof(ctx, 19, 27 + by);
}

function drawMollie(ctx: CanvasRenderingContext2D, frame: number): void {
  const s = 32;
  const by = bounceY(frame);
  ctx.clearRect(0, 0, s, s);

  shadow(ctx, 16, 28, 8, 3);

  // 우아한 흰 몸통
  ctx.fillStyle = P.MOLLIE_BODY;
  ctx.beginPath();
  ctx.ellipse(16, 17 + by, 9, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // 금빛 갈기
  ctx.fillStyle = P.MOLLIE_MANE;
  ctx.fillRect(10, 3 + by, 12, 5);
  ctx.beginPath();
  ctx.ellipse(16, 5 + by, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // 주둥이
  ctx.fillStyle = P.MOLLIE_BODY;
  ctx.beginPath();
  ctx.ellipse(16, 8 + by, 7, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // 콧구멍
  ctx.fillStyle = "#DDD";
  ctx.fillRect(13, 9 + by, 3, 2);
  ctx.fillRect(16, 9 + by, 3, 2);

  // 순한 눈
  ctx.fillStyle = P.WHITE;
  ctx.fillRect(9, 6 + by, 6, 4);
  ctx.fillRect(17, 6 + by, 6, 4);
  ctx.fillStyle = P.MOLLIE_EYE;
  ctx.fillRect(10, 7 + by, 4, 3);
  ctx.fillRect(18, 7 + by, 4, 3);
  // 큰 하이라이트
  ctx.fillStyle = P.WHITE;
  ctx.fillRect(10, 6 + by, 2, 1.5);
  ctx.fillRect(18, 6 + by, 2, 1.5);

  // 분홍 리본
  ctx.fillStyle = P.MOLLIE_RIBBON;
  ctx.beginPath();
  ctx.ellipse(16, 3 + by, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // 리본 매듭
  ctx.beginPath();
  ctx.moveTo(16, 2 + by);
  ctx.lineTo(12, -1 + by);
  ctx.lineTo(16, 1 + by);
  ctx.lineTo(20, -1 + by);
  ctx.closePath();
  ctx.fill();

  // 발굽
  hoof(ctx, 9, 27 + by);
  hoof(ctx, 18, 27 + by);
}

function drawSheep(ctx: CanvasRenderingContext2D, frame: number): void {
  const s = 32;
  const by = bounceY(frame);
  ctx.clearRect(0, 0, s, s);

  shadow(ctx, 16, 28, 9, 3);

  // 뽀송뽀송 털 (구름 모양)
  ctx.fillStyle = P.SHEEP_WOOL;
  // 원 여러 개로 구름질감
  const circles = [
    [16, 14 + by, 12],
    [8, 16 + by, 8],
    [24, 16 + by, 8],
    [12, 8 + by, 7],
    [20, 8 + by, 7],
    [16, 22 + by, 10],
  ];
  for (const [cx, cy, r] of circles) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 얼굴 (약간 드러나는 부분)
  ctx.fillStyle = P.SHEEP_FACE;
  ctx.beginPath();
  ctx.ellipse(16, 12 + by, 5, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // 멍한 눈
  ctx.fillStyle = P.WHITE;
  ctx.fillRect(10, 10 + by, 5, 4);
  ctx.fillRect(17, 10 + by, 5, 4);
  ctx.fillStyle = P.SHEEP_EYE;
  ctx.fillRect(11, 11 + by, 3, 2);
  ctx.fillRect(18, 11 + by, 3, 2);

  // 작은 발
  hoof(ctx, 10, 27 + by, 4, 3);
  hoof(ctx, 18, 27 + by, 4, 3);
}

// ============================================================
// 적 드로잉
// ============================================================

function drawEnemySheet(
  scene: Phaser.Scene,
  key: string,
  bodyColor: string,
  detailColor: string,
  eyeColor: string,
  type: "human" | "dog" | "sheep" | "pig",
) {
  const size = 32;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;

  switch (type) {
    case "human": {
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(16, 16, 10, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      // 모자
      ctx.fillStyle = detailColor;
      ctx.fillRect(8, 3, 16, 5);
      ctx.fillRect(10, -1, 12, 5);
      // 눈
      ctx.fillStyle = P.WHITE;
      ctx.fillRect(10, 13, 5, 3);
      ctx.fillRect(17, 13, 5, 3);
      ctx.fillStyle = eyeColor;
      ctx.fillRect(11, 13, 3, 3);
      ctx.fillRect(18, 13, 3, 3);
      break;
    }
    case "dog": {
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(16, 18, 9, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      // 귀 (뾰족)
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.moveTo(8, 10); ctx.lineTo(5, 2); ctx.lineTo(11, 8); ctx.closePath();
      ctx.moveTo(24, 10); ctx.lineTo(27, 2); ctx.lineTo(21, 8); ctx.closePath();
      ctx.fill();
      // 붉은 눈
      ctx.fillStyle = P.RED_EYE;
      ctx.fillRect(10, 12, 5, 3);
      ctx.fillRect(17, 12, 5, 3);
      ctx.fillStyle = eyeColor;
      ctx.fillRect(11, 12, 3, 3);
      ctx.fillRect(18, 12, 3, 3);
      break;
    }
    case "sheep": {
      ctx.fillStyle = bodyColor;
      const sc = [[16, 14, 11], [8, 16, 7], [24, 16, 7], [12, 8, 6], [20, 8, 6], [16, 22, 8]];
      for (const [cx, cy, r] of sc) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#FFE4D0";
      ctx.beginPath();
      ctx.ellipse(16, 11, 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // X 눈
      ctx.strokeStyle = eyeColor;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(10, 8); ctx.lineTo(14, 11); ctx.moveTo(14, 8); ctx.lineTo(10, 11); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(18, 8); ctx.lineTo(22, 11); ctx.moveTo(22, 8); ctx.lineTo(18, 11); ctx.stroke();
      break;
    }
    case "pig": {
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(16, 16, 10, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = bodyColor;
      ear(ctx, 8, 6, -0.4, 3);
      ear(ctx, 24, 6, 0.4, 3);
      ctx.fillStyle = "#FFB6C1";
      ctx.beginPath();
      ctx.ellipse(16, 18, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = P.WHITE;
      ctx.fillRect(10, 13, 5, 3);
      ctx.fillRect(17, 13, 5, 3);
      ctx.fillStyle = eyeColor;
      ctx.fillRect(11, 13, 3, 3);
      ctx.fillRect(18, 13, 3, 3);
      break;
    }
  }

  scene.textures.addSpriteSheet(key, c as unknown as HTMLImageElement, { frameWidth: size, frameHeight: size });
}

function drawProjectile(ctx: CanvasRenderingContext2D): void {
  const s = 8;
  ctx.clearRect(0, 0, s, s);
  // 빛나는 구체
  ctx.fillStyle = P.PROJECTILE_YELLOW;
  ctx.beginPath();
  ctx.arc(4, 4, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = P.PROJECTILE_GLOW;
  ctx.beginPath();
  ctx.arc(3.5, 3.5, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = P.WHITE;
  ctx.beginPath();
  ctx.arc(3, 3, 0.8, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================
// 메인 SpriteManager
// ============================================================

export class SpriteManager {
  static generateAll(scene: Phaser.Scene): void {
    // 플레이어블 캐릭터 (4프레임: idle, walk1, walk2, walk3)
    makeSheet(scene, "char_snowball", 32, 4, drawSnowball);
    makeSheet(scene, "char_boxer", 32, 4, drawBoxer);
    makeSheet(scene, "char_benjamin", 32, 4, drawBenjamin);
    makeSheet(scene, "char_napoleon", 32, 4, drawNapoleon);
    makeSheet(scene, "char_mollie", 32, 4, drawMollie);
    makeSheet(scene, "char_sheep", 32, 4, drawSheep);

    // 애니메이션 등록
    const charIds = ["snowball", "boxer", "benjamin", "napoleon", "mollie", "sheep"];
    for (const id of charIds) makeAnim(scene, id);

    // 적 타입
    drawEnemySheet(scene, "enemy_farmhand", P.FARMHAND_SKIN, P.FARMHAND_CLOTHES, P.FARMHAND_EYE, "human");
    drawEnemySheet(scene, "enemy_herder", P.HERDER_SKIN, P.HERDER_CLOTHES, P.FARMHAND_EYE, "human");
    drawEnemySheet(scene, "enemy_hunter", P.HUNTER_SKIN, P.HUNTER_CLOTHES, P.WHITE, "human");
    drawEnemySheet(scene, "enemy_sheeple", P.SHEEPLE_WOOL, P.SHEEPLE_WOOL, P.SHEEPLE_X_EYE, "sheep");
    drawEnemySheet(scene, "enemy_secretdog", P.SECRETDOG_BODY, P.SECRETDOG_BODY, P.SECRETDOG_EYE, "dog");
    drawEnemySheet(scene, "enemy_propagandist", P.PROPAGANDIST_BODY, P.PROPAGANDIST_BODY, P.PROPAGANDIST_EYE, "pig");

    // 보스 (별도 텍스처 - 당장은 동일 시트 사용, 추후 확장)
    drawEnemySheet(scene, "boss_jones", P.BOSS_JONES_SKIN, P.BOSS_JONES_CLOTHES, "#330000", "human");
    drawEnemySheet(scene, "boss_frederick", "#D4A76A", "#5C4033", "#1A1A1A", "human");
    drawEnemySheet(scene, "boss_napoleon", P.NAPOLEON_BODY, P.NAPOLEON_HAT, P.NAPOLEON_EYE, "pig");

    // 발사체
    {
      const size = 8;
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const ctx = c.getContext("2d")!;
      drawProjectile(ctx);
      scene.textures.addSpriteSheet("projectile", c as unknown as HTMLImageElement, { frameWidth: size, frameHeight: size });
    }
  }
}
