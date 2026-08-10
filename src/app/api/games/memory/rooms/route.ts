import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { memoryRooms } from "@/db/schema";

type Player = "X" | "O";

const SYMBOLS = ["🍎", "🍎", "🍌", "🍌", "🍇", "🍇", "🍉", "🍉"];

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

function createBoard() {
  const board = [...SYMBOLS];

  for (let i = board.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [board[i], board[j]] = [board[j], board[i]];
  }

  return board;
}

function emptyRoom(room: any) {
  return {
    id: room.id,
    code: room.code,
    playerX: room.playerX,
    playerO: room.playerO,
    board: JSON.parse(room.board),
    matchedPairs: JSON.parse(room.matchedPairs),
    flippedCards: JSON.parse(room.flippedCards),
    currentPlayer: room.currentPlayer,
    scores: JSON.parse(room.scores),
    status: room.status,
    winner: room.winner,
  };
}

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams
      .get("code")
      ?.trim()
      .toUpperCase();

    if (!code) {
      return NextResponse.json(
        { error: "رمز الغرفة مطلوب" },
        { status: 400 }
      );
    }

    const rooms = await db
      .select()
      .from(memoryRooms)
      .where(eq(memoryRooms.code, code))
      .limit(1);

    if (rooms.length === 0) {
      return NextResponse.json(
        { error: "الغرفة غير موجودة" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      room: emptyRoom(rooms[0]),
    });
  } catch (error) {
    console.error("GET memory room error:", error);

    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = String(body.action || "");

    // إنشاء غرفة
    if (action === "create") {
      const player = String(body.player || "").trim();

      if (!player) {
        return NextResponse.json(
          { error: "اسم اللاعب مطلوب" },
          { status: 400 }
        );
      }

      let code = generateRoomCode();

      for (let attempt = 0; attempt < 10; attempt++) {
        const existing = await db
          .select({ id: memoryRooms.id })
          .from(memoryRooms)
          .where(eq(memoryRooms.code, code))
          .limit(1);

        if (existing.length === 0) break;

        code = generateRoomCode();
      }

      const [room] = await db
        .insert(memoryRooms)
        .values({
          code,
          playerX: player,
          playerO: null,
          board: JSON.stringify(createBoard()),
          matchedPairs: "[]",
          flippedCards: "[]",
          currentPlayer: "X",
          scores: JSON.stringify({ X: 0, O: 0 }),
          status: "waiting",
          winner: null,
        })
        .returning();

      return NextResponse.json({
        success: true,
        player: "X",
        room: emptyRoom(room),
      });
    }

    // الانضمام
    if (action === "join") {
      const code = String(body.code || "")
        .trim()
        .toUpperCase();

      const player = String(body.player || "").trim();

      if (!code || !player) {
        return NextResponse.json(
          { error: "رمز الغرفة واسم اللاعب مطلوبان" },
          { status: 400 }
        );
      }

      const rooms = await db
        .select()
        .from(memoryRooms)
        .where(eq(memoryRooms.code, code))
        .limit(1);

      if (rooms.length === 0) {
        return NextResponse.json(
          { error: "الغرفة غير موجودة" },
          { status: 404 }
        );
      }

      const room = rooms[0];

      if (room.playerO) {
        return NextResponse.json(
          { error: "الغرفة ممتلئة" },
          { status: 409 }
        );
      }

      const [updatedRoom] = await db
        .update(memoryRooms)
        .set({
          playerO: player,
          status: "playing",
          updatedAt: new Date(),
        })
        .where(eq(memoryRooms.id, room.id))
        .returning();

      return NextResponse.json({
        success: true,
        player: "O",
        room: emptyRoom(updatedRoom),
      });
    }

    // كشف بطاقة
    if (action === "flip") {
      const code = String(body.code || "")
        .trim()
        .toUpperCase();

      const player = String(body.player || "").toUpperCase() as Player;
      const index = Number(body.index);

      if (
        !code ||
        !["X", "O"].includes(player) ||
        !Number.isInteger(index)
      ) {
        return NextResponse.json(
          { error: "بيانات النقلة غير صحيحة" },
          { status: 400 }
        );
      }

      if (index < 0 || index > 7) {
        return NextResponse.json(
          { error: "موقع البطاقة غير صحيح" },
          { status: 400 }
        );
      }

      const rooms = await db
        .select()
        .from(memoryRooms)
        .where(eq(memoryRooms.code, code))
        .limit(1);

      if (rooms.length === 0) {
        return NextResponse.json(
          { error: "الغرفة غير موجودة" },
          { status: 404 }
        );
      }

      const room = rooms[0];

      if (room.status !== "playing") {
        return NextResponse.json(
          { error: "اللعبة لم تبدأ بعد" },
          { status: 400 }
        );
      }

      if (room.currentPlayer !== player) {
        return NextResponse.json(
          { error: "ليس دورك الآن" },
          { status: 409 }
        );
      }

      if (room.winner) {
        return NextResponse.json(
          { error: "المباراة انتهت" },
          { status: 400 }
        );
      }

      const board = JSON.parse(room.board) as string[];
      const matchedPairs = JSON.parse(room.matchedPairs) as number[];
      const flippedCards = JSON.parse(room.flippedCards) as number[];

      if (matchedPairs.includes(index)) {
        return NextResponse.json(
          { error: "هذا الزوج مكتمل بالفعل" },
          { status: 409 }
        );
      }

      if (flippedCards.includes(index)) {
        return NextResponse.json(
          { error: "هذه البطاقة مكشوفة بالفعل" },
          { status: 409 }
        );
      }

      if (flippedCards.length >= 2) {
        return NextResponse.json(
          { error: "انتظر نتيجة البطاقتين" },
          { status: 409 }
        );
      }

      const newFlipped = [...flippedCards, index];

      // البطاقة الأولى
      if (newFlipped.length === 1) {
        const [updatedRoom] = await db
          .update(memoryRooms)
          .set({
            flippedCards: JSON.stringify(newFlipped),
            updatedAt: new Date(),
          })
          .where(eq(memoryRooms.id, room.id))
          .returning();

        return NextResponse.json({
          success: true,
          matched: false,
          room: emptyRoom(updatedRoom),
        });
      }

      // البطاقة الثانية
      const [firstIndex, secondIndex] = newFlipped;

      const isMatch = board[firstIndex] === board[secondIndex];

      let newMatchedPairs = [...matchedPairs];
      let scores = JSON.parse(room.scores) as {
        X: number;
        O: number;
      };

      let nextPlayer: Player = player;
      let winner: Player | "draw" | null = null;
      let status = room.status;

      if (isMatch) {
        newMatchedPairs = [
          ...newMatchedPairs,
          firstIndex,
          secondIndex,
        ];

        scores = {
          ...scores,
          [player]: scores[player] + 1,
        };

        // نفس اللاعب يستمر
        nextPlayer = player;

        if (newMatchedPairs.length === board.length) {
          if (scores.X > scores.O) {
            winner = "X";
          } else if (scores.O > scores.X) {
            winner = "O";
          } else {
            winner = "draw";
          }

          status = "finished";
        }
      } else {
        // لا يوجد تطابق → الدور ينتقل
        nextPlayer = player === "X" ? "O" : "X";
      }

      const [updatedRoom] = await db
        .update(memoryRooms)
        .set({
          matchedPairs: JSON.stringify(newMatchedPairs),
          flippedCards: JSON.stringify(newFlipped),
          currentPlayer: nextPlayer,
          scores: JSON.stringify(scores),
          status,
          winner,
          updatedAt: new Date(),
        })
        .where(eq(memoryRooms.id, room.id))
        .returning();

      return NextResponse.json({
        success: true,
        matched: isMatch,
        room: emptyRoom(updatedRoom),
      });
    }

    // إخفاء البطاقتين بعد المقارنة
    if (action === "hide") {
      const code = String(body.code || "")
        .trim()
        .toUpperCase();

      if (!code) {
        return NextResponse.json(
          { error: "رمز الغرفة مطلوب" },
          { status: 400 }
        );
      }

      const rooms = await db
        .select()
        .from(memoryRooms)
        .where(eq(memoryRooms.code, code))
        .limit(1);

      if (rooms.length === 0) {
        return NextResponse.json(
          { error: "الغرفة غير موجودة" },
          { status: 404 }
        );
      }

      const room = rooms[0];

      const flippedCards = JSON.parse(room.flippedCards) as number[];
      const matchedPairs = JSON.parse(room.matchedPairs) as number[];

      const visibleCards = flippedCards.filter((index) =>
        matchedPairs.includes(index)
      );

      const [updatedRoom] = await db
        .update(memoryRooms)
        .set({
          flippedCards: JSON.stringify(visibleCards),
          updatedAt: new Date(),
        })
        .where(eq(memoryRooms.id, room.id))
        .returning();

      return NextResponse.json({
        success: true,
        room: emptyRoom(updatedRoom),
      });
    }

    // إعادة اللعبة
    if (action === "reset") {
      const code = String(body.code || "")
        .trim()
        .toUpperCase();

      if (!code) {
        return NextResponse.json(
          { error: "رمز الغرفة مطلوب" },
          { status: 400 }
        );
      }

      const rooms = await db
        .select()
        .from(memoryRooms)
        .where(eq(memoryRooms.code, code))
        .limit(1);

      if (rooms.length === 0) {
        return NextResponse.json(
          { error: "الغرفة غير موجودة" },
          { status: 404 }
        );
      }

      const room = rooms[0];

      const [updatedRoom] = await db
        .update(memoryRooms)
        .set({
          board: JSON.stringify(createBoard()),
          matchedPairs: "[]",
          flippedCards: "[]",
          currentPlayer: "X",
          scores: JSON.stringify({ X: 0, O: 0 }),
          status: room.playerO ? "playing" : "waiting",
          winner: null,
          updatedAt: new Date(),
        })
        .where(eq(memoryRooms.id, room.id))
        .returning();

      return NextResponse.json({
        success: true,
        room: emptyRoom(updatedRoom),
      });
    }

    return NextResponse.json(
      { error: "عملية غير معروفة" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Memory room API error:", error);

    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
