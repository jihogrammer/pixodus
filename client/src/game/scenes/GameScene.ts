import * as Phaser from "phaser";
import { eventBus } from "../EventBus";
import { Player } from "../entities/Player";
import { Enemy, EnemyType } from "../entities/Enemy";
import { SkillKey, SkillEffect } from "../skills/types";
import { earnIdeaFragments } from "../systems/AISynthesis";
import { UpgradeManager } from "../upgrades/UpgradeManager";
import { UpgradeDef, UpgradeBonus } from "../upgrades/types";

interface GameSceneInit {
  chapterId: number;
  character: string;
}

const SKILL_KEYS: SkillKey[] = ["Q", "W", "E", "R"];
const KEY_MAP: Record<string, SkillKey> = { q: "Q", w: "W", e: "E", r: "R" };

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.GameObjects.Group;
  private projectiles!: Phaser.GameObjects.Group;
  private virtualJoystick?: {
    pointerId: number; startX: number; startY: number; currentX: number; currentY: number;
  };
  private joystickBase?: Phaser.GameObjects.Arc;
  private joystickThumb?: Phaser.GameObjects.Arc;

  private currentWave = 0;
  private totalWaves = 10;
  private totalEnemiesSpawned = 0;
  private totalEnemiesKilled = 0;
  private waveActive = false;
  private waveEnemiesRemaining = 0;
  private score = 0;
  private chapterId = 1;
  private charId = "snowball";
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private skillKeys!: Record<string, Phaser.Input.Keyboard.Key>;
  private upgradeManager!: UpgradeManager;
  private upgradePending = false;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: GameSceneInit): void {
    this.currentWave = 0;
    this.totalEnemiesSpawned = 0;
    this.totalEnemiesKilled = 0;
    this.waveActive = false;
    this.waveEnemiesRemaining = 0;
    this.score = 0;
    this.charId = data.character ?? "snowball";
    this.chapterId = data.chapterId ?? 1;
    this.totalWaves = this.chapterId === 1 ? 10 : this.chapterId === 2 ? 15 : this.chapterId === 3 ? 20 : 25;
    this.upgradeManager = new UpgradeManager();
    this.upgradePending = false;
  }

  create(data: GameSceneInit): void {
    const { width, height } = this.scale;

    this.cameras.main.setBounds(0, 0, width * 2, height * 2);
    this.physics.world.setBounds(0, 0, width * 2, height * 2);

    this.generateTileMap();
    this.createPlayer(data.character ?? "snowball");
    this.enemies = this.add.group({ runChildUpdate: true });
    this.projectiles = this.add.group({ runChildUpdate: true });

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);

    this.registerKeyboardInput();
    this.setupJoystick();
    this.setupCollisions();
    this.registerEnemyKillHandler();
    this.registerUpgradeHandler();
    this.startFirstWave();
  }

  private registerKeyboardInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.skillKeys = {
      q: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      w: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      e: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      r: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R),
    };
  }

  private setupJoystick(): void {
    const { width } = this.scale;

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < width * 0.4) {
        this.virtualJoystick = {
          pointerId: pointer.id,
          startX: pointer.x,
          startY: pointer.y,
          currentX: pointer.x,
          currentY: pointer.y,
        };
        this.joystickBase = this.add.circle(pointer.x, pointer.y, 30, 0x000000, 0.3).setScrollFactor(0).setDepth(100);
        this.joystickThumb = this.add.circle(pointer.x, pointer.y, 15, 0xffffff, 0.5).setScrollFactor(0).setDepth(101);
      }
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.virtualJoystick && pointer.id === this.virtualJoystick.pointerId) {
        this.virtualJoystick.currentX = pointer.x;
        this.virtualJoystick.currentY = pointer.y;
        this.updateJoystickVisual();
      }
    });

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (this.virtualJoystick && pointer.id === this.virtualJoystick.pointerId) {
        this.virtualJoystick = undefined;
        this.joystickBase?.destroy();
        this.joystickThumb?.destroy();
      }
    });
  }

  private updateJoystickVisual(): void {
    if (!this.joystickThumb || !this.virtualJoystick) return;
    const dx = this.virtualJoystick.currentX - this.virtualJoystick.startX;
    const dy = this.virtualJoystick.currentY - this.virtualJoystick.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 25;
    if (dist > maxDist) {
      const angle = Math.atan2(dy, dx);
      this.joystickThumb.setPosition(
        this.virtualJoystick.startX + Math.cos(angle) * maxDist,
        this.virtualJoystick.startY + Math.sin(angle) * maxDist,
      );
    } else {
      this.joystickThumb.setPosition(this.virtualJoystick.currentX, this.virtualJoystick.currentY);
    }
  }

  private setupCollisions(): void {
    this.physics.add.collider(this.player, this.enemies, () => {
      // Enemy damage handled in Enemy.preUpdate
    });

    this.physics.add.overlap(this.projectiles, this.enemies, (proj, enemy) => {
      const p = proj as Phaser.Physics.Arcade.Sprite;
      const e = enemy as unknown as Enemy;
      if (!p.active || !e.active) return;
      const dmg = (p.getData("damage") as number) ?? 10;
      const pierce = (p.getData("pierce") as number) ?? 0;
      e.takeDamage(dmg);
      this.spawnHitEffect(p.x, p.y);
      if (pierce > 0) {
        p.setData("pierce", pierce - 1);
      } else {
        p.destroy();
      }
    });

    // 플레이어 사망 감지
    eventBus.on("player-death", () => {
      this.handleGameOver();
    });
  }

  private spawnHitEffect(x: number, y: number): void {
    const hit = this.add.circle(x, y, 6, 0xffff00, 0.8);
    hit.setDepth(20);
    this.tweens.add({
      targets: hit,
      scaleX: 2, scaleY: 2, alpha: 0,
      duration: 200,
      onComplete: () => hit.destroy(),
    });
  }

  private registerEnemyKillHandler(): void {
    eventBus.on("enemy-killed", (data: unknown) => {
      const d = data as { type: string; x: number; y: number; exp: number };
      this.waveEnemiesRemaining--;
      this.totalEnemiesKilled++;
      this.score += d.exp;
      eventBus.emit("score-update", this.score);

      const fragments = d.type === "secretdog" ? 3 : d.type === "propagandist" ? 2 : 1;
      earnIdeaFragments(fragments);

      if (this.waveEnemiesRemaining <= 0 && this.waveActive) {
        this.handleWaveCleared();
      }
    });
  }

  private generateTileMap(): void {
    const { width, height } = this.scale;
    const tileSize = 32;
    const cols = Math.ceil((width * 2) / tileSize);
    const rows = Math.ceil((height * 2) / tileSize);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const green = Phaser.Math.Between(75, 125);
        const color = (Math.floor(green * 0.6) << 16) | (green << 8) | 0x10;
        this.add.rectangle(
          x * tileSize + tileSize / 2,
          y * tileSize + tileSize / 2,
          tileSize,
          tileSize,
          color,
          0.3,
        );
      }
    }
  }

  private createPlayer(character: string): void {
    const { width, height } = this.scale;
    this.player = new Player(this, width, height, character);
    this.player.setName("player");
    this.player.setDepth(10);
    this.player.setDisplaySize(40, 40);
    this.player.play(`${character}_idle`);
  }

  private startFirstWave(): void {
    this.time.addEvent({
      delay: 2000,
      loop: false,
      callback: () => this.startWave(),
    });
  }

  private startWave(): void {
    if (this.waveActive) return;
    this.currentWave++;
    this.waveActive = true;
    eventBus.emit("wave-start", this.currentWave);

    const isBossWave = this.currentWave === this.totalWaves;
    if (isBossWave) {
      this.spawnBossWave();
      return;
    }

    const enemyCount = 5 + this.currentWave * 3;
    this.waveEnemiesRemaining = enemyCount;
    const types = this.getWaveEnemyTypes(enemyCount);

    this.time.addEvent({
      delay: Math.max(300, 1000 - this.currentWave * 50),
      repeat: enemyCount - 1,
      callback: () => this.spawnEnemy(types.shift() ?? "farmhand"),
    });

    // 최대 웨이브 시간
    this.time.addEvent({
      delay: 25000,
      loop: false,
      callback: () => {
        this.waveActive = false;
        if (this.waveEnemiesRemaining > 0) this.handleWaveCleared();
      },
    });
  }

  private getWaveEnemyTypes(count: number): EnemyType[] {
    const types: EnemyType[] = [];
    for (let i = 0; i < count; i++) {
      if (this.chapterId === 1) {
        if (this.currentWave >= 4) types.push(Phaser.Math.RND.pick(["farmhand", "herder", "hunter"]));
        else if (this.currentWave >= 2) types.push(Phaser.Math.RND.pick(["farmhand", "herder"]));
        else types.push("farmhand");
      } else if (this.chapterId === 2) {
        const pool: EnemyType[] = this.currentWave >= 6
          ? ["herder", "hunter", "sheeple"]
          : this.currentWave >= 3
            ? ["farmhand", "herder", "hunter"]
            : ["farmhand", "herder"];
        types.push(Phaser.Math.RND.pick(pool));
      } else {
        const pool: EnemyType[] = this.currentWave >= 10
          ? ["secretdog", "propagandist", "sheeple"]
          : this.currentWave >= 5
            ? ["hunter", "sheeple", "propagandist"]
            : ["farmhand", "herder", "hunter", "sheeple"];
        types.push(Phaser.Math.RND.pick(pool));
      }
    }
    return types;
  }

  private spawnBossWave(): void {
    eventBus.emit("boss-spawned", { chapterId: this.chapterId });
    const bossType = this.chapterId === 1 ? "boss_jones" : this.chapterId === 2 ? "boss_frederick" : "boss_napoleon";
    const boss = this.spawnBoss(bossType);
    this.waveEnemiesRemaining = 1;
  }

  private spawnBoss(bossType: string): Enemy {
    const { width, height } = this.scale;
    const boss = new Enemy(this, width, height, "hunter", this.currentWave);
    boss.setTexture(bossType);
    boss.setDisplaySize(56, 56);
    boss.setDepth(8);
    Object.defineProperty(boss, "hp", { value: 300 + this.chapterId * 150 + this.currentWave * 20, writable: true });
    this.enemies.add(boss);
    this.totalEnemiesSpawned++;
    return boss;
  }

  private spawnEnemy(type: EnemyType): void {
    const { width, height } = this.scale;
    const side = Phaser.Math.Between(0, 3);
    let x: number, y: number;
    const margin = 50;
    switch (side) {
      case 0: x = Phaser.Math.Between(margin, width * 2 - margin); y = -margin; break;
      case 1: x = width * 2 + margin; y = Phaser.Math.Between(margin, height * 2 - margin); break;
      case 2: x = Phaser.Math.Between(margin, width * 2 - margin); y = height * 2 + margin; break;
      default: x = -margin; y = Phaser.Math.Between(margin, height * 2 - margin); break;
    }
    const enemy = new Enemy(this, x, y, type, this.currentWave);
    this.enemies.add(enemy);
    this.totalEnemiesSpawned++;
  }

  private handleWaveCleared(): void {
    this.waveActive = false;
    eventBus.emit("wave-cleared", {
      wave: this.currentWave,
      isBossWave: this.currentWave === this.totalWaves,
      chapterId: this.chapterId,
    });

    if (this.currentWave === this.totalWaves) {
      eventBus.emit("chapter-complete", { chapterId: this.chapterId, score: this.score });
      return;
    }

    this.player.heal(Math.floor(this.player.maxHp * 0.2));

    const fragments = 5 + this.currentWave * 2;
    earnIdeaFragments(fragments);

    // 2웨이브마다 업그레이드 선택
    if (this.currentWave % 2 === 0) {
      this.pauseForUpgrade();
    } else {
      this.time.addEvent({
        delay: 2000,
        loop: false,
        callback: () => this.startWave(),
      });
    }
  }

  private pauseForUpgrade(): void {
    this.upgradePending = true;
    this.physics.pause();
    const choices = this.upgradeManager.generateChoices(3);
    eventBus.emit("upgrade-select", choices);
  }

  private registerUpgradeHandler(): void {
    eventBus.on("upgrade-selected", (data: unknown) => {
      const def = data as UpgradeDef;
      this.upgradeManager.selectUpgrade(def);
      this.upgradePending = false;

      const bonuses = this.upgradeManager.getBonuses();
      this.player.applyUpgradeBonuses(bonuses);

      this.physics.resume();

      this.time.addEvent({
        delay: 500,
        loop: false,
        callback: () => this.startWave(),
      });
    });
  }

  private handleGameOver(): void {
    this.waveActive = false;
    this.player.setVelocity(0, 0);
    this.physics.pause();

    const fragments = Math.floor(this.score / 10);
    earnIdeaFragments(fragments);
    eventBus.emit("game-over", {
      wave: this.currentWave,
      score: this.score,
      kills: this.totalEnemiesKilled,
      chapterId: this.chapterId,
      fragments,
    });
  }

  update(_time: number, delta: number): void {
    if (!this.player?.active) return;

    this.handleMovement();
    this.handleSkills(_time);
    this.player.update(_time, this.game.loop.delta);
  }

  private handleMovement(): void {
    let vx = 0, vy = 0;

    if (this.virtualJoystick) {
      vx = this.virtualJoystick.currentX - this.virtualJoystick.startX;
      vy = this.virtualJoystick.currentY - this.virtualJoystick.startY;
      const dist = Math.sqrt(vx * vx + vy * vy);
      if (dist > 20) { vx /= dist; vy /= dist; }
      else { vx = 0; vy = 0; }
    }

    if (this.cursors.left.isDown) vx = -1;
    if (this.cursors.right.isDown) vx = 1;
    if (this.cursors.up.isDown) vy = -1;
    if (this.cursors.down.isDown) vy = 1;

    const isMoving = vx !== 0 || vy !== 0;

    if (isMoving) {
      const norm = Math.sqrt(vx * vx + vy * vy);
      vx /= norm; vy /= norm;
      this.player.setVelocity(vx * this.player.speed, vy * this.player.speed);

      // 좌우 방향 전환 (rotation 대신 flipX 사용)
      if (vx < 0) this.player.setFlipX(true);
      else if (vx > 0) this.player.setFlipX(false);

      this.player.startAttacking(this.enemies, this.projectiles);
      if (this.player.anims.currentAnim?.key !== `${this.charId}_walk`) {
        this.player.play(`${this.charId}_walk`, true);
      }
    } else {
      this.player.setVelocity(0, 0);
      this.player.startAttacking(this.enemies, this.projectiles);
      if (this.player.anims.currentAnim?.key !== `${this.charId}_idle`) {
        this.player.play(`${this.charId}_idle`, true);
      }
    }
  }

  private handleSkills(_time: number): void {
    for (const key in this.skillKeys) {
      const phaserKey = this.skillKeys[key];
      const skillKey = KEY_MAP[key];
      if (phaserKey && Phaser.Input.Keyboard.JustDown(phaserKey)) {
        const effect = this.player.useSkill(skillKey);
        if (effect) this.executeSkillEffect(effect);
      }
    }
  }

  private executeSkillEffect(effect: SkillEffect): void {
    switch (effect.type) {
      case "aoe": {
        const children = this.enemies.getChildren();
        children.forEach((c) => {
          const e = c as Enemy;
          if (!e.active) return;
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
          if (dist < 120) {
            e.takeDamage(effect.value);
            this.spawnHitEffect(e.x, e.y);
          }
        });
        this.showAoeEffect(120);
        break;
      }
      case "damage": {
        const children = this.enemies.getChildren();
        let minDist = Infinity;
        let nearest: Enemy | null = null;
        for (const c of children) {
          const e = c as Enemy;
          if (!e.active) continue;
          const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
          if (d < minDist) { minDist = d; nearest = e; }
        }
        if (nearest) {
          nearest.takeDamage(effect.value);
          this.spawnHitEffect(nearest.x, nearest.y);
        }
        break;
      }
      case "summon": {
        const count = effect.summonCount ?? 2;
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count;
          const sx = this.player.x + Math.cos(angle) * 40;
          const sy = this.player.y + Math.sin(angle) * 40;
          const dog = new Enemy(this, sx, sy, "secretdog", this.currentWave);
          dog.setTint(0x4444ff);
          this.enemies.add(dog);
          this.totalEnemiesSpawned++;
        }
        break;
      }
      case "slow": {
        const children = this.enemies.getChildren();
        children.forEach((c) => {
          const e = c as Enemy;
          if (!e.active) return;
          if (Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y) < 130) {
            e.slow(0.5, 4000);
          }
        });
        break;
      }
    }
  }

  private showAoeEffect(radius: number): void {
    const ring = this.add.circle(this.player.x, this.player.y, radius, 0xff4400, 0.2);
    ring.setDepth(50);
    this.tweens.add({
      targets: ring,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      duration: 400,
      onComplete: () => ring.destroy(),
    });
  }
}
