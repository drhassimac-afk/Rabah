"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Shield,
  Users,
  Activity,
  Settings,
  LogOut,
  BarChart3,
  Wifi,
  Server,
  Trash2,
  Ban,
  CheckCircle
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    users: 156,
    online: 42,
    posts: 1234,
    streams: 5,
  });

  useEffect(() => {
    const isAdmin = localStorage.getItem("rabahdj_admin");
    if (!isAdmin) {
      router.push("/admin-pin");
    }
  }, [router]);

  const users = [
    { id: 1, name: "أحمد", username: "ahmed", status: "online", joined: "2024-01-15" },
    { id: 2, name: "سارة", username: "sara", status: "offline", joined: "2024-01-20" },
    { id: 3, name: "محمد", username: "mohamed", status: "online", joined: "2024-02-01" },
    { id: 4, name: "فاطمة", username: "fatima", status: "online", joined: "2024-02-10" },
  ];

  const logs = [
    { id: 1, action: "مستخدم جديد", user: "أحمد", time: "10:30" },
    { id: 2, action: "بدأ بث مباشر", user: "سارة", time: "10:25" },
    { id: 3, action: "نشر منشور", user: "محمد", time: "10:20" },
    { id: 4, action: "دخول للدردشة", user: "فاطمة", time: "10:15" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("rabahdj_admin");
    localStorage.removeItem("rabahdj_user");
    router.push("/");
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/home")}
              className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-600 to-yellow-800 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">لوحة الإدارة</h1>
                <p className="text-xs text-yellow-500">صلاحيات كاملة</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "المستخدمين", value: stats.users, color: "text-blue-400", bg: "bg-blue-500/20" },
            { icon: Activity, label: "متصل الآن", value: stats.online, color: "text-green-400", bg: "bg-green-500/20" },
            { icon: BarChart3, label: "المنشورات", value: stats.posts, color: "text-purple-400", bg: "bg-purple-500/20" },
            { icon: Wifi, label: "البثوث", value: stats.streams, color: "text-red-400", bg: "bg-red-500/20" },
          ].map((stat, index) => (
            <div key={index} className="glass rounded-2xl p-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: "dashboard", label: "الرئيسية", icon: BarChart3 },
            { id: "users", label: "المستخدمين", icon: Users },
            { id: "logs", label: "السجلات", icon: Activity },
            { id: "settings", label: "الإعدادات", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-yellow-500 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Server Status */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Server className="w-6 h-6 text-green-400" />
                <h2 className="text-white font-bold text-lg">حالة الخادم</h2>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  يعمل
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">ذاكرة RAM</p>
                  <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "45%" }} />
                  </div>
                  <p className="text-white text-sm mt-1">45%</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">المعالج CPU</p>
                  <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: "23%" }} />
                  </div>
                  <p className="text-white text-sm mt-1">23%</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">آخر النشاطات</h2>
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white">{log.action}</p>
                      <p className="text-slate-400 text-sm">{log.user}</p>
                    </div>
                    <span className="text-slate-500 text-sm">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">المستخدمين</h2>
              <button className="px-4 py-2 bg-yellow-500 text-white rounded-full text-sm font-medium">
                إضافة مستخدم
              </button>
            </div>
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-xl">
                    👤
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-slate-400 text-sm">@{user.username}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${user.status === "online" ? "bg-green-500" : "bg-slate-500"}`} />
                    <span className="text-slate-400 text-sm">{user.status === "online" ? "متصل" : "غير متصل"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-slate-700 text-slate-400 hover:text-white">
                      <Ban className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-4">سجلات النظام</h2>
            <div className="space-y-2 font-mono text-sm">
              {[
                "[10:30:45] مستخدم جديد: أحمد",
                "[10:28:12] بدأ بث مباشر: سارة",
                "[10:25:33] نشر منشور: محمد",
                "[10:20:15] دخول للدردشة: فاطمة",
                "[10:15:08] تسجيل خروج: خالد",
                "[10:10:45] تحديث النظام: ناجح",
                "[10:05:22] نسخة احتياطية: تم",
              ].map((log, index) => (
                <div key={index} className="p-3 bg-slate-800/50 rounded-lg text-slate-300">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-4">إعدادات النظام</h2>
            <div className="space-y-4">
              {[
                { label: "السماح بالتسجيل", checked: true },
                { label: "تفعيل الإشعارات", checked: true },
                { label: "الوضع الصامت", checked: false },
                { label: "تسجيل الدخول التلقائي", checked: false },
              ].map((setting, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                  <span className="text-white">{setting.label}</span>
                  <button
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      setting.checked ? "bg-green-500" : "bg-slate-600"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        setting.checked ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 transition-colors">
              حفظ الإعدادات
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
