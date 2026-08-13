"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Film,
  Radio,
  MessageCircle,
  Mic,
  Gamepad2,
  Home,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  Heart,
  Share2,
  MessageSquare,
  MoreHorizontal,
  Wifi,
  WifiOff,
  Play,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState("");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOnline, setIsOnline] = useState(true);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // التعليقات
  const [openComments, setOpenComments] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, any[]>>({});
  const [newComments, setNewComments] = useState<Record<number, string>>({});
  const [loadingComments, setLoadingComments] = useState<number | null>(null);
  const [sendingComment, setSendingComment] = useState<number | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("rabahdj_user");

    if (!storedUser) {
      router.push("/join");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // تحميل الإشعارات
    fetch(`/api/notifications?userId=${parsedUser.id}`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          setUnreadNotifications(data.unreadCount || 0);
        }
      })
      .catch((error) => {
        console.error("خطأ في تحميل الإشعارات:", error);
      });

    // تحميل المستخدمين
    fetch("/api/users")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.users)) {
          setAllUsers(data.users);
        }
      })
      .catch((error) => {
        console.error("خطأ في تحميل المستخدمين:", error);
      });

    // تحميل المنشورات
    fetch(`/api/posts?userId=${parsedUser.id}`)
      .then((response) => response.json())
      .then(async (data) => {
        if (!Array.isArray(data.posts)) return;

        // تحميل عدد التعليقات لكل منشور
        const postsWithComments = await Promise.all(
          data.posts.map(async (post: any) => {
            let commentList: any[] = [];

            try {
              const response = await fetch(
                `/api/posts/${post.id}/comments`
              );

              const commentData = await response.json();

              if (Array.isArray(commentData.comments)) {
                commentList = commentData.comments;
              }
            } catch (error) {
              console.error(
                `خطأ في تحميل تعليقات المنشور ${post.id}:`,
                error
              );
            }

            return {
              ...post,
              user: {
                name:
                  post.user?.name ||
                  "مستخدم",
                avatar:
                  post.user?.avatar ||
                  "👤",
              },
              time: post.createdAt
                ? new Date(post.createdAt).toLocaleString("ar-DZ")
                : "الآن",
              likes: post.likes || 0,
              liked: post.liked || false,
              comments: Number(post.comments) || 0,
              media: post.mediaType || null,
            };
          })
        );

        setPosts(postsWithComments);
      })
      .catch((error) => {
        console.error("خطأ في تحميل المنشورات:", error);
      });
  }, [router]);

  const features = [
    {
      id: "cinema",
      icon: Film,
      label: "سينما",
      color: "from-red-600 to-red-800",
      bg: "bg-red-500/20",
    },
    {
      id: "live",
      icon: Radio,
      label: "بث مباشر",
      color: "from-purple-600 to-purple-800",
      bg: "bg-purple-500/20",
    },
    {
      id: "chat",
      icon: MessageCircle,
      label: "محادثة",
      color: "from-blue-600 to-blue-800",
      bg: "bg-blue-500/20",
    },
    {
      id: "walkie",
      icon: Mic,
      label: "تخاطب",
      color: "from-green-600 to-green-800",
      bg: "bg-green-500/20",
    },
    {
      id: "games",
      icon: Gamepad2,
      label: "ألعاب",
      color: "from-yellow-600 to-yellow-800",
      bg: "bg-yellow-500/20",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("rabahdj_user");
    localStorage.removeItem("rabahdj_admin");
    router.push("/");
  };

  const handlePost = async () => {
    if (!newPost.trim() || !user?.id) return;

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          content: newPost.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.post) {
        console.error("فشل نشر المنشور:", data);
        return;
      }

      const post = {
        ...data.post,
        user: {
          name: user.name || "أنت",
          avatar: user.avatar || "👤",
        },
        time: "الآن",
        likes: data.post.likes || 0,
        liked: false,
        comments: 0,
        media: null,
      };

      setPosts((current) => [post, ...current]);
      setNewPost("");
    } catch (error) {
      console.error("خطأ في نشر المنشور:", error);
    }
  };

  // الإعجاب
  const handleLike = async (postId: number) => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/posts/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error("فشل تحديث الإعجاب:", data);
        return;
      }

      setPosts((current) =>
        current.map((item) =>
          item.id === postId
            ? {
                ...item,
                likes: data.likes,
                liked: data.liked,
              }
            : item
        )
      );
    } catch (error) {
      console.error("خطأ في الإعجاب:", error);
    }
  };

  // تحميل تعليقات منشور
  const loadComments = async (postId: number) => {
    setLoadingComments(postId);

    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      const data = await response.json();

      if (!response.ok) {
        console.error("فشل تحميل التعليقات:", data);
        return;
      }

      const commentList = Array.isArray(data.comments)
        ? data.comments
        : [];

      setComments((current) => ({
        ...current,
        [postId]: commentList,
      }));

      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: commentList.length,
              }
            : post
        )
      );
    } catch (error) {
      console.error("خطأ في تحميل التعليقات:", error);
    } finally {
      setLoadingComments(null);
    }
  };

  // فتح / إغلاق التعليقات
  const toggleComments = async (postId: number) => {
    if (openComments === postId) {
      setOpenComments(null);
      return;
    }

    setOpenComments(postId);

    if (!comments[postId]) {
      await loadComments(postId);
    }
  };

  // كتابة التعليق
  const handleCommentChange = (
    postId: number,
    value: string
  ) => {
    setNewComments((current) => ({
      ...current,
      [postId]: value,
    }));
  };

  // إرسال التعليق
  const handleComment = async (postId: number) => {
    const content = newComments[postId]?.trim();

    if (!content || !user?.id) return;

    setSendingComment(postId);

    try {
      const response = await fetch(
        `/api/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            content,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error("فشل إرسال التعليق:", data);
        return;
      }

      const newComment = {
        ...data.comment,
        user: {
          id: user.id,
          name: user.name || "مستخدم",
          username: user.username || user.name || "مستخدم",
          avatar: user.avatar || "👤",
        },
      };

      setComments((current) => ({
        ...current,
        [postId]: [
          ...(current[postId] || []),
          newComment,
        ],
      }));

      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: (post.comments || 0) + 1,
              }
            : post
        )
      );

      setNewComments((current) => ({
        ...current,
        [postId]: "",
      }));
    } catch (error) {
      console.error("خطأ في إرسال التعليق:", error);
    } finally {
      setSendingComment(null);
    }
  };

  const filteredUsers = allUsers.filter((item) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return true;

    return (
      item.name?.toLowerCase().includes(query) ||
      item.username?.toLowerCase().includes(query)
    );
  });

  if (!user) return null;

  return (
    <div
      className="min-h-screen pb-20"
      dir="rtl"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {user.name?.[0] || "👤"}
            </div>

            <div>
              <h1 className="text-white font-bold">
                RabahDj
              </h1>

              <div className="flex items-center gap-1 text-xs text-slate-400">
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 text-green-500" />
                    <span>متصل</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-red-500" />
                    <span>غير متصل</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={async () => {
                  const nextState = !showNotifications;
                  setShowNotifications(nextState);

                  if (
                    nextState &&
                    unreadNotifications > 0 &&
                    user?.id
                  ) {
                    try {
                      await fetch("/api/notifications", {
                        method: "PATCH",
                        headers: {
                          "Content-Type":
                            "application/json",
                        },
                        body: JSON.stringify({
                          userId: user.id,
                        }),
                      });

                      setUnreadNotifications(0);

                      setNotifications((current) =>
                        current.map((item) => ({
                          ...item,
                          isRead: true,
                        }))
                      );
                    } catch (error) {
                      console.error(
                        "خطأ في تحديث الإشعارات:",
                        error
                      );
                    }
                  }
                }}
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors relative"
              >
                <Bell className="w-5 h-5" />

                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    {unreadNotifications > 99
                      ? "99+"
                      : unreadNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute left-0 top-12 w-72 glass rounded-2xl border border-slate-700/50 p-4 z-[60]">
                  <h3 className="text-white font-bold mb-3">
                    الإشعارات
                  </h3>

                  {notifications.length === 0 ? (
                    <div className="text-slate-400 text-sm text-center py-4">
                      لا توجد إشعارات
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm max-h-80 overflow-y-auto">
                      {notifications.map(
                        (notification) => (
                          <div
                            key={notification.id}
                            className="text-slate-300 border-b border-slate-700/50 pb-3 last:border-0"
                          >
                            <div className="font-medium text-white">
                              {notification.title}
                            </div>

                            {notification.content && (
                              <div className="text-slate-400 mt-1">
                                {notification.content}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* HOME */}
        {activeTab === "home" && (
          <>
            {/* Features */}
            <div className="grid grid-cols-5 gap-2 mb-8">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() =>
                    router.push(`/${feature.id}`)
                  }
                  className={`${feature.bg} rounded-2xl p-3 flex flex-col items-center gap-2 hover:scale-105 transition-transform`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}
                  >
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>

                  <span className="text-white text-xs font-medium">
                    {feature.label}
                  </span>
                </button>
              ))}
            </div>

            {/* New Post */}
            <div className="glass rounded-2xl p-4 mb-6">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user.name?.[0] || "👤"}
                </div>

                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) =>
                      setNewPost(e.target.value)
                    }
                    placeholder="ماذا يدور في ذهنك؟"
                    className="w-full bg-slate-800/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    rows={2}
                  />

                  <div className="flex justify-between items-center mt-3">
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-slate-800 text-blue-400 hover:bg-slate-700">
                        <Film className="w-5 h-5" />
                      </button>

                      <button className="p-2 rounded-lg bg-slate-800 text-green-400 hover:bg-slate-700">
                        <Mic className="w-5 h-5" />
                      </button>
                    </div>

                    <button
                      onClick={handlePost}
                      disabled={!newPost.trim()}
                      className="btn-primary px-6 py-2 rounded-full text-white font-medium text-sm disabled:opacity-50"
                    >
                      نشر
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="glass rounded-2xl p-4"
                >
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl">
                        {post.user?.avatar || "👤"}
                      </div>

                      <div>
                        <h3 className="text-white font-medium">
                          {post.user?.name || "مستخدم"}
                        </h3>

                        <p className="text-slate-500 text-xs">
                          {post.time}
                        </p>
                      </div>
                    </div>

                    <MoreHorizontal className="w-5 h-5 text-slate-500" />
                  </div>

                  {/* Content */}
                  <p className="text-white mb-3 leading-relaxed">
                    {post.content}
                  </p>

                  {/* Video */}
                  {post.media === "video" && (
                    <div className="relative bg-slate-800 rounded-xl aspect-video flex items-center justify-center mb-3">
                      <Play className="w-16 h-16 text-white/50" />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-6 pt-3 border-t border-slate-700/50">
                    {/* Like */}
                    <button
                      onClick={() =>
                        handleLike(post.id)
                      }
                      className={`flex items-center gap-2 transition-colors ${
                        post.liked
                          ? "text-red-500"
                          : "text-slate-400 hover:text-red-400"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          post.liked
                            ? "fill-current"
                            : ""
                        }`}
                      />

                      <span className="text-sm">
                        {post.likes ?? 0}
                      </span>
                    </button>

                    {/* Comments */}
                    <button
                      onClick={() =>
                        toggleComments(post.id)
                      }
                      className={`flex items-center gap-2 transition-colors ${
                        openComments === post.id
                          ? "text-blue-500"
                          : "text-slate-400 hover:text-blue-400"
                      }`}
                    >
                      <MessageSquare className="w-5 h-5" />

                      <span className="text-sm">
                        {post.comments ?? 0}
                      </span>
                    </button>

                    {/* Share */}
                    <button className="text-slate-400 hover:text-green-400">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Comments Area */}
                  {openComments === post.id && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <h4 className="text-white font-medium mb-3">
                        التعليقات
                      </h4>

                      {/* Loading */}
                      {loadingComments === post.id && (
                        <div className="text-slate-500 text-sm text-center py-3">
                          جارٍ تحميل التعليقات...
                        </div>
                      )}

                      {/* Comments List */}
                      {loadingComments !== post.id &&
                        (comments[post.id] || []).length ===
                          0 && (
                          <div className="text-slate-500 text-sm text-center py-3">
                            لا توجد تعليقات بعد
                          </div>
                        )}

                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {(comments[post.id] || []).map(
                          (comment: any) => (
                            <div
                              key={comment.id}
                              className="flex gap-3 bg-slate-800/40 rounded-xl p-3"
                            >
                              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                                {comment.user?.avatar ||
                                  "👤"}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-white text-sm font-medium">
                                    {comment.user?.name ||
                                      "مستخدم"}
                                  </span>

                                  {comment.createdAt && (
                                    <span className="text-slate-600 text-[10px]">
                                      {new Date(
                                        comment.createdAt
                                      ).toLocaleString(
                                        "ar-DZ"
                                      )}
                                    </span>
                                  )}
                                </div>

                                <p className="text-slate-300 text-sm mt-1 break-words">
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      {/* New Comment */}
                      <div className="flex gap-2 mt-4">
                        <input
                          type="text"
                          value={
                            newComments[post.id] || ""
                          }
                          onChange={(e) =>
                            handleCommentChange(
                              post.id,
                              e.target.value
                            )
                          }
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" &&
                              !e.shiftKey
                            ) {
                              e.preventDefault();
                              handleComment(post.id);
                            }
                          }}
                          placeholder="اكتب تعليقًا..."
                          className="flex-1 bg-slate-800/70 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <button
                          onClick={() =>
                            handleComment(post.id)
                          }
                          disabled={
                            !newComments[
                              post.id
                            ]?.trim() ||
                            sendingComment === post.id
                          }
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sendingComment === post.id
                            ? "..."
                            : "إرسال"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* USERS */}
        {activeTab === "users" && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              👥 المستخدمون
            </h2>

            <div className="space-y-3">
              {(filteredUsers.length > 0
                ? filteredUsers
                : [
                    {
                      id: "1",
                      name: "أحمد",
                      avatar: "👨",
                      status: "متصل الآن",
                    },
                    {
                      id: "2",
                      name: "سارة",
                      avatar: "👩",
                      status: "متصلة الآن",
                    },
                    {
                      id: "3",
                      name: "محمد",
                      avatar: "👨‍💼",
                      status: "متصل",
                    },
                    {
                      id: "4",
                      name: "فاطمة",
                      avatar: "👩‍🎓",
                      status: "متصلة",
                    },
                    {
                      id: "5",
                      name: "خالد",
                      avatar: "👨‍🔧",
                      status: "غير متصل",
                    },
                  ]
              ).map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-3"
                >
                  <span className="text-2xl">
                    {item.avatar || "👤"}
                  </span>

                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {item.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {item.status || "متصل"}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      router.push("/chat")
                    }
                    className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400"
                  >
                    محادثة
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEARCH */}
        {activeTab === "search" && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              🔍 بحث
            </h2>

            <input
              type="search"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="ابحث في RabahDj..."
              className="w-full bg-slate-800/70 rounded-xl px-4 py-4 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500"
            />

            {searchQuery.trim() &&
              filteredUsers.length > 0 && (
                <div className="mt-4 space-y-2">
                  {filteredUsers.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-3"
                    >
                      <span className="text-2xl">
                        {item.avatar || "👤"}
                      </span>

                      <div>
                        <p className="text-white font-medium">
                          {item.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          @{item.username}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {!searchQuery.trim() && (
              <p className="text-slate-500 text-center text-sm mt-6">
                ابحث عن المستخدمين والمنشورات والمحتوى
              </p>
            )}

            {searchQuery.trim() &&
              filteredUsers.length === 0 && (
                <p className="text-slate-500 text-center text-sm mt-6">
                  لم يتم العثور على مستخدم
                </p>
              )}
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              ⚙️ الإعدادات
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4">
                <span className="text-white">
                  الحالة
                </span>

                <span className="text-green-400">
                  متصل
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4">
                <span className="text-white">
                  اسم المستخدم
                </span>

                <span className="text-slate-400">
                  {user.name}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="w-full mt-4 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-slate-700/50 z-50">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="flex justify-around">
            {[
              {
                id: "home",
                icon: Home,
                label: "الرئيسية",
              },
              {
                id: "users",
                icon: Users,
                label: "المستخدمون",
              },
              {
                id: "search",
                icon: Search,
                label: "بحث",
              },
              {
                id: "settings",
                icon: Settings,
                label: "الإعدادات",
              },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  setActiveTab(item.id)
                }
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                  activeTab === item.id
                    ? "text-blue-500"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
