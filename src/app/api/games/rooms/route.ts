import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { gameRooms } from "@/db/schema";

const EMPTY_BOARD = [null, null, null, null, null, null, null, null, null];

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

function checkWinner(board: (string | null)[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return board[a];
    }
  }

  if (board.every(Boolean)) {
    return "draw";
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code")?.toUpperCase();

    if (!code) {
      return NextResponse.json(
        { error: "رمز الغرفة مطلوب" },
        { status: 400 }
      );
    }

    const rooms = await db
      .select()
      .from(gameRooms)
      .where(eq(gameRooms.code, code))
      .limit(1);

    if (rooms.length === 0) {
      return NextResponse.json(
        { error: "الغرفة غير موجودة" },
        { status: 404 }
      );
    }

    const room = rooms[0];

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        code: room.code,
        playerX: room.playerX,
        playerO: room.playerO,
        board: JSON.parse(room.board),
        currentPlayer: room.currentPlayer,
        status: room.status,
        winner: room.winner,
      },
    });
  } catch (error) {
    console.error("GET game room error:", error);

    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

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
          .select({ id: gameRooms.id })
          .from(gameRooms)
          .where(eq(gameRooms.code, code))
          .limit(1);

        if (existing.length === 0) break;

        code = generateRoomCode();
      }

      const [room] = await db
        .insert(gameRooms)
        .values({
          code,
          playerX: player,
          board: JSON.stringify(EMPTY_BOARD),
          currentPlayer: "X",
          status: "waiting",
          winner: null,
        })
        .returning();

      return NextResponse.json({
        success: true,
        player: "X",
        room: {
          id: room.id,
          code: room.code,
          playerX: room.playerX,
          playerO: room.playerO,
          board: JSON.parse(room.board),
          currentPlayer: room.currentPlayer,
          status: room.status,
          winner: room.winner,
        },
      });
    }

    if (action === "join") {
      const code = String(body.code || "").trim().toUpperCase();
      const player = String(body.player || "").trim();

      if (!code || !player) {
        return NextResponse.json(
          { error: "رمز الغرفة واسم اللاعب مطلوبان" },
          { status: 400 }
        );
      }

      const rooms = await db
        .select()
        .from(gameRooms)
        .where(eq(gameRooms.code, code))
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
        .update(gameRooms)
        .set({
          playerO: player,
          status: "playing",
          updatedAt: new Date(),
        })
        .where(eq(gameRooms.id, room.id))
        .returning();

      return NextResponse.json({
        success: true,
        player: "O",
        room: {
          id: updatedRoom.id,
          code: updatedRoom.code,
          playerX: updatedRoom.playerX,
          playerO: updatedRoom.playerO,
          board: JSON.parse(updatedRoom.board),
          currentPlayer: updatedRoom.currentPlayer,
          status: updatedRoom.status,
          winner: updatedRoom.winner,
        },
      });
    }

    if (action === "move") {
      const code = String(body.code || "").trim().toUpperCase();
      const player = String(body.player || "").toUpperCase();
      const index = Number(body.index);

      if (!code || !["X", "O"].includes(player) || !Number.isInteger(index)) {
        return NextResponse.json(
          { error: "بيانات النقلة غير صحيحة" },
          { status: 400 }
        );
      }

      if (index < 0 || index > 8) {
        return NextResponse.json(
          { error: "موقع النقلة غير صحيح" },
          { status: 400 }
        );
      }

      const rooms = await db
        .select()
        .from(gameRooms)
        .where(eq(gameRooms.code, code))
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

      const board = JSON.parse(room.board) as (string | null)[];

      if (board[index]) {
        return NextResponse.json(
          { error: "هذا المكان مستخدم" },
          { status: 409 }
        );
      }

      board[index] = player;

      const winner = checkWinner(board);

      const nextPlayer = player === "X" ? "O" : "X";

      const [updatedRoom] = await db
        .update(gameRooms)
        .set({
          board: JSON.stringify(board),
          currentPlayer: winner ? player : nextPlayer,
          status: winner ? "finished" : "playing",
          winner,
          updatedAt: new Date(),
        })
        .where(eq(gameRooms.id, room.id))
        .returning();

      return NextResponse.json({
        success: true,
        room: {
          id: updatedRoom.id,
          code: updatedRoom.code,
          playerX: updatedRoom.playerX,
          playerO: updatedRoom.playerO,
          board: JSON.parse(updatedRoom.board),
          currentPlayer: updatedRoom.currentPlayer,
          status: updatedRoom.status,
          winner: updatedRoom.winner,
        },
      });
    }

    if (action === "reset") {
      const code = String(body.code || "").trim().toUpperCase();

      if (!code) {
        return NextResponse.json(
          { error: "رمز الغرفة مطلوب" },
          { status: 400 }
        );
      }

      const [room] = await db
        .select()
        .from(gameRooms)
        .where(eq(gameRooms.code, code))
        .limit(1);

      if (!room) {
        return NextResponse.json(
          { error: "الغرفة غير موجودة" },
          { status: 404 }
        );
      }

      const [updatedRoom] = await db
        .update(gameRooms)
        .set({
          board: JSON.stringify(EMPTY_BOARD),
          currentPlayer: "X",
          status: room.playerO ? "playing" : "waiting",
          winner: null,
          updatedAt: new Date(),
        })
        .where(eq(gameRooms.id, room.id))
        .returning();

      return NextResponse.json({
        success: true,
        room: {
          id: updatedRoom.id,
          code: updatedRoom.code,
          playerX: updatedRoom.playerX,
          playerO: updatedRoom.playerO,
          board: JSON.parse(updatedRoom.board),
          currentPlayer: updatedRoom.currentPlayer,
          status: updatedRoom.status,
          winner: updatedRoom.winner,
        },
      });
    }

    return NextResponse.json(
      { error: "عملية غير معروفة" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Game room API error:", error);

    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
