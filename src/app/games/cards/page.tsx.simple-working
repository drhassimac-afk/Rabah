"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, RotateCcw } from "lucide-react";

type Card = {
  symbol: string;
  name: string;
  value: number;
};

const cards: Card[] = [
  { symbol: "🂡", name: "آس", value: 11 },
  { symbol: "🂢", name: "اثنان", value: 2 },
  { symbol: "🂣", name: "ثلاثة", value: 3 },
  { symbol: "🂤", name: "أربعة", value: 4 },
  { symbol: "🂥", name: "خمسة", value: 5 },
  { symbol: "🂦", name: "ستة", value: 6 },
  { symbol: "🂧", name: "سبعة", value: 7 },
  { symbol: "🂨", name: "ثمانية", value: 8 },
  { symbol: "🂩", name: "تسعة", value: 9 },
  { symbol: "🂪", name: "عشرة", value: 10 },
];

export default function CardsPage() {
  const router = useRouter();

  const [drawnCards, setDrawnCards] = useState<Card[]>([]);
  const [score, setScore] = useState(0);

  const drawCard = () => {
    const availableCards = cards.filter(
      (card) => !drawnCards.some((drawn) => drawn.name === card.name),
    );

    if (availableCards.length === 0) return;

    const randomCard =
      availableCards[Math.floor(Math.random() * availableCards.length)];

    setDrawnCards((previous) => [...previous, randomCard]);
    setScore((previous) => previous + randomCard.value);
  };

  const resetGame = () => {
    setDrawnCards([]);
    setScore(0);
  };

  const currentCard = drawnCards[drawnCards.length - 1];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4" dir="rtl">
      <div className="max-w-md mx-auto pt-8">
        <button
          onClick={() => router.push("/games")}
          className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-8"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">🃏 لعبة الورق</h1>

          <div className="text-sm text-slate-400">
            النقاط: <span className="text-red-400 font-bold">{score}</span>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 text-center">
          <div className="min-h-[260px] flex items-center justify-center">
            {currentCard ? (
              <div className="bg-white text-slate-900 rounded-3xl w-44 h-64 flex flex-col items-center justify-center shadow-2xl">
                <div className="text-7xl mb-4">{currentCard.symbol}</div>

                <div className="text-2xl font-bold">{currentCard.name}</div>

                <div className="text-slate-500 mt-2">
                  قيمة البطاقة: {currentCard.value}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-7xl mb-4">🃏</div>

                <p className="text-slate-400">اضغط على الزر لسحب بطاقة</p>
              </div>
            )}
          </div>

          <button
            onClick={drawCard}
            disabled={drawnCards.length === cards.length}
            className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold mt-4"
          >
            {drawnCards.length === cards.length
              ? "انتهت البطاقات"
              : "🃏 سحب بطاقة"}
          </button>

          <button
            onClick={resetGame}
            className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 font-bold mt-3 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            إعادة اللعبة
          </button>
        </div>

        <div className="mt-5 text-center text-sm text-slate-500">
          البطاقات المسحوبة: {drawnCards.length} / {cards.length}
        </div>
      </div>
    </main>
  );
}
