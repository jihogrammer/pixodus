import * as Phaser from "phaser";
import { SkillManager } from "../skills/SkillManager";
import { SkillKey, SkillEffect } from "../skills/types";
import { eventBus } from "../EventBus";
import { UpgradeBonus, EMPTY_BONUS } from "../upgrades/types";

export class Player extends Phaser.Physics.Arcade.Sprite {
  speed = 200;
  fireRate = 400;
  projectileSpeed = 400;
  projectileDamage = 10;
  static readonly MAX_TARGET_RANGE = 250;

  hp = 100;
  maxHp = 100;
  mana = 100;
  maxMana = 100;
  manaRegen = 5;

  skillManager: SkillManager;
  private lastFireTime = 0;
  private fireTarget: Phaser.GameObjects.Group | null = null;
  private fireContainer: Phaser.GameObjects.Group | null = null;
  private activeBuffs: Map<string, { remaining: number }> = new Map();
  private awakeningActive = false;
  private facingRight = true;

  characterId: string;
  private upgradeBonuses: UpgradeBonus = { ...EMPTY_BONUS, critMultiplier: EMPTY_BONUS.critMultiplier };
  private baseHp = 100;
  private baseSpeed = 200;
  private baseFireRate = 400;
  private baseDamage = 10;
  private baseMana = 100;
  private baseManaRegen = 5;

