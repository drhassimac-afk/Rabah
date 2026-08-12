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
  Pause
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

  useEffect(() => {
    const storedUser = localStorage.getItem("rabahdj_user");
    if (!storedUser) {
      router.push("/join");
      return;
    }
    setUser(JSON.parse(storedUser));
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
    // Load dummy posts
    setPosts([
      {
        id: 1,
        user: { name: "أحمد", avatar: "👤" },
        content: "مرحباً بالجميع في شبكتنا المحلية! 🎉",
        time: "منذ 5 دقائق",
        likes: 12,
        comments: 3,
        media: null,
      },
      {
        id: 2,
        user: { name: "سارة", avatar: "👩" },
        content: "شاهدت فيلم رائع في قسم السينما 🎬",
        time: "منذ 15 دقيقة",
        likes: 8,
        comments: 5,
        media: "video",
      },
      {
        id: 3,
        user: { name: "محمد", avatar: "👨" },
        content: "من يحب يلعب ألعاب؟ 🎮",
        time: "منذ ساعة",
        likes: 20,
        comments: 12,
        media: null,
      },
    ]);
  }, [router]);

  const features = [
    { id: "cinema", icon: Film, label: "سينما", color: "from-red-600 to-red-800", bg: "bg-red-500/20" },
    { id: "live", icon: Radio, label: "بث مباشر", color: "from-purple-600 to-purple-800", bg: "bg-purple-500/20" },
    { id: "chat", icon: MessageCircle, label: "محادثة", color: "from-blue-600 to-blue-800", bg: "bg-blue-500/20" },
    { id: "walkie", icon: Mic, label: "تخاطب", color: "from-green-600 to-green-800", bg: "bg-green-500/20" },
    { id: "games", icon: Gamepad2, label: "ألعاب", color: "from-yellow-600 to-yellow-800", bg: "bg-yellow-500/20" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("rabahdj_user");
    localStorage.removeItem("rabahdj_admin");
    router.push("/");
  };

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post = {
      id: Date.now(),
      user: { name: user?.name || "أنت", avatar: "👤" },
      content: newPost,
      time: "الآن",
      likes: 0,
      comments: 0,
      media: null,
    };
    setPosts([post, ...posts]);
    setNewPost("");
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
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {user.name?.[0] || "👤"}
            </div>
            <div>
              <h1 className="text-white font-bold">RabahDj</h1>
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
            <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">3</span>
            </button>
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
          {activeTab === "home" && (
            <>
              <div className="grid grid-cols-5 gap-2 mb-8">
                {features.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => router.push(`/${feature.id}`)}
                    className={`${feature.bg} rounded-2xl p-3 flex flex-col items-center gap-2 hover:scale-105 transition-transform`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white text-xs font-medium">{feature.label}</span>
                  </button>
                ))}
              </div>

              <div className="glass rounded-2xl p-4 mb-6">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {user.name?.[0] || "👤"}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
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

              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="glass rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl">
                          {post.user.avatar}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{post.user.name}</h3>
                          <p className="text-slate-500 text-xs">{post.time}</p>
                        </div>
                      </div>
                      <MoreHorizontal className="w-5 h-5 text-slate-500" />
                    </div>

                    <p className="text-white mb-3 leading-relaxed">{post.content}</p>

                    {post.media === "video" && (
                      <div className="relative bg-slate-800 rounded-xl aspect-video flex items-center justify-center mb-3">
                        <Play className="w-16 h-16 text-white/50" />
                      </div>
                    )}

                    <div className="flex gap-6 pt-3 border-t border-slate-700/50">
                      <button className="flex items-center gap-2 text-slate-400 hover:text-red-400">
                        <Heart className="w-5 h-5" />
                        <span className="text-sm">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-slate-400 hover:text-blue-400">
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-sm">{post.comments}</span>
                      </button>
                      <button className="text-slate-400 hover:text-green-400">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "users" && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">👥 المستخدمون</h2>
              <div className="space-y-3">
                {[
                  ["أحمد", "👨", "متصل الآن"],
                  ["سارة", "👩", "متصلة الآن"],
                  ["محمد", "👨‍💼", "متصل"],
                  ["فاطمة", "👩‍🎓", "متصلة"],
                  ["خالد", "👨‍🔧", "غير متصل"],
                ].map(([name, avatar, status]) => (
                  <div key={name} className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-3">
                    <span className="text-2xl">{avatar}</span>
                    <div className="flex-1">
                      <p className="text-white font-medium">{name}</p>
                      <p className="text-xs text-slate-500">{status}</p>
                    </div>
                    <button
                      onClick={() => router.push("/chat")}
                      className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400"
                    >
                      محادثة
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "search" && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">🔍 بحث</h2>
              <input
                type="search"
                placeholder="ابحث في RabahDj..."
                className="w-full bg-slate-800/70 rounded-xl px-4 py-4 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-slate-500 text-center text-sm mt-6">
                ابحث عن المستخدمين والمنشورات والمحتوى
              </p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">⚙️ الإعدادات</h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4">
                  <span className="text-white">الحالة</span>
                  <span className="text-green-400">متصل</span>
                </div>

                <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4">
                  <span className="text-white">اسم المستخدم</span>
                  <span className="text-slate-400">{user.name}</span>
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
              { id: "home", icon: Home, label: "الرئيسية" },
              { id: "users", icon: Users, label: "المستخدمون" },
              { id: "search", icon: Search, label: "بحث" },
              { id: "settings", icon: Settings, label: "الإعدادات" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                  activeTab === item.id ? "text-blue-500" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
