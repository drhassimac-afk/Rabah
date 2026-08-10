"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Gamepad2, Users, Trophy, Star } from "lucide-react";

export default function GamesPage() {
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games = [
    {
      id: "tic-tac-toe",
      name: "إكس أو",
      icon: "⭕",
      players: 234,
      rating: 4.5,
      description: "اللعبة الكلاسيكية للاعبين",
      color: "from-blue-600 to-blue-800",
    },
    {
      id: "memory",
      name: "ذاكرة",
      icon: "🧠",
      players: 156,
      rating: 4.2,
      description: "اختبر ذاكرتك",
      color: "from-purple-600 to-purple-800",
    },
    {
      id: "quiz",
      name: "مسابقة",
      icon: "❓",
      players: 89,
      rating: 4.7,
      description: "أسئلة عامة",
      color: "from-green-600 to-green-800",
    },
    {
      id: "cards",
      name: "ورق",
      icon: "🃏",
      players: 67,
      rating: 4.3,
      description: "ألعاب الورق",
      color: "from-red-600 to-red-800",
    },
  ];

  const leaderboard = [
    { rank: 1, name: "أحمد", score: 12500, avatar: "👨" },
    { rank: 2, name: "سارة", score: 11200, avatar: "👩" },
    { rank: 3, name: "محمد", score: 10800, avatar: "👨‍💼" },
    { rank: 4, name: "فاطمة", score: 9500, avatar: "👩‍🎓" },
  ];

  const currentGame = games.find((game) => game.id === selectedGame);

  if (selectedGame && currentGame) {
    return (
      <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
        <header className="h-16 border-b border-slate-800 flex items-center px-4">
          <button
            onClick={() => {
              if (currentGame?.id === "tic-tac-toe") {
                router.push("/games/tic-tac-toe");
                return;
              }

              if (currentGame?.id === "memory") {
                router.push("/games/memory");
                return;
              }

              setSelectedGame(currentGame.id);
            }}
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <h1 className="flex-1 text-center font-bold text-lg">
            {currentGame.name}
          </h1>

          <div className="w-10" />
        </header>

        <main className="flex-1 flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
          <div className="glass rounded-3xl p-8 text-center max-w-md w-full">
            <span className="text-6xl mb-4 block">{currentGame.icon}</span>

            <h2 className="text-2xl font-bold text-white mb-4">قريباً!</h2>

            <p className="text-slate-400">اللعبة قيد التطوير</p>

            <button
              onClick={() => setSelectedGame(null)}
              className="mt-6 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-white rounded-full font-bold transition-colors"
            >
              العودة للألعاب
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <header className="h-16 border-b border-slate-800 flex items-center px-4">
        <button
          onClick={() => router.push("/home")}
          className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="flex-1 flex items-center justify-center gap-2">
          <Gamepad2 className="w-6 h-6 text-yellow-400" />
          <h1 className="font-bold text-lg">ألعاب</h1>
        </div>

        <div className="w-10" />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="glass rounded-2xl p-4 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">546</p>
            <p className="text-slate-400 text-sm">لاعب نشط</p>
          </div>

          <div className="glass rounded-2xl p-4 text-center">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">12</p>
            <p className="text-slate-400 text-sm">لعبة متاحة</p>
          </div>
        </div>

        <h2 className="text-white font-bold text-lg mb-4">الألعاب المتاحة</h2>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => {
                if (game.id === "tic-tac-toe") {
                  router.push("/games/tic-tac-toe");
                } else if (game.id === "memory") {
                  router.push("/games/memory");
                } else {
                  setSelectedGame(game.id);
                }
              }}
              className="glass rounded-2xl p-4 text-center hover:bg-slate-800/50 transition-colors group"
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}
              >
                <span className="text-3xl">{game.icon}</span>
              </div>

              <h3 className="text-white font-bold mb-1">{game.name}</h3>

              <p className="text-slate-400 text-xs mb-2">{game.description}</p>

              <div className="flex items-center justify-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {game.players}
                </span>

                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                  {game.rating}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="text-white font-bold">المتصدرون</h2>
          </div>

          <div className="space-y-3">
            {leaderboard.map((player) => (
              <div
                key={player.rank}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40"
              >
                <div className="w-8 text-center font-bold text-yellow-400">
                  #{player.rank}
                </div>

                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl">
                  {player.avatar}
                </div>

                <div className="flex-1">
                  <p className="text-white font-semibold">{player.name}</p>
                  <p className="text-slate-500 text-xs">النقاط</p>
                </div>

                <div className="text-yellow-400 font-bold">
                  {player.score.toLocaleString("ar-DZ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
