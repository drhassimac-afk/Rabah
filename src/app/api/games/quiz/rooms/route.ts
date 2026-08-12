import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { quizRooms } from "@/db/schema";

type Player = "X" | "O";

type Question = {
  question: string;
  options: string[];
  answer: number;
};

const QUESTIONS: Question[] = [
  {
    question: "ما هي عاصمة الجزائر؟",
    options: ["وهران", "الجزائر", "عنابة", "قسنطينة"],
    answer: 1,
  },
  {
    question: "كم عدد أيام الأسبوع؟",
    options: ["5", "6", "7", "8"],
    answer: 2,
  },
  {
    question: "ما هو الكوكب المعروف بالكوكب الأحمر؟",
    options: ["الأرض", "المريخ", "المشتري", "الزهرة"],
    answer: 1,
  },
  {
    question: "كم يساوي 5 × 6؟",
    options: ["25", "30", "35", "40"],
    answer: 1,
  },
  {
    question: "ما هو أكبر محيط على الأرض؟",
    options: [
      "المحيط الأطلسي",
      "المحيط الهندي",
      "المحيط الهادئ",
      "المحيط المتجمد",
    ],
    answer: 2,
  },
];

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

function serializeRoom(room: any) {
  return {
    id: room.id,
    code: room.code,
    playerX: room.playerX,
    playerO: room.playerO,
    currentQuestion: room.currentQuestion,
    scores: JSON.parse(room.scores),
    status: room.status,
    winner: room.winner,
    questions: JSON.parse(room.questions),
  };
}

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code")?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: "رمز الغرفة مطلوب" }, { status: 400 });
    }

    const rooms = await db
      .select()
      .from(quizRooms)
      .where(eq(quizRooms.code, code))
      .limit(1);

    if (rooms.length === 0) {
      return NextResponse.json({ error: "الغرفة غير موجودة" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      room: serializeRoom(rooms[0]),
    });
  } catch (error) {
    console.error("GET quiz room error:", error);

    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = String(body.action || "");

    if (action === "create") {
      const player = String(body.player || "").trim();

      if (!player) {
        return NextResponse.json(
          { error: "اسم اللاعب مطلوب" },
          { status: 400 },
        );
      }

      let code = generateRoomCode();

      for (let attempt = 0; attempt < 10; attempt++) {
        const existing = await db
          .select({ id: quizRooms.id })
          .from(quizRooms)
          .where(eq(quizRooms.code, code))
          .limit(1);

        if (existing.length === 0) break;

        code = generateRoomCode();
      }

      const [room] = await db
        .insert(quizRooms)
        .values({
          code,
          playerX: player,
          playerO: null,
          questions: JSON.stringify(QUESTIONS),
          currentQuestion: 0,
          answersX: "[]",
          answersO: "[]",
          scores: JSON.stringify({ X: 0, O: 0 }),
          status: "waiting",
          winner: null,
        })
        .returning();

      return NextResponse.json({
        success: true,
        player: "X",
        room: serializeRoom(room),
      });
    }

    if (action === "join") {
      const code = String(body.code || "")
        .trim()
        .toUpperCase();

      const player = String(body.player || "").trim();

      if (!code || !player) {
        return NextResponse.json(
          { error: "رمز الغرفة واسم اللاعب مطلوبان" },
          { status: 400 },
        );
      }

      const rooms = await db
        .select()
        .from(quizRooms)
        .where(eq(quizRooms.code, code))
        .limit(1);

      if (rooms.length === 0) {
        return NextResponse.json(
          { error: "الغرفة غير موجودة" },
          { status: 404 },
        );
      }

      const room = rooms[0];

      if (room.playerO) {
        return NextResponse.json({ error: "الغرفة ممتلئة" }, { status: 409 });
      }

      const [updatedRoom] = await db
        .update(quizRooms)
        .set({
          playerO: player,
          status: "playing",
          updatedAt: new Date(),
        })
        .where(eq(quizRooms.id, room.id))
        .returning();

      return NextResponse.json({
        success: true,
        player: "O",
        room: serializeRoom(updatedRoom),
      });
    }

    if (action === "answer") {
      const code = String(body.code || "")
        .trim()
        .toUpperCase();

      const player = String(body.player || "").toUpperCase() as Player;
      const answer = Number(body.answer);

      if (!code || !["X", "O"].includes(player) || !Number.isInteger(answer)) {
        return NextResponse.json(
          { error: "بيانات الإجابة غير صحيحة" },
          { status: 400 },
        );
      }

      const rooms = await db
        .select()
        .from(quizRooms)
        .where(eq(quizRooms.code, code))
        .limit(1);

      if (rooms.length === 0) {
        return NextResponse.json(
          { error: "الغرفة غير موجودة" },
          { status: 404 },
        );
      }

      const room = rooms[0];

      if (room.status !== "playing") {
        return NextResponse.json(
          { error: "المسابقة لم تبدأ بعد" },
          { status: 400 },
        );
      }

      const questions = JSON.parse(room.questions) as Question[];

      if (
        room.currentQuestion < 0 ||
        room.currentQuestion >= questions.length
      ) {
        return NextResponse.json({ error: "السؤال غير صالح" }, { status: 400 });
      }

      if (
        answer < 0 ||
        answer >= questions[room.currentQuestion].options.length
      ) {
        return NextResponse.json(
          { error: "الإجابة غير صالحة" },
          { status: 400 },
        );
      }

      const answers =
        player === "X"
          ? (JSON.parse(room.answersX) as number[])
          : (JSON.parse(room.answersO) as number[]);

      if (answers.length > room.currentQuestion) {
        return NextResponse.json(
          { error: "لقد أجبت عن هذا السؤال بالفعل" },
          { status: 409 },
        );
      }

      const newAnswers = [...answers, answer];

      const scores = JSON.parse(room.scores) as {
        X: number;
        O: number;
      };

      if (answer === questions[room.currentQuestion].answer) {
        scores[player] += 1;
      }

      const otherAnswers =
        player === "X"
          ? (JSON.parse(room.answersO) as number[])
          : (JSON.parse(room.answersX) as number[]);

      const bothAnswered =
        newAnswers.length > room.currentQuestion &&
        otherAnswers.length > room.currentQuestion;

      let nextQuestion = room.currentQuestion;
      let status = room.status;
      let winner = room.winner;

      if (bothAnswered) {
        nextQuestion += 1;

        if (nextQuestion >= questions.length) {
          status = "finished";

          if (scores.X > scores.O) {
            winner = "X";
          } else if (scores.O > scores.X) {
            winner = "O";
          } else {
            winner = "draw";
          }
        }
      }

      const [updatedRoom] = await db
        .update(quizRooms)
        .set({
          currentQuestion: nextQuestion,
          answersX: player === "X" ? JSON.stringify(newAnswers) : room.answersX,
          answersO: player === "O" ? JSON.stringify(newAnswers) : room.answersO,
          scores: JSON.stringify(scores),
          status,
          winner,
          updatedAt: new Date(),
        })
        .where(eq(quizRooms.id, room.id))
        .returning();

      return NextResponse.json({
        success: true,
        correct: answer === questions[room.currentQuestion].answer,
        room: serializeRoom(updatedRoom),
      });
    }

    return NextResponse.json({ error: "الإجراء غير معروف" }, { status: 400 });
  } catch (error) {
    console.error("POST quiz room error:", error);

    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
