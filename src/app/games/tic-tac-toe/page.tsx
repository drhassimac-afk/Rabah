"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, RotateCcw, Trophy, Users, Copy, LogIn, Plus } from "lucide-react";

type Player = "X" | "O";
type Cell = Player | null;

type Room = {
  id: number;
  code: string;
  playerX: string | null;
  playerO: string | null;
  board: Cell[];
  currentPlayer: Player;
  status: "waiting" | "playing" | "finished";
  winner: Player | "draw" | null;
};

export default function TicTacToePage() {
  const router = useRouter();
const autoJoinAttempted = useRef(false);

  const [mode, setMode] = useState<"menu" | "create" | "join" | "game">("menu");
  const [playerName, setPlayerName] = useState("Rabah");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [scores, setScores] = useState({
    X: 0,
    O: 0,
    draw: 0,
  });

  useEffect(() => {
    const savedName = localStorage.getItem("rabah_game_player");

    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  useEffect(() => {
    if (playerName.trim()) {
      localStorage.setItem("rabah_game_player", playerName.trim());
    }
  }, [playerName]);

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const roomFromUrl = params.get("room")?.trim().toUpperCase();

  console.log("🔥 AUTO JOIN URL:", window.location.href);
  console.log("🔥 AUTO JOIN ROOM:", roomFromUrl);

  if (!roomFromUrl) return;
  if (autoJoinAttempted.current) return;

  autoJoinAttempted.current = true;

  const joinFromLink = async () => {
    const savedName =
      localStorage.getItem("rabah_game_player")?.trim() ||
      "Player2";

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/games/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "join",
          code: roomFromUrl,
          player: savedName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "تعذر الدخول إلى الغرفة"
        );
      }

      setPlayerName(savedName);
      setRoom(data.room);
      setMyPlayer(data.player);
      setMode("game");

      window.history.replaceState(
        {},
        "",
        "/games/tic-tac-toe"
      );
    } catch (err) {
      autoJoinAttempted.current = false;

      setError(
        err instanceof Error
          ? err.message
          : "تعذر الدخول إلى الغرفة"
      );
    } finally {
      setLoading(false);
    }
  };

  joinFromLink();
}, []);


  useEffect(() => {
    if (!room?.code) return;

    const pollRoom = async () => {
      try {
        const response = await fetch(
          `/api/games/rooms?code=${encodeURIComponent(room.code)}`,
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

    pollRoom();

    const interval = setInterval(pollRoom, 1000);

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
      const response = await fetch("/api/games/rooms", {
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
      const response = await fetch("/api/games/rooms", {
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

  const makeMove = async (index: number) => {
    if (!room || !myPlayer) return;

    if (room.status !== "playing") return;
    if (room.currentPlayer !== myPlayer) return;
    if (room.board[index]) return;
    if (room.winner) return;

    setError("");

    try {
      const response = await fetch("/api/games/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "move",
          code: room.code,
          player: myPlayer,
          index,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "تعذر تنفيذ النقلة");
      }

      setRoom(data.room);

      if (data.room.winner === "X") {
        setScores((prev) => ({ ...prev, X: prev.X + 1 }));
      } else if (data.room.winner === "O") {
        setScores((prev) => ({ ...prev, O: prev.O + 1 }));
      } else if (data.room.winner === "draw") {
        setScores((prev) => ({ ...prev, draw: prev.draw + 1 }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    }
  };

  const resetGame = async () => {
    if (!room) return;

    setError("");

    try {
      const response = await fetch("/api/games/rooms", {
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
        throw new Error(data.error || "تعذر إعادة المباراة");
      }

      setRoom(data.room);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    }
  };

  const copyRoomCode = async () => {
    if (!room) return;

    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setError(`رمز الغرفة: ${room.code}`);
    }
  };

  const shareRoom = async () => {
  if (!room) return;

  const shareUrl = `${window.location.protocol}//${window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" ? "10.184.146.45" : window.location.hostname}:3000/games/tic-tac-toe?room=${encodeURIComponent(room.code)}`;
  const shareText =
    `🎮 انضم إلى لعبة إكس أو أونلاين\n` +
    `🔑 رمز الغرفة: ${room.code}\n` +
    `🌐 الرابط: ${shareUrl}`;

  try {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      await navigator.share({
        title: "إكس أو أونلاين",
        text: shareText,
      });
      return;
    }

    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setError("تم نسخ رابط الغرفة والرمز للمشاركة ✓");

      setTimeout(() => {
        setCopied(false);
        setError("");
      }, 2500);

      return;
    }

    setError(shareText);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setError("تم نسخ رابط الغرفة والرمز ✓");

      setTimeout(() => {
        setCopied(false);
        setError("");
      }, 2500);
    } catch {
      setError(shareText);
    }
  }
};

const leaveGame = () => {
    setRoom(null);
    setMyPlayer(null);
    setRoomCodeInput("");
    setError("");
    setMode("menu");
  };

  if (mode === "menu") {
    return (
      <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
        <header className="h-16 border-b border-slate-800 flex items-center px-4">
          <button
            onClick={() => router.push("/games")}
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center justify-center gap-2">
            <span className="text-2xl">⭕</span>
            <h1 className="font-bold text-lg">إكس أو أونلاين</h1>
          </div>

          <div className="w-10" />
        </header>

        <main className="max-w-md mx-auto px-4 py-8">
          <div className="glass rounded-3xl p-6 mb-6 text-center">
            <div className="text-6xl mb-4">🎮</div>

            <h2 className="text-2xl font-black text-white mb-2">
              إكس أو أونلاين
            </h2>

            <p className="text-slate-400 text-sm">
              العب مع شخص آخر من جهاز مختلف
            </p>
          </div>

          <div className="glass rounded-2xl p-5 mb-4">
            <label className="block text-slate-300 text-sm mb-2">
              اسم اللاعب
            </label>

            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="اكتب اسمك"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              maxLength={100}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 mb-4 text-sm text-center">
              {error}
            </div>
          )}

          <div className="grid gap-3">
            <button
              onClick={() => {
                setError("");
                                setMode("create");
              }}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
            >
              <Plus className="w-5 h-5" />
              إنشاء غرفة جديدة
            </button>

            <button
              onClick={() => {
                setError("");
                setMode("join");
              }}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
            >
              <LogIn className="w-5 h-5" />
              الانضمام إلى غرفة
            </button>

            <button
              onClick={() => router.push("/games")}
              className="w-full py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              العودة إلى الألعاب
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
        <header className="h-16 border-b border-slate-800 flex items-center px-4">
          <button
            onClick={() => setMode("menu")}
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <h1 className="flex-1 text-center font-bold">
            إنشاء غرفة
          </h1>

          <div className="w-10" />
        </header>

        <main className="max-w-md mx-auto px-4 py-8">
          <div className="glass rounded-3xl p-6 text-center">
            <div className="text-5xl mb-4">🎮</div>

            <h2 className="text-xl font-bold mb-2">
              إنشاء غرفة لعب
            </h2>

            <p className="text-slate-400 text-sm mb-6">
              سيتم إنشاء رمز يمكنك مشاركته مع اللاعب الثاني
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={createRoom}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold"
            >
              {loading ? "جارٍ إنشاء الغرفة..." : "إنشاء الغرفة"}
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (mode === "join") {
    return (
      <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
        <header className="h-16 border-b border-slate-800 flex items-center px-4">
          <button
            onClick={() => setMode("menu")}
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <h1 className="flex-1 text-center font-bold">
            الانضمام إلى غرفة
          </h1>

          <div className="w-10" />
        </header>

        <main className="max-w-md mx-auto px-4 py-8">
          <div className="glass rounded-3xl p-6">
            <div className="text-center text-5xl mb-4">🔑</div>

            <h2 className="text-xl font-bold text-center mb-2">
              رمز الغرفة
            </h2>

            <p className="text-slate-400 text-sm text-center mb-6">
              أدخل الرمز الذي أعطاك إياه اللاعب الأول
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 mb-4 text-sm text-center">
                {error}
              </div>
            )}

            <input
              value={roomCodeInput}
              onChange={(e) =>
                setRoomCodeInput(e.target.value.toUpperCase())
              }
              placeholder="مثال: J4LV4X"
              maxLength={8}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-center text-2xl font-black tracking-widest text-white uppercase outline-none focus:border-blue-500 mb-4"
            />

            <button
              onClick={joinRoom}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold"
            >
              {loading ? "جارٍ الانضمام..." : "انضمام"}
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!room || !myPlayer) {
    return null;
  }

  const gameOver = room.winner !== null;
  const isMyTurn =
    room.status === "playing" &&
    room.currentPlayer === myPlayer &&
    !gameOver;

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <header className="h-16 border-b border-slate-800 flex items-center px-4">
        <button
          onClick={leaveGame}
          className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="flex-1 flex items-center justify-center gap-2">
          <span className="text-2xl">⭕</span>
          <h1 className="font-bold text-lg">إكس أو أونلاين</h1>
        </div>

        <div className="w-10" />
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <div className="glass rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-slate-500 text-xs">رمز الغرفة</p>
              <p className="text-xl font-black tracking-widest text-yellow-400">
                {room.code}
              </p>
            </div>

            <div className="flex items-center gap-2">
          <button
            onClick={copyRoomCode}
            className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            title="نسخ رمز الغرفة"
          >
            <Copy className="w-5 h-5" />
          </button>

          <button
            onClick={shareRoom}
            className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors"
            title="مشاركة الغرفة"
          >
            مشاركة
          </button>
        </div>
          </div>

          {copied && (
            <p className="text-green-400 text-xs mt-2">
              تم نسخ رمز الغرفة ✓
            </p>
          )}
        </div>

        <div className="glass rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-around text-center">
            <div>
              <div className="text-blue-400 font-bold text-2xl">
                X
              </div>
              <div className="text-white font-bold">
                {room.playerX || "في الانتظار"}
              </div>
              <div className="text-slate-500 text-xs">
                اللاعب الأول
              </div>
            </div>

            <div className="text-slate-600 text-2xl">VS</div>

            <div>
              <div className="text-red-400 font-bold text-2xl">
                O
              </div>
              <div className="text-white font-bold">
                {room.playerO || "في الانتظار..."}
              </div>
              <div className="text-slate-500 text-xs">
                اللاعب الثاني
              </div>
            </div>
          </div>
        </div>

        {room.status === "waiting" && (
          <div className="glass rounded-2xl p-5 mb-5 text-center">
            <div className="animate-pulse text-4xl mb-3">👥</div>

            <h2 className="text-lg font-bold text-yellow-400 mb-2">
              في انتظار اللاعب الثاني
            </h2>

            <p className="text-slate-400 text-sm">
              شارك رمز الغرفة:
            </p>

            <div className="text-3xl font-black tracking-[0.3em] text-white mt-3">
              {room.code}
            </div>
          </div>
        )}

        {room.status === "playing" && !gameOver && (
          <div className="glass rounded-2xl p-4 mb-5 text-center">
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-slate-400" />

              {isMyTurn ? (
                <>
                  <span className="text-green-400 font-bold">
                    دورك
                  </span>

                  <span
                    className={
                      myPlayer === "X"
                        ? "text-blue-400 font-black text-xl"
                        : "text-red-400 font-black text-xl"
                    }
                  >
                    {myPlayer}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-slate-400">
                    دور اللاعب
                  </span>

                  <span
                    className={
                      room.currentPlayer === "X"
                        ? "text-blue-400 font-black text-xl"
                        : "text-red-400 font-black text-xl"
                    }
                  >
                    {room.currentPlayer}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {gameOver && (
          <div className="glass rounded-2xl p-5 mb-5 text-center">
            {room.winner === "draw" ? (
              <>
                <div className="text-4xl mb-2">🤝</div>
                <h2 className="text-xl font-bold text-yellow-400">
                  تعادل!
                </h2>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">🏆</div>

                <h2 className="text-xl font-bold text-green-400">
                  اللاعب {room.winner} فاز!
                </h2>

                <p className="text-slate-400 text-sm mt-2">
                  {room.winner === myPlayer
                    ? "مبروك! لقد فزت 🎉"
                    : "انتهت المباراة"}
                </p>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 aspect-square">
          {room.board.map((cell, index) => (
            <button
              key={index}
              onClick={() => makeMove(index)}
              disabled={
                Boolean(cell) ||
                !isMyTurn ||
                room.status !== "playing"
              }
              className="glass rounded-2xl flex items-center justify-center text-5xl font-black transition-all hover:bg-slate-800/70 active:scale-95 disabled:cursor-default disabled:opacity-80"
            >
              {cell === "X" && (
                <span className="text-blue-400">X</span>
              )}

              {cell === "O" && (
                <span className="text-red-400">O</span>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={resetGame}
            disabled={!room.playerO}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            لعبة جديدة
          </button>

          <button
            onClick={() =>
              setScores({
                X: 0,
                O: 0,
                draw: 0,
              })
            }
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
          >
            <Trophy className="w-5 h-5" />
            تصفير النتائج
          </button>
        </div>

        <button
          onClick={leaveGame}
          className="w-full mt-4 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          العودة إلى القائمة
        </button>
      </main>
    </div>
  );
}
