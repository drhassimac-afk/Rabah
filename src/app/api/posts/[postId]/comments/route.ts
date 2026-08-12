import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { postComments, posts, users } from "@/db/schema";

export async function GET(
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

    const comments = await db
      .select({
        id: postComments.id,
        postId: postComments.postId,
        userId: postComments.userId,
        content: postComments.content,
        createdAt: postComments.createdAt,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          avatar: users.avatar,
        },
      })
      .from(postComments)
      .leftJoin(users, eq(postComments.userId, users.id))
      .where(eq(postComments.postId, postId))
      .orderBy(asc(postComments.createdAt));

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Get comments error:", error);

    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}

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
    const content = String(body.content ?? "").trim();

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "معرف المستخدم غير صحيح" },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: "التعليق فارغ" },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: "التعليق طويل جدًا" },
        { status: 400 }
      );
    }

    const [post] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post) {
      return NextResponse.json(
        { error: "المنشور غير موجود" },
        { status: 404 }
      );
    }

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    const [comment] = await db
      .insert(postComments)
      .values({
        postId,
        userId,
        content,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        comment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create comment error:", error);

    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
