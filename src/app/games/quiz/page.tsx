"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Copy,
  LogIn,
  Plus,
  RotateCcw,
  Trophy,
  Users,
} from "lucide-react";

type Player = "X" | "O";

type Question = {
  question: string;
  options: string[];
  answer: number;
};

type QuizRoom = {
  id: number;
  code: string;
  playerX: string | null;
  playerO: string | null;
  currentQuestion: number;
  scores: {
    X: number;
    O: number;
  };
  status: "waiting" | "playing" | "finished";
  winner: Player | "draw" | null;
  questions: Question[];
};

export default function QuizPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"menu" | "join" | "game">("menu");
  const [playerName, setPlayerName] = useState("Rabah");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [room, setRoom] = useState<QuizRoom | null>(null);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

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
          `/api/games/quiz/rooms?code=${encodeURIComponent(room.code)}`,
          { cache: "no-store" },
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

  useEffect(() => {
    setSelectedAnswer(null);
    setAnswered(false);
  }, [room?.currentQuestion]);

  const createRoom = async () => {
    const name = playerName.trim();

    if (!name) {
      setError("اكتب اسم اللاعب أولاً");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/games/quiz/rooms", {
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
      const response = await fetch("/api/games/quiz/rooms", {
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

  const answerQuestion = async (answer: number) => {
    if (!room || !myPlayer || answered) return;
    if (room.status !== "playing") return;

    setSelectedAnswer(answer);
    setAnswered(true);
    setError("");

    try {
      const response = await fetch("/api/games/quiz/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "answer",
          code: room.code,
          player: myPlayer,
          answer,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "تعذر إرسال الإجابة");
      }

      setRoom(data.room);
    } catch (err) {
      setAnswered(false);
      setSelectedAnswer(null);
      setError(err instanceof Error ? err.message : "حدث خطأ");
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
    setSelectedAnswer(null);
    setAnswered(false);
    setError("");
    setMode("menu");
  };

  if (mode === "menu") {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-4" dir="rtl">
        <div className="max-w-md mx-auto pt-8">
          <button
            onClick={() => router.push("/games")}
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-8"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="glass rounded-3xl p-6 text-center">
            <div className="text-6xl mb-4">❓</div>

            <h1 className="text-3xl font-bold mb-2">المسابقة الجماعية</h1>

            <p className="text-slate-400 mb-6">
              تحدَّ لاعبًا آخر وأجب عن الأسئلة
            </p>

            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="اسم اللاعب"
              maxLength={100}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 mb-4 outline-none focus:border-green-500"
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={createRoom}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-500 disabled:opacity-50 font-bold flex items-center justify-center gap-2 mb-3"
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
      <main className="min-h-screen bg-slate-950 text-white p-4" dir="rtl">
        <div className="max-w-md mx-auto pt-8">
          <button
            onClick={() => setMode("menu")}
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-8"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="glass rounded-3xl p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">
              الانضمام إلى المسابقة
            </h1>

            <input
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              placeholder="رمز الغرفة"
              maxLength={8}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 mb-3 text-center tracking-widest uppercase outline-none focus:border-green-500"
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 mb-4 text-sm text-center">
                {error}
              </div>
            )}

            <button
              onClick={joinRoom}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-500 disabled:opacity-50 font-bold"
            >
              {loading ? "جارٍ الدخول..." : "دخول"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!room || !myPlayer) {
    return null;
  }

  const question = room.questions[room.currentQuestion];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4" dir="rtl">
      <div className="max-w-md mx-auto pt-4">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={leaveGame}
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <h1 className="flex-1 text-center text-2xl font-bold">❓ المسابقة</h1>

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
                ? "border-green-500 bg-green-500/10"
                : "border-slate-800 bg-slate-900"
            }`}
          >
            <div className="text-sm text-slate-400">
              X — {room.playerX || "انتظر..."}
            </div>

            <div className="text-3xl font-bold">{room.scores.X}</div>
          </div>

          <div
            className={`rounded-2xl p-4 text-center border ${
              myPlayer === "O"
                ? "border-green-500 bg-green-500/10"
                : "border-slate-800 bg-slate-900"
            }`}
          >
            <div className="text-sm text-slate-400">
              O — {room.playerO || "انتظر..."}
            </div>

            <div className="text-3xl font-bold">{room.scores.O}</div>
          </div>
        </div>

        {room.status === "waiting" && (
          <div className="rounded-2xl bg-yellow-500/10 border border-yellow-500/30 p-5 text-center">
            <Users className="w-7 h-7 mx-auto mb-2" />

            <div className="font-bold">انتظر اللاعب الثاني...</div>

            <div className="text-sm text-slate-400 mt-2">
              شارك رمز الغرفة معه:
            </div>

            <div className="text-2xl font-bold tracking-widest mt-2">
              {room.code}
            </div>
          </div>
        )}

        {room.status === "playing" && question && (
          <div>
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 mb-4 text-center">
              <div className="text-sm text-slate-500 mb-2">
                السؤال {room.currentQuestion + 1} من {room.questions.length}
              </div>

              <h2 className="text-xl font-bold">{question.question}</h2>
            </div>

            <div className="grid gap-3">
              {question.options.map((option, index) => {
                const selected = selectedAnswer === index;

                return (
                  <button
                    key={index}
                    onClick={() => answerQuestion(index)}
                    disabled={answered}
                    className={`w-full rounded-2xl p-4 text-right font-bold border transition ${
                      selected
                        ? "bg-green-600 border-green-400"
                        : "bg-slate-800 border-slate-700 hover:bg-slate-700"
                    } disabled:opacity-70`}
                  >
                    <span className="inline-flex w-8 h-8 rounded-full bg-slate-950/40 items-center justify-center ml-2">
                      {String.fromCharCode(65 + index)}
                    </span>

                    {option}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="mt-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 p-4 text-center">
                تم تسجيل إجابتك. ⏳
                <div className="text-sm text-slate-400 mt-1">
                  ننتظر إجابة اللاعب الآخر...
                </div>
              </div>
            )}
          </div>
        )}

        {room.status === "finished" && (
          <div className="rounded-3xl bg-green-500/10 border border-green-500/30 p-6 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-3" />

            <h2 className="text-2xl font-bold mb-3">
              {room.winner === "draw"
                ? "تعادل! 🤝"
                : room.winner === myPlayer
                  ? "🎉 فزت!"
                  : "انتهت المسابقة"}
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-slate-900 rounded-2xl p-4">
                <div className="text-sm text-slate-400">{room.playerX}</div>
                <div className="text-3xl font-bold">{room.scores.X}</div>
              </div>

              <div className="bg-slate-900 rounded-2xl p-4">
                <div className="text-sm text-slate-400">{room.playerO}</div>
                <div className="text-3xl font-bold">{room.scores.O}</div>
              </div>
            </div>

            <button
              onClick={leaveGame}
              className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 font-bold flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" />
              العودة للألعاب
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 text-center text-sm">
            {error}
          </div>
        )}

        {room.status === "playing" && (
          <div className="mt-5 text-center text-sm text-slate-500">
            أنت اللاعب {myPlayer}
          </div>
        )}
      </div>
    </main>
  );
}
