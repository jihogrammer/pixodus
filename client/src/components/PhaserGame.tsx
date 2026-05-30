"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UpgradeDef } from "@/game/upgrades/types";
import { UpgradeSelectOverlay } from "@/components/UpgradeSelect";

interface SkillHudItem {
  key: string;
  remaining: number;
  total: number;
}

interface GameHudProps {
  wave: number;
  score: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  skills: SkillHudItem[];
  ideaFragments: number;
}

interface GameOverData {
  wave: number;
  score: number;
  kills: number;
  chapterId: number;
  fragments: number;
}

const CUSTOM_MESSAGES: Record<string, string[]> = {
  "enemy-killed": ["핵심을 찔렀어!", "정확해!", "동물농장의 적이다!"],
  "wave-cleared": ["이 파도는 넘었다.", "다음은 더 거세다.", "혁명은 계속된다."],
};

function GameHud({ wave, score, health, maxHealth, mana, maxMana, skills, ideaFragments }: GameHudProps) {
  const hpPercent = Math.max(0, (health / maxHealth) * 100);
  const mpPercent = Math.max(0, (mana / maxMana) * 100);

  return (
    <div className="game-hud">
      <div className="hud-top">
        <span className="hud-wave">웨이브 {wave}</span>
        <span className="hud-score">{score} 점</span>
        <span className="hud-idea">이데아 {ideaFragments}</span>
        <span className="hud-idea-hint">100모아 합성</span>
      </div>
      <div className="hud-bars">
        <div className="hud-hp-bar">
          <div className="hud-hp-fill" style={{ width: `${hpPercent}%` }} />
        </div>
        <div className="hud-mp-bar">
          <div className="hud-mp-fill" style={{ width: `${mpPercent}%` }} />
        </div>
      </div>
      <div className="hud-skills">
        {skills.map((skill) => {
          const pct = skill.total > 0 ? (skill.remaining / skill.total) * 100 : 0;
          const ready = skill.remaining === 0;
          return (
            <div key={skill.key} className={`hud-skill ${ready ? "ready" : ""}`}>
              <span className="hud-skill-key">{skill.key}</span>
              {!ready && <div className="hud-skill-cd-fill" style={{ height: `${pct}%` }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GameOverOverlay({ data, onRestart, onLobby }: {
  data: GameOverData;
  onRestart: () => void;
  onLobby: () => void;
}) {
  const chapterNames = ["", "혁명", "건설", "배신", "해방"];
  return (
    <div className="game-over-overlay">
      <div className="game-over-box">
        <h2 className="game-over-title">혁명은 실패했다</h2>
        <p className="game-over-sub">제{data.chapterId}장 &quot;{chapterNames[data.chapterId] ?? ""}&quot;</p>
        <div className="game-over-stats">
          <div className="go-stat">
            <span className="go-stat-label">도달 웨이브</span>
            <span className="go-stat-value">{data.wave}</span>
          </div>
          <div className="go-stat">
            <span className="go-stat-label">점수</span>
            <span className="go-stat-value">{data.score}</span>
          </div>
          <div className="go-stat">
            <span className="go-stat-label">처치</span>
            <span className="go-stat-value">{data.kills}마리</span>
          </div>
          <div className="go-stat">
            <span className="go-stat-label">획득 이데아</span>
            <span className="go-stat-value">+{data.fragments}</span>
          </div>
        </div>
        <div className="game-over-btns">
          <button className="go-btn go-btn-primary" onClick={onRestart}>
            다시 시도
          </button>
          <button className="go-btn" onClick={onLobby}>
            로비로
          </button>
        </div>
      </div>
    </div>
  );
}

function PhaserGameInner({ char }: { char: string }) {
  const router = useRouter();
  const [hud, setHud] = useState<GameHudProps>({
    wave: 0,
    score: 0,
    health: 100,
    maxHealth: 100,
    mana: 100,
    maxMana: 100,
    skills: [
      { key: "Q", remaining: 0, total: 1 },
      { key: "W", remaining: 0, total: 1 },
      { key: "E", remaining: 0, total: 1 },
      { key: "R", remaining: 0, total: 1 },
    ],
    ideaFragments: 0,
  });
  const [floatMsg, setFloatMsg] = useState<{ id: number; text: string } | null>(null);
  const [toastMsg, setToastMsg] = useState<{ id: number; text: string } | null>(null);
  const [gameOver, setGameOver] = useState<GameOverData | null>(null);
  const [upgradeChoices, setUpgradeChoices] = useState<UpgradeDef[]>([]);
  const msgCounter = useRef(0);
  const initialized = useRef(false);
  const eventBusRef = useRef<{ emit: (event: string, ...args: unknown[]) => void } | null>(null);

  const handleRestart = () => {
    window.location.reload();
  };

  const handleLobby = () => {
    router.push("/");
  };

  const handleUpgradeSelect = (def: UpgradeDef) => {
    setUpgradeChoices([]);
    eventBusRef.current?.emit("upgrade-selected", def);
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const showFloat = (text: string) => {
      const id = ++msgCounter.current;
      setFloatMsg({ id, text });
      setTimeout(() => setFloatMsg((prev) => (prev?.id === id ? null : prev)), 1200);
    };

    const showToast = (text: string) => {
      const id = ++msgCounter.current;
      setToastMsg({ id, text });
      setTimeout(() => setToastMsg((prev) => (prev?.id === id ? null : prev)), 2000);
    };

    const initPhaser = async () => {
      const { gameConfig, setSelectedCharacter } = await import("@/game/config");
      const { eventBus } = await import("@/game/EventBus");
      eventBusRef.current = eventBus;
      setSelectedCharacter(char);

      eventBus.on("wave-start", (wave: unknown) => {
        setHud((prev) => ({ ...prev, wave: wave as number }));
      });

      eventBus.on("wave-cleared", (data: unknown) => {
        const d = data as { wave: number; chapterId: number };
        showToast(`웨이브 ${d.wave} 클리어! 혁명은 계속된다.`);
      });

      eventBus.on("chapter-complete", (data: unknown) => {
        const d = data as { chapterId: number; score: number };
        showToast(`${d.chapterId}장 클리어! "모든 동물은 평등하다"`);
      });

      eventBus.on("score-update", (score: unknown) => {
        setHud((prev) => ({ ...prev, score: score as number }));
      });

      eventBus.on("player-damage", (amount: unknown) => {
        setHud((prev) => ({
          ...prev,
          health: Math.max(0, prev.health - (amount as number)),
        }));
      });

      eventBus.on("player-death", () => {
        showToast("혁명은 실패했다. 다시 시도하시겠습니까?");
      });

      eventBus.on("game-over", (data: unknown) => {
        const d = data as GameOverData;
        setGameOver(d);
      });

      eventBus.on("stats-update", (stats: unknown) => {
        const s = stats as { hp: number; maxHp: number; mana: number; maxMana: number };
        setHud((prev) => ({
          ...prev,
          health: s.hp,
          maxHealth: s.maxHp,
          mana: s.mana,
          maxMana: s.maxMana,
        }));
      });

      eventBus.on("skill-cooldowns", (cooldowns: unknown) => {
        const cd = cooldowns as Record<string, { remaining: number; total: number }>;
        setHud((prev) => ({
          ...prev,
          skills: [
            { key: "Q", remaining: cd.Q?.remaining ?? 0, total: cd.Q?.total ?? 1 },
            { key: "W", remaining: cd.W?.remaining ?? 0, total: cd.W?.total ?? 1 },
            { key: "E", remaining: cd.E?.remaining ?? 0, total: cd.E?.total ?? 1 },
            { key: "R", remaining: cd.R?.remaining ?? 0, total: cd.R?.total ?? 1 },
          ],
        }));
      });

      eventBus.on("idea-fragments", (amount: unknown) => {
        setHud((prev) => ({ ...prev, ideaFragments: prev.ideaFragments + (amount as number) }));
      });

      eventBus.on("enemy-killed", () => {
        if (Math.random() < 0.15) {
          const msgs = CUSTOM_MESSAGES["enemy-killed"];
          showFloat(msgs[Math.floor(Math.random() * msgs.length)]);
        }
      });

      eventBus.on("boss-spawned", (data: unknown) => {
        const d = data as { chapterId: number };
        const bossNames = ["농부 존스", "프레드릭", "나폴레옹"];
        showToast(`${bossNames[d.chapterId - 1] ?? "보스"} 등장! "두 다리로 걷는 자가 나타났다"`);
      });

      eventBus.on("upgrade-select", (choices: unknown) => {
        setUpgradeChoices(choices as UpgradeDef[]);
      });

      const Phaser = await import("phaser");
      new Phaser.Game(gameConfig);
    };

    initPhaser().catch(console.error);
  }, []);

  return (
    <>
      {!gameOver && <GameHud {...hud} />}
      {floatMsg && <div className="float-msg" key={floatMsg.id}>{floatMsg.text}</div>}
      {toastMsg && <div className="toast-msg" key={toastMsg.id}>{toastMsg.text}</div>}
      {gameOver && (
        <GameOverOverlay
          data={gameOver}
          onRestart={handleRestart}
          onLobby={handleLobby}
        />
      )}
      {upgradeChoices.length > 0 && (
        <UpgradeSelectOverlay
          choices={upgradeChoices}
          onSelect={handleUpgradeSelect}
        />
      )}
    </>
  );
}

export function PhaserGame() {
  const [char, setChar] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setChar(params.get("char") ?? "snowball");
  }, []);

  return (
    <div className="game-wrapper">
      <div id="game-container" />
      {char && <PhaserGameInner char={char} />}
    </div>
  );
}
