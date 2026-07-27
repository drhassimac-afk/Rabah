import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== "string" || username.trim().length < 2) {
      return NextResponse.json(
        { error: "اسم المستخدم يجب أن يكون أكثر من حرفين" },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, trimmedUsername))
      .limit(1);

    if (existingUser.length > 0) {
      // Return existing user
      return NextResponse.json(
        { 
          message: "تم تسجيل الدخول بنجاح",
          user: existingUser[0]
        },
        { status: 200 }
      );
    }

    // Create new user
    const newUser = await db
      .insert(users)
      .values({
        username: trimmedUsername,
        name: trimmedUsername,
      })
      .returning();

    return NextResponse.json(
      { 
        message: "تم إنشاء الحساب بنجاح",
        user: newUser[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Join error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
