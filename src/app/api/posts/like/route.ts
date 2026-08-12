import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { postLikes, posts } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const postId = Number(body.postId);
    const userId = Number(body.userId);

    if (!Number.isInteger(postId) || postId <= 0 ||
        !Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "بيانات الإعجاب غير صحيحة" },
        { status: 400 }
      );
    }

    const [existingLike] = await db
      .select()
      .from(postLikes)
      .where(
        and(
          eq(postLikes.postId, postId),
          eq(postLikes.userId, userId)
        )
      )
      .limit(1);

    if (existingLike) {
      await db
        .delete(postLikes)
        .where(eq(postLikes.id, existingLike.id));

      const [updatedPost] = await db
        .update(posts)
        .set({
          likes: sql`GREATEST(COALESCE(${posts.likes}, 0) - 1, 0)`,
        })
        .where(eq(posts.id, postId))
        .returning();

      return NextResponse.json({
        success: true,
        liked: false,
        likes: updatedPost?.likes ?? 0,
      });
    }

    await db.insert(postLikes).values({
      postId,
      userId,
    });

    const [updatedPost] = await db
      .update(posts)
      .set({
        likes: sql`COALESCE(${posts.likes}, 0) + 1`,
      })
      .where(eq(posts.id, postId))
      .returning();

    return NextResponse.json({
      success: true,
      liked: true,
      likes: updatedPost?.likes ?? 0,
    });
  } catch (error) {
    console.error("Post like error:", error);

    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
