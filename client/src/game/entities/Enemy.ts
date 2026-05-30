import * as Phaser from "phaser";
import { Player } from "./Player";
import { eventBus } from "../EventBus";

export type EnemyType = "farmhand" | "herder" | "hunter" | "sheeple" | "secretdog" | "propagandist";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private moveSpeed = 80;
  private baseMoveSpeed = 80;
  hp = 40;
  damage = 8;
  private attackCooldown = 0;
  private attackRate = 900;
  private slowAmount = 1;
  private slowTimer = 0;
  enemyType: EnemyType;
  expValue = 10;

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType, wave = 1) {
    const texKey = `enemy_${type}`;
    super(scene, x, y, texKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.enemyType = type;
    this.setCollideWorldBounds(true);
    this.setDepth(5);
    this.setDisplaySize(32, 32);

    const wm = 1 + (wave - 1) * 0.15;

    switch (type) {
      case "farmhand":
        this.moveSpeed = Math.floor(70 * wm); this.hp = Math.floor(40 * wm); this.damage = Math.floor(6 * wm);
        this.setCircle(14, 2, 2);
        break;
      case "herder":
        this.moveSpeed = Math.floor(90 * wm); this.hp = Math.floor(30 * wm); this.damage = Math.floor(8 * wm);
        this.attackRate = 700; this.setCircle(14, 2, 2);
        break;
      case "hunter":
        this.moveSpeed = Math.floor(55 * wm); this.hp = Math.floor(35 * wm); this.damage = Math.floor(12 * wm);
        this.attackRate = 1100; this.setCircle(14, 2, 2);
        break;
      case "sheeple":
        this.moveSpeed = Math.floor(50 * wm); this.hp = Math.floor(25 * wm); this.damage = Math.floor(4 * wm);
        this.attackRate = 1800; this.setCircle(15, 1, 1); this.expValue = 5;
        break;
      case "secretdog":
        this.moveSpeed = Math.floor(110 * wm); this.hp = Math.floor(80 * wm); this.damage = Math.floor(18 * wm);
        this.attackRate = 500; this.setCircle(12, 4, 4); this.expValue = 25;
        break;
      case "propagandist":
        this.moveSpeed = Math.floor(75 * wm); this.hp = Math.floor(60 * wm); this.damage = Math.floor(6 * wm);
        this.attackRate = 1300; this.setCircle(14, 2, 2); this.expValue = 20;
        break;
    }
    this.baseMoveSpeed = this.moveSpeed;
  }

  takeDamage(amount: number): void {
    this.hp -= amount;
    this.setAlpha(0.6);
    this.scene.time.addEvent({
      delay: 80,
      callback: () => { if (this.active) this.setAlpha(1); },
    });

    if (this.hp <= 0) {
      eventBus.emit("enemy-killed", { type: this.enemyType, x: this.x, y: this.y, exp: this.expValue });
      this.destroy();
    }
  }

  slow(multiplier: number, duration: number): void {
    this.slowAmount = multiplier;
    this.slowTimer = duration;
    this.moveSpeed = this.baseMoveSpeed * multiplier;
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (this.slowTimer > 0) {
      this.slowTimer -= delta;
      if (this.slowTimer <= 0) {
        this.slowAmount = 1;
        this.moveSpeed = this.baseMoveSpeed;
      }
    }

    const player = this.scene.children.getByName("player") as Player | null;
    if (!player || !player.active) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    if (this.enemyType === "sheeple" && dist < 100) {
      this.scene.physics.moveToObject(this, player, this.moveSpeed * 0.5);
    } else {
      this.scene.physics.moveToObject(this, player, this.moveSpeed);
    }

    this.attackCooldown -= delta;
    if (dist < 35 && this.attackCooldown <= 0) {
      this.attackCooldown = this.attackRate;
      player.takeDamage(this.damage);
      this.flashHit();
    }
  }

  private flashHit(): void {
    this.setAlpha(0.3);
    this.scene.time.addEvent({
      delay: 80,
      callback: () => { if (this.active) this.setAlpha(1); },
    });
  }
}
