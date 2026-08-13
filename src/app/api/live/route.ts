import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { streams } from "@/db/schema";

type SignalState = {
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  broadcasterCandidates?: RTCIceCandidateInit[];
  viewerCandidates?: RTCIceCandidateInit[];
};

function parseSignal(value: string | null): SignalState {
  if (!value) return {};

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest) {
  try {
    const streamId = request.nextUrl.searchParams.get("streamId");

    if (streamId) {
      const result = await db
        .select()
        .from(streams)
        .where(eq(streams.id, Number(streamId)))
        .limit(1);

      if (!result[0]) {
        return NextResponse.json(
          { success: false, error: "البث غير موجود" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        stream: result[0],
        signal: parseSignal(result[0].streamUrl),
      });
    }

    const result = await db
      .select()
      .from(streams)
      .where(eq(streams.isLive, true));

    return NextResponse.json({
      success: true,
      streams: result,
    });
  } catch (error) {
    console.error("[LIVE GET]", error);

    return NextResponse.json(
      {
        success: false,
        error: "فشل تحميل البث",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const action = body.action;

    // إنشاء بث
    if (action === "start") {
      const userId = Number(body.userId);
      const title = String(body.title || "بث مباشر").trim();

      if (!userId) {
        return NextResponse.json(
          { success: false, error: "userId مطلوب" },
          { status: 400 }
        );
      }

      const existing = await db
        .select()
        .from(streams)
        .where(
          and(
            eq(streams.userId, userId),
            eq(streams.isLive, true)
          )
        )
        .limit(1);

      if (existing[0]) {
        return NextResponse.json({
          success: true,
          stream: existing[0],
        });
      }

      const [stream] = await db
        .insert(streams)
        .values({
          userId,
          title,
          isLive: true,
          viewers: 0,
          streamUrl: JSON.stringify({}),
        })
        .returning();

      return NextResponse.json({
        success: true,
        stream,
      });
    }

    // تحديث signaling
    if (action === "signal") {
      const streamId = Number(body.streamId);
      const type = body.type;
      const data = body.data;

      if (!streamId || !type) {
        return NextResponse.json(
          { success: false, error: "بيانات signaling ناقصة" },
          { status: 400 }
        );
      }

      const result = await db
        .select()
        .from(streams)
        .where(eq(streams.id, streamId))
        .limit(1);

      if (!result[0]) {
        return NextResponse.json(
          { success: false, error: "البث غير موجود" },
          { status: 404 }
        );
      }

      const signal = parseSignal(result[0].streamUrl);

      if (type === "offer") {
        signal.offer = data;
      }

      if (type === "answer") {
        signal.answer = data;
      }

      if (type === "broadcaster-candidate") {
        signal.broadcasterCandidates = [
          ...(signal.broadcasterCandidates || []),
          data,
        ];
      }

      if (type === "viewer-candidate") {
        signal.viewerCandidates = [
          ...(signal.viewerCandidates || []),
          data,
        ];
      }

      await db
        .update(streams)
        .set({
          streamUrl: JSON.stringify(signal),
        })
        .where(eq(streams.id, streamId));

      return NextResponse.json({
        success: true,
      });
    }

    // زيادة عدد المشاهدين
    if (action === "viewer") {
      const streamId = Number(body.streamId);

      const result = await db
        .select()
        .from(streams)
        .where(eq(streams.id, streamId))
        .limit(1);

      if (!result[0]) {
        return NextResponse.json(
          { success: false, error: "البث غير موجود" },
          { status: 404 }
        );
      }

      const viewers = (result[0].viewers || 0) + 1;

      await db
        .update(streams)
        .set({ viewers })
        .where(eq(streams.id, streamId));

      return NextResponse.json({
        success: true,
        viewers,
      });
    }

    // إيقاف البث
    if (action === "stop") {
      const streamId = Number(body.streamId);

      if (!streamId) {
        return NextResponse.json(
          { success: false, error: "streamId مطلوب" },
          { status: 400 }
        );
      }

      await db
        .update(streams)
        .set({
          isLive: false,
          streamUrl: null,
        })
        .where(eq(streams.id, streamId));

      return NextResponse.json({
        success: true,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "إجراء غير معروف",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("[LIVE POST]", error);

    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في البث",
      },
      { status: 500 }
    );
  }
}
