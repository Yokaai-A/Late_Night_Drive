"use client";

import GameScene from "@/components/scene/GameScene";

export default function Home() {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        background: "#111",
      }}
    >
      <GameScene />
    </main>
  );
}