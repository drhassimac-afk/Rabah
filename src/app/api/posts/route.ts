import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { posts, users, postLikes, postComments } from "@/db/schema";
import { desc, eq, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const userIdParam = request.nextUrl.searchParams.get("userId");
    const currentUserId = userIdParam ? Number(userIdParam) : 0;

    const allPosts = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        mediaUrl: posts.mediaUrl,
        mediaType: posts.mediaType,
        likes: posts.likes,
        createdAt: posts.createdAt,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          avatar: users.avatar,
        },
        comments: count(postComments.id),
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(postComments, eq(postComments.postId, posts.id))
      .groupBy(
        posts.id,
        users.id
      )
      .orderBy(desc(posts.createdAt));

    let likedPostIds = new Set<number>();

    if (Number.isInteger(currentUserId) && currentUserId > 0) {
      const likes = await db
        .select({ postId: postLikes.postId })
        .from(postLikes)
        .where(eq(postLikes.userId, currentUserId));

      likedPostIds = new Set(likes.map((like) => like.postId));
    }

    const formattedPosts = allPosts.map((post) => ({
      ...post,
      comments: Number(post.comments),
      liked: likedPostIds.has(post.id),
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error("Get posts error:", error);

    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, content, mediaUrl, mediaType } = body;

    if (!userId || !content) {
      return NextResponse.json(
        { error: "بيانات ناقصة" },
        { status: 400 }
      );
    }

    const newPost = await db
      .insert(posts)
      .values({
        userId,
        content,
        mediaUrl,
        mediaType,
      })
      .returning();

    return NextResponse.json(
      { post: newPost[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create post error:", error);

    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
