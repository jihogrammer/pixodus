"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const CHARACTERS = [
  {
    id: "snowball",
    name: "스노볼",
    desc: "전략가 돼지 — 7번째 공격마다 2배 데미지",
    class: "전략가",
    unlocked: true,
  },
  {
    id: "boxer",
    name: "복서",
    desc: "충직한 말 — HP 50% 이하 시 공격력 50% 증가",
    class: "탱커",
    unlocked: true,
  },
  {
    id: "benjamin",
    name: "벤자민",
    desc: "냉소적 당나귀 — 회피 시 2초 무적",
    class: "회피",
    unlocked: true,
  },
  {
    id: "napoleon",
    name: "나폴레옹",
    desc: "독재자 돼지 — 적 처치 시 공격력 중첩",
    class: "권력",
    unlocked: false,
  },
  {
    id: "mollie",
    name: "몰리",
    desc: "도망자 암말 — 적 처치 시 HP 회복",
    class: "회복",
    unlocked: false,
  },
  {
    id: "sheep",
    name: "양 (Sheeple)",
    desc: "세뇌된 민중 — 주변 적 스턴",
    class: "히든",
    unlocked: false,
  },
];

export default function HomePage() {
  const router = useRouter();
  const [selected, setSelected] = useState("snowball");
  const [showSelect, setShowSelect] = useState(false);

  const handleStart = () => {
    router.push(`/game?char=${selected}`);
  };

  return (
    <main className="menu-screen">
      <h1 className="game-title">PIXODUS</h1>
      <p className="subtitle">동물농장 탈출</p>

      {!showSelect ? (
        <nav className="menu-nav">
          <button className="menu-btn" onClick={() => setShowSelect(true)}>
            캐릭터 선택
          </button>
          <button className="menu-btn" onClick={handleStart}>
            게임 시작
          </button>
          <button className="menu-btn" disabled>
            설정
          </button>
        </nav>
      ) : (
        <div className="char-select">
          <div className="char-grid">
            {CHARACTERS.map((char) => (
              <button
                key={char.id}
                className={`char-card ${selected === char.id ? "selected" : ""} ${!char.unlocked ? "locked" : ""}`}
                onClick={() => char.unlocked && setSelected(char.id)}
                disabled={!char.unlocked}
              >
                <div className="char-name">{char.name}</div>
                <div className="char-class">{char.class}</div>
                <div className="char-desc">{char.desc}</div>
                {!char.unlocked && <div className="char-lock">🔒 미해금</div>}
              </button>
            ))}
          </div>
          <div className="menu-nav" style={{ marginTop: 12 }}>
            <button className="menu-btn" onClick={handleStart}>
              {CHARACTERS.find((c) => c.id === selected)?.name ?? "선택"} (으)로 시작
            </button>
            <button className="menu-btn" onClick={() => setShowSelect(false)}>
              뒤로
            </button>
          </div>
        </div>
      )}

      <p className="version">v0.2.0 — Alpha</p>
    </main>
  );
}
