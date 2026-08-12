import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { postLikes, posts } from "@/db/schema";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId: postIdParam } = await params;
    const postId = Number(postIdParam);

    if (!Number.isInteger(postId) || postId <= 0) {
      return NextResponse.json(
        { error: "معرف المنشور غير صحيح" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const userId = Number(body.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "معرف المستخدم غير صحيح" },
        { status: 400 }
      );
    }

    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post) {
      return NextResponse.json(
        { error: "المنشور غير موجود" },
        { status: 404 }
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
        likes: updatedPost.likes ?? 0,
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
      likes: updatedPost.likes ?? 0,
    });
  } catch (error) {
    console.error("Toggle post like error:", error);

    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث الإعجاب" },
      { status: 500 }
    );
  }
}
