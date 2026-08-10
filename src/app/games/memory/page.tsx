"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Copy,
  LogIn,
  Plus,
  RotateCcw,
  Send,
  Trophy,
  Users,
} from "lucide-react";

type Player = "X" | "O";

type Room = {
  id: number;
  code: string;
  playerX: string | null;
  playerO: string | null;
  board: string[];
  matchedPairs: number[];
  flippedCards: number[];
  currentPlayer: Player;
  scores: { X: number; O: number };
  status: "waiting" | "playing" | "finished";
  winner: Player | "draw" | null;
};

const CARD_BACK = "❔";

export default function MemoryPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"menu" | "join" | "game">("menu");
  const [playerName, setPlayerName] = useState("Rabah");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("rabah_game_player");

    if (saved) {
      setPlayerName(saved);
    }
  }, []);

  useEffect(() => {
    if (playerName.trim()) {
      localStorage.setItem("rabah_game_player", playerName.trim());
    }
  }, [playerName]);

  useEffect(() => {
    if (!room?.code) return;

    const poll = async () => {
      try {
        const response = await fetch(
          `/api/games/memory/rooms?code=${encodeURIComponent(room.code)}`,
          { cache: "no-store" }
        );

        if (!response.ok) return;

        const data = await response.json();

        if (data.success && data.room) {
          setRoom(data.room);
        }
      } catch {
        // تجاهل أخطاء الاتصال المؤقتة
      }
    };

    poll();

    const interval = setInterval(poll, 1000);

    return () => clearInterval(interval);
  }, [room?.code]);

  const createRoom = async () => {
    const name = playerName.trim();

    if (!name) {
      setError("اكتب اسم اللاعب أولاً");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/games/memory/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create",
          player: name,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "تعذر إنشاء الغرفة");
      }

      setRoom(data.room);
      setMyPlayer(data.player);
      setMode("game");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    const name = playerName.trim();
    const code = roomCodeInput.trim().toUpperCase();

    if (!name) {
      setError("اكتب اسم اللاعب أولاً");
      return;
    }

    if (!code) {
      setError("اكتب رمز الغرفة");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/games/memory/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "join",
          code,
          player: name,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "تعذر الانضمام إلى الغرفة");
      }

      setRoom(data.room);
      setMyPlayer(data.player);
      setMode("game");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const flipCard = async (index: number) => {
    if (!room || !myPlayer || busy) return;
    if (room.status !== "playing") return;
    if (room.currentPlayer !== myPlayer) return;
    if (room.matchedPairs.includes(index)) return;
    if (room.flippedCards.includes(index)) return;
    if (room.flippedCards.length >= 2) return;

    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/games/memory/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "flip",
          code: room.code,
          player: myPlayer,
          index,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "تعذر كشف البطاقة");
      }

      setRoom(data.room);

      if (data.room.flippedCards.length === 2) {
        setTimeout(async () => {
          try {
            const hideResponse = await fetch(
              "/api/games/memory/rooms",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  action: "hide",
                  code: room.code,
                }),
              }
            );

            const hideData = await hideResponse.json();

            if (hideResponse.ok && hideData.success) {
              setRoom(hideData.room);
            }
          } catch {
            // polling سيعيد الحالة
          } finally {
            setBusy(false);
          }
        }, 1200);
      } else {
        setBusy(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
      setBusy(false);
    }
  };

  const resetGame = async () => {
    if (!room) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/games/memory/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reset",
          code: room.code,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "تعذر إعادة اللعبة");
      }

      setRoom(data.room);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!room) return;

    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);

      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError(`رمز الغرفة: ${room.code}`);
    }
  };

  const leaveGame = () => {
    setRoom(null);
    setMyPlayer(null);
    setRoomCodeInput("");
    setError("");
    setMode("menu");
  };

  const cardVisible = (index: number) => {
    if (!room) return false;

    return (
      room.flippedCards.includes(index) ||
      room.matchedPairs.includes(index)
    );
  };

  if (mode === "menu") {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-950 text-white p-4"
      >
        <div className="max-w-md mx-auto pt-8">
          <button
            onClick={() => router.push("/games")}
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-8"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="glass rounded-3xl p-6 text-center">
            <div className="text-6xl mb-4">🧠</div>

            <h1 className="text-3xl font-bold mb-2">
              لعبة الذاكرة
            </h1>

            <p className="text-slate-400 mb-6">
              العب مع لاعب آخر أونلاين
            </p>

            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="اسم اللاعب"
              maxLength={100}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 mb-4 outline-none focus:border-purple-500"
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={createRoom}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 font-bold flex items-center justify-center gap-2 mb-3"
            >
              <Plus className="w-5 h-5" />
              {loading ? "جارٍ الإنشاء..." : "إنشاء غرفة"}
            </button>

            <button
              onClick={() => {
                setError("");
                setMode("join");
              }}
              className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 font-bold flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              الانضمام إلى غرفة
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (mode === "join") {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-950 text-white p-4"
      >
        <div className="max-w-md mx-auto pt-8">
          <button
            onClick={() => setMode("menu")}
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-8"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="glass rounded-3xl p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">
              الانضمام إلى غرفة
            </h1>

            <input
              value={roomCodeInput}
              onChange={(e) =>
                setRoomCodeInput(e.target.value.toUpperCase())
              }
              placeholder="رمز الغرفة"
              maxLength={8}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 mb-3 text-center tracking-widest uppercase outline-none focus:border-purple-500"
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 mb-4 text-sm text-center">
                {error}
              </div>
            )}

            <button
              onClick={joinRoom}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 font-bold"
            >
              {loading ? "جارٍ الدخول..." : "دخول"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!room || !myPlayer) return null;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 text-white p-4"
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={leaveGame}
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <h1 className="text-2xl font-bold">
            🧠 الذاكرة
          </h1>

          <button
            onClick={copyCode}
            className="px-3 py-2 rounded-xl bg-slate-800 text-sm flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            {copied ? "تم النسخ" : room.code}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div
            className={`rounded-2xl p-4 text-center border ${
              myPlayer === "X"
                ? "border-purple-500 bg-purple-500/10"
                : "border-slate-800 bg-slate-900"
            }`}
          >
            <div className="text-sm text-slate-400">
              X — {room.playerX || "انتظر..."}
            </div>
            <div className="text-3xl font-bold">
              {room.scores.X}
            </div>
          </div>

          <div
            className={`rounded-2xl p-4 text-center border ${
              myPlayer === "O"
                ? "border-purple-500 bg-purple-500/10"
                : "border-slate-800 bg-slate-900"
            }`}
          >
            <div className="text-sm text-slate-400">
              O — {room.playerO || "انتظر..."}
            </div>
            <div className="text-3xl font-bold">
              {room.scores.O}
            </div>
          </div>
        </div>

        {room.status === "waiting" && (
          <div className="rounded-2xl bg-yellow-500/10 border border-yellow-500/30 p-4 text-center mb-4">
            <Users className="w-6 h-6 mx-auto mb-2" />
            انتظر اللاعب الثاني...
            <div className="text-sm text-slate-400 mt-2">
              رمز الغرفة: {room.code}
            </div>
          </div>
        )}

        {room.status === "playing" && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 text-center mb-4">
            {room.currentPlayer === myPlayer
              ? "🎯 دورك الآن"
              : `⏳ دور اللاعب ${room.currentPlayer}`}
          </div>
        )}

        {room.status === "finished" && (
          <div className="rounded-2xl bg-purple-500/10 border border-purple-500/30 p-5 text-center mb-4">
            <Trophy className="w-10 h-10 mx-auto mb-2" />

            <div className="text-xl font-bold">
              {room.winner === "draw"
                ? "تعادل!"
                : room.winner === myPlayer
                  ? "🎉 فزت!"
                  : "انتهت اللعبة"}
            </div>

            <button
              onClick={resetGame}
              disabled={loading}
              className="mt-4 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" />
              إعادة اللعبة
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 mb-4 text-center text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-4 gap-3">
          {room.board.map((symbol, index) => {
            const visible = cardVisible(index);
            const matched = room.matchedPairs.includes(index);

            return (
              <button
                key={index}
                onClick={() => flipCard(index)}
                disabled={
                  busy ||
                  !visible &&
                    (room.status !== "playing" ||
                      room.currentPlayer !== myPlayer)
                }
                className={`aspect-square rounded-2xl text-4xl sm:text-5xl flex items-center justify-center border transition-all duration-300 ${
                  matched
                    ? "bg-green-500/20 border-green-500/50 scale-95"
                    : visible
                      ? "bg-purple-600/20 border-purple-500 rotate-0"
                      : "bg-slate-800 border-slate-700 hover:bg-slate-700"
                }`}
              >
                {visible ? symbol : CARD_BACK}
              </button>
            );
          })}
        </div>

        <div className="mt-5 text-center text-sm text-slate-500">
          أنت اللاعب {myPlayer}
        </div>
      </div>
    </main>
  );
}
