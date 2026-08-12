import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cardsRooms } from "@/db/schema";

type Player = "X" | "O";

type Card = {
  symbol: string;
  name: string;
  value: number;
};

const CARDS: Card[] = [
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
    drawnCardsX: JSON.parse(room.drawnCardsX),
    drawnCardsO: JSON.parse(room.drawnCardsO),
    scores: JSON.parse(room.scores),
    currentPlayer: room.currentPlayer,
    status: room.status,
    winner: room.winner,
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
      .from(cardsRooms)
      .where(eq(cardsRooms.code, code))
      .limit(1);

    if (rooms.length === 0) {
      return NextResponse.json({ error: "الغرفة غير موجودة" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      room: serializeRoom(rooms[0]),
    });
  } catch (error) {
    console.error("GET cards room error:", error);

    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
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
          { status: 400 },
        );
      }

      let code = generateRoomCode();

      for (let attempt = 0; attempt < 10; attempt++) {
        const existing = await db
          .select({ id: cardsRooms.id })
          .from(cardsRooms)
          .where(eq(cardsRooms.code, code))
          .limit(1);

        if (existing.length === 0) break;

        code = generateRoomCode();
      }

      const [room] = await db
        .insert(cardsRooms)
        .values({
          code,
          playerX: player,
          playerO: null,
          drawnCardsX: "[]",
          drawnCardsO: "[]",
          scores: JSON.stringify({ X: 0, O: 0 }),
          currentPlayer: "X",
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

    // الانضمام إلى غرفة
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
        .from(cardsRooms)
        .where(eq(cardsRooms.code, code))
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
        .update(cardsRooms)
        .set({
          playerO: player,
          status: "playing",
          updatedAt: new Date(),
        })
        .where(eq(cardsRooms.id, room.id))
        .returning();

      return NextResponse.json({
        success: true,
        player: "O",
        room: serializeRoom(updatedRoom),
      });
    }

    // سحب بطاقة
    if (action === "draw") {
      const code = String(body.code || "")
        .trim()
        .toUpperCase();

      const player = String(body.player || "").toUpperCase() as Player;

      if (!code || !["X", "O"].includes(player)) {
        return NextResponse.json(
          { error: "بيانات السحب غير صحيحة" },
          { status: 400 },
        );
      }

      const rooms = await db
        .select()
        .from(cardsRooms)
        .where(eq(cardsRooms.code, code))
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
          { error: "اللعبة لم تبدأ بعد" },
          { status: 400 },
        );
      }

      if (room.currentPlayer !== player) {
        return NextResponse.json({ error: "ليس دورك الآن" }, { status: 409 });
      }

      if (room.winner) {
        return NextResponse.json({ error: "اللعبة انتهت" }, { status: 400 });
      }

      const drawnCardsX = JSON.parse(room.drawnCardsX) as number[];
      const drawnCardsO = JSON.parse(room.drawnCardsO) as number[];

      const allDrawn = [...drawnCardsX, ...drawnCardsO];

      const availableIndexes = CARDS.map((_, index) => index).filter(
        (index) => !allDrawn.includes(index),
      );

      if (availableIndexes.length === 0) {
        return NextResponse.json(
          { error: "انتهت جميع البطاقات" },
          { status: 400 },
        );
      }

      const randomIndex =
        availableIndexes[Math.floor(Math.random() * availableIndexes.length)];

      const card = CARDS[randomIndex];

      const scores = JSON.parse(room.scores) as {
        X: number;
        O: number;
      };

      scores[player] += card.value;

      const newDrawnCards =
        player === "X"
          ? [...drawnCardsX, randomIndex]
          : [...drawnCardsO, randomIndex];

      const totalDrawn =
        player === "X"
          ? newDrawnCards.length + drawnCardsO.length
          : drawnCardsX.length + newDrawnCards.length;

      let nextPlayer: Player = player === "X" ? "O" : "X";
      let status = room.status;
      let winner = room.winner;

      if (totalDrawn >= CARDS.length) {
        status = "finished";

        if (scores.X > scores.O) {
          winner = "X";
        } else if (scores.O > scores.X) {
          winner = "O";
        } else {
          winner = "draw";
        }
      }

      const [updatedRoom] = await db
        .update(cardsRooms)
        .set({
          drawnCardsX:
            player === "X" ? JSON.stringify(newDrawnCards) : room.drawnCardsX,

          drawnCardsO:
            player === "O" ? JSON.stringify(newDrawnCards) : room.drawnCardsO,

          scores: JSON.stringify(scores),
          currentPlayer: nextPlayer,
          status,
          winner,
          updatedAt: new Date(),
        })
        .where(eq(cardsRooms.id, room.id))
        .returning();

      return NextResponse.json({
        success: true,
        card,
        cardIndex: randomIndex,
        room: serializeRoom(updatedRoom),
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
          { status: 400 },
        );
      }

      const rooms = await db
        .select()
        .from(cardsRooms)
        .where(eq(cardsRooms.code, code))
        .limit(1);

      if (rooms.length === 0) {
        return NextResponse.json(
          { error: "الغرفة غير موجودة" },
          { status: 404 },
        );
      }

      const [updatedRoom] = await db
        .update(cardsRooms)
        .set({
          drawnCardsX: "[]",
          drawnCardsO: "[]",
          scores: JSON.stringify({ X: 0, O: 0 }),
          currentPlayer: "X",
          status: "playing",
          winner: null,
          updatedAt: new Date(),
        })
        .where(eq(cardsRooms.id, rooms[0].id))
        .returning();

      return NextResponse.json({
        success: true,
        room: serializeRoom(updatedRoom),
      });
    }

    return NextResponse.json({ error: "الإجراء غير معروف" }, { status: 400 });
  } catch (error) {
    console.error("POST cards room error:", error);

    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
