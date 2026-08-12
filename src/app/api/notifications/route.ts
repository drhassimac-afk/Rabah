import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const userId = Number(request.nextUrl.searchParams.get("userId"));

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        { error: "معرف المستخدم مطلوب" },
        { status: 400 }
      );
    }

    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));

    return NextResponse.json({
      notifications: rows,
      unreadCount: rows.filter((item) => !item.isRead).length,
    });
  } catch (error) {
    console.error("خطأ في تحميل الإشعارات:", error);

    return NextResponse.json(
      { error: "حدث خطأ أثناء تحميل الإشعارات" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = Number(body.userId);

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        { error: "معرف المستخدم مطلوب" },
        { status: 400 }
      );
    }

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("خطأ في تحديث الإشعارات:", error);

    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث الإشعارات" },
      { status: 500 }
    );
  }
}