  constructor(scene: Phaser.Scene, x: number, y: number, character = "snowball") {
    const texKey = `char_${character}`;
    super(scene, x, y, texKey, 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.characterId = character;
    this.setCollideWorldBounds(true);
    this.setOrigin(0.5, 0.5);
    this.setCircle(12, 4, 4);
    this.setDisplaySize(32, 32);

    this.skillManager = new SkillManager(character);
    this.applyCharacterStats(character);
    this.applyPassives();
  }

  private applyCharacterStats(character: string): void {
    switch (character) {
      case "boxer":
        this.baseHp = 150;
        this.baseSpeed = 160;
        this.baseFireRate = 500;
        this.baseDamage = 12;
        break;
      case "benjamin":
        this.baseHp = 80;
        this.baseSpeed = 230;
        this.baseFireRate = 380;
        this.baseDamage = 8;
        break;
      case "napoleon":
        this.baseHp = 100;
        this.baseSpeed = 180;
        this.baseFireRate = 400;
        this.baseDamage = 11;
        this.baseMana = 130;
        this.baseManaRegen = 7;
        break;
      case "mollie":
        this.baseHp = 70;
        this.baseSpeed = 260;
        this.baseFireRate = 350;
        this.baseDamage = 9;
        break;
      case "sheep":
        this.baseHp = 90;
        this.baseSpeed = 170;
        this.baseFireRate = 450;
        this.baseDamage = 10;
        break;
      case "snowball":
      default:
        this.baseHp = 100;
        this.baseSpeed = 190;
        this.baseFireRate = 380;
        this.baseDamage = 10;
        break;
    }
    this.hp = this.baseHp;
    this.maxHp = this.baseHp;
    this.speed = this.baseSpeed;
    this.fireRate = this.baseFireRate;
    this.projectileDamage = this.baseDamage;
    this.mana = this.baseMana;
    this.maxMana = this.baseMana;
    this.manaRegen = this.baseManaRegen;
  }

  applyUpgradeBonuses(bonuses: UpgradeBonus): void {
    this.upgradeBonuses = bonuses;

    const prevMaxHp = this.maxHp;
    this.maxHp = Math.floor(this.baseHp * bonuses.maxHp);
    this.speed = Math.floor(this.baseSpeed * bonuses.moveSpeed);
    this.fireRate = Math.max(100, Math.floor(this.baseFireRate / bonuses.attackSpeed));
    this.projectileDamage = Math.floor(this.baseDamage * bonuses.attackDamage);
    this.maxMana = Math.floor(this.baseMana * bonuses.manaRegen);
    this.manaRegen = this.baseManaRegen * bonuses.manaRegen;

    if (this.maxHp > prevMaxHp) {
      this.hp += this.maxHp - prevMaxHp;
    }
    this.hp = Math.min(this.hp, this.maxHp);

    eventBus.emit("stats-update", { hp: this.hp, maxHp: this.maxHp, mana: this.mana, maxMana: this.maxMana });
  }

  kill(): void {
    this.activeBuffs.clear();
    this.awakeningActive = false;
    this.mana = 0;
  }

  takeDamage(amount: number): void {
    if (!this.active) return;
    this.hp -= amount;
    this.setAlpha(0.5);
    this.scene.time.addEvent({
      delay: 100,
      callback: () => { if (this.active) this.setAlpha(1); },
    });

    eventBus.emit("player-damage", amount);
    eventBus.emit("stats-update", { hp: this.hp, maxHp: this.maxHp, mana: this.mana, maxMana: this.maxMana });

    if (this.hp <= 0) {
      this.hp = 0;
      eventBus.emit("player-death", {});
      this.setActive(false);
      this.setVisible(false);
    }
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    eventBus.emit("stats-update", { hp: this.hp, maxHp: this.maxHp, mana: this.mana, maxMana: this.maxMana });
  }

  useSkill(key: SkillKey): SkillEffect | null {
    const effect = this.skillManager.tryUseSkill(key);
    if (!effect) return null;

    const activeDef = this.skillManager.getActiveSkillDef(key);
    if (!activeDef) return null;

    if (this.mana < activeDef.baseManaCost) return null;
    this.mana -= activeDef.baseManaCost;

    this.applySkillEffect(effect);
    this.showSkillEffect(key, effect);
    eventBus.emit("skill-cooldowns", this.getAllSkillCooldowns());
    eventBus.emit("stats-update", { hp: this.hp, maxHp: this.maxHp, mana: this.mana, maxMana: this.maxMana });
    return effect;
  }

  private showSkillEffect(key: SkillKey, effect: SkillEffect): void {
    const def = this.skillManager.getActiveSkillDef(key);
    const colorMap: Record<string, number> = {
      Q: 0x4a90d9,
      W: 0x50c878,
      E: 0xff6600,
      R: 0xff0044,
    };
    const color = colorMap[key] ?? 0xffffff;

    const ring = this.scene.add.circle(this.x, this.y, 20, color, 0.3);
    ring.setDepth(50);
    this.scene.tweens.add({
      targets: ring,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 400,
      onComplete: () => ring.destroy(),
    });
  }

  private applySkillEffect(effect: SkillEffect): void {
    switch (effect.type) {
      case "dash":
        this.performDash(effect);
        break;
      case "buff":
        this.applyBuff(effect);
        break;
      case "heal":
        this.heal(effect.value);
        break;
    }
  }

  private performDash(effect: SkillEffect): void {
    const angle = this.rotation || 0;
    const dx = Math.cos(angle) * effect.value;
    const dy = Math.sin(angle) * effect.value;
    const targetX = Phaser.Math.Clamp(this.x + dx, 20, this.scene.scale.width * 2 - 20);
    const targetY = Phaser.Math.Clamp(this.y + dy, 20, this.scene.scale.height * 2 - 20);

    this.setAlpha(0.4);
    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      duration: 150,
      ease: "Power2",
      onComplete: () => { if (this.active) this.setAlpha(1); },
    });
  }

  private applyBuff(effect: SkillEffect): void {
    const key = effect.type;
    this.activeBuffs.set(key, { remaining: effect.duration ?? 3000 });

    if (effect.summonType === "awakening") {
      this.awakeningActive = true;
    }
  }

  private applyPassives(): void {
    const bonuses = this.skillManager.getPassiveBonuses();
    if (bonuses.max_hp) {
      const bonus = 1 + bonuses.max_hp / 100;
      this.maxHp = Math.floor(this.maxHp * bonus);
      this.hp = this.maxHp;
      this.mana = this.maxMana;
    }
  }

  updateMana(delta: number): void {
    this.mana = Math.min(this.maxMana, this.mana + this.manaRegen * (delta / 1000));
  }

  updateBuffs(delta: number): void {
    for (const [key, buff] of this.activeBuffs) {
      buff.remaining -= delta;
      if (buff.remaining <= 0) {
        this.activeBuffs.delete(key);
        if (key === "awakening") {
          this.awakeningActive = false;
        }
      }
    }
  }

  startAttacking(enemies: Phaser.GameObjects.Group, projectiles: Phaser.GameObjects.Group): void {
    this.fireTarget = enemies;
    this.fireContainer = projectiles;
  }

  stopAttacking(): void {
    this.fireTarget = null;
    this.fireContainer = null;
  }

  updateFire(time: number): void {
    const effectiveFireRate = this.awakeningActive ? Math.floor(this.fireRate * 0.25) : this.fireRate;
    if (this.fireTarget && this.fireContainer && time - this.lastFireTime > effectiveFireRate) {
      this.fire(this.fireTarget, this.fireContainer);
      this.lastFireTime = time;
    }
  }

  update(time: number, delta: number): void {
    this.updateFire(time);
    this.updateMana(delta);
    this.updateBuffs(delta);
    this.skillManager.update(delta, time);
  }

  private fire(enemies: Phaser.GameObjects.Group, projectiles: Phaser.GameObjects.Group): void {
    const children = enemies.getChildren();
    if (children.length === 0) return;

    let nearest: Phaser.GameObjects.GameObject | null = null;
    let minDist = Infinity;

    children.forEach((child) => {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      if (!enemy.active) return;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
      if (dist < minDist && dist < Player.MAX_TARGET_RANGE) {
        minDist = dist;
        nearest = enemy;
      }
    });

    if (!nearest) return;

    const enemy = nearest as Phaser.Physics.Arcade.Sprite;
    const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);

    const projSpeed = this.projectileSpeed * (this.upgradeBonuses.projectileSpeed ?? 1);
    const pierceCount = this.upgradeBonuses.projectilePierce ?? 0;
    const isCrit = Math.random() < (this.upgradeBonuses.critChance ?? 0);
    const dmg = this.projectileDamage * (isCrit ? (this.upgradeBonuses.critMultiplier ?? 1.5) : 1);

    // 메인 발사체
    this.fireSingle(projectiles, baseAngle, projSpeed, dmg, pierceCount);

    // 전방 추가 사격
    for (let i = 0; i < (this.upgradeBonuses.extraShotsFront ?? 0); i++) {
      const spread = 0.1 + i * 0.08;
      if (i % 2 === 0) {
        this.fireSingle(projectiles, baseAngle + spread * ((i >> 1) + 1), projSpeed, dmg, pierceCount);
      } else {
        this.fireSingle(projectiles, baseAngle - spread * ((i >> 1) + 1), projSpeed, dmg, pierceCount);
      }
    }

    // 후방 사격
    for (let i = 0; i < (this.upgradeBonuses.extraShotsBack ?? 0); i++) {
      const backAngle = baseAngle + Math.PI;
      const spread = 0.15 * i;
      this.fireSingle(projectiles, backAngle + (i % 2 === 0 ? spread : -spread), projSpeed, dmg, pierceCount);
    }

    // 대각선 사격
    for (let i = 0; i < (this.upgradeBonuses.extraShotsDiagonal ?? 0); i++) {
      const offset = (Math.PI / 4) * (i % 2 === 0 ? 1 : -1) * (Math.floor(i / 2) + 1);
      this.fireSingle(projectiles, baseAngle + offset, projSpeed, dmg, pierceCount);
    }
  }

  private fireSingle(
    projectiles: Phaser.GameObjects.Group,
    angle: number,
    speed: number,
    damage: number,
    pierce: number,
  ): void {
    const proj = this.scene.physics.add.sprite(this.x, this.y, "projectile");
    proj.setDepth(10);
    proj.setData("damage", damage);
    proj.setData("pierce", pierce);

    const body = proj.body as Phaser.Physics.Arcade.Body;
    body.setCircle(4);
    body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    projectiles.add(proj);

    this.scene.time.addEvent({
      delay: 2000,
      callback: () => { if (proj.active) proj.destroy(); },
    });
  }

  getAllSkillCooldowns(): Record<string, { remaining: number; total: number }> {
    const result: Record<string, { remaining: number; total: number }> = {};
    for (const key of ["Q", "W", "E", "R"] as SkillKey[]) {
      result[key] = {
        remaining: this.skillManager.getSkillCooldown(key),
        total: this.skillManager.getSkillTotalCooldown(key),
      };
    }
    return result;
  }
}
