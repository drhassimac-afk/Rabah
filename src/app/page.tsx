"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Film,
  Radio,
  MessageCircle,
  Mic,
  Gamepad2,
  Shield,
  Bell,
  Volume2,
  Menu,
  ArrowRight,
  WifiOff,
  X,
} from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();

  const [volume, setVolume] = useState(70);
  const [showMenu, setShowMenu] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotification(
        "مرحباً بك في RabahDj! اضغط على «ابدأ الآن» للانضمام."
      );

      const hideTimer = setTimeout(() => {
        setNotification(null);
      }, 4000);

      return () => clearTimeout(hideTimer);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: Film,
      label: "سينما وتلفاز",
      color: "from-red-600 to-red-800",
      bgColor: "bg-red-500/20",
      path: "/cinema",
    },
    {
      icon: Radio,
      label: "بث مباشر",
      color: "from-purple-600 to-purple-800",
      bgColor: "bg-purple-500/20",
      path: "/live",
    },
    {
      icon: MessageCircle,
      label: "محادثات فورية",
      color: "from-blue-600 to-blue-800",
      bgColor: "bg-blue-500/20",
      path: "/chat",
    },
    {
      icon: Mic,
      label: "تخاطب لاسلكي",
      color: "from-green-600 to-green-800",
      bgColor: "bg-green-500/20",
      path: "/walkie",
    },
  ];

  return (
    <main
      dir="rtl"
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden bg-slate-950"
    >
      {/* Background Decoration */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-slideIn">
          <div className="glass rounded-2xl p-4 shadow-2xl max-w-md mx-auto flex items-center justify-between gap-3">
            <p className="text-white text-sm">
              {notification}
            </p>

            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white shrink-0"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Side Controls */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
        {/* Notifications */}
        <button
          onClick={() => {
            setNotification("مرحباً بك في RabahDj!");
          }}
          className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-white hover:bg-white/10 transition-all"
          aria-label="الإشعارات"
        >
          <Bell className="w-6 h-6" />
        </button>

        {/* Volume */}
        <div className="glass rounded-2xl p-3 flex flex-col items-center gap-3">
          <Volume2 className="w-5 h-5 text-blue-400" />

          <div className="h-32 w-1 bg-slate-700 rounded-full relative">
            <div
              className="absolute bottom-0 left-0 w-full bg-blue-500 rounded-full transition-all"
              style={{ height: `${volume}%` }}
            />

            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="absolute cursor-pointer opacity-0"
              style={{
                transform: "rotate(-90deg)",
                width: "128px",
                height: "4px",
                top: "50%",
                left: "50%",
                marginLeft: "-64px",
                marginTop: "-2px",
              }}
              aria-label="مستوى الصوت"
            />
          </div>

          <span className="text-xs text-slate-400">
            {volume}%
          </span>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((value) => !value)}
            className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-white hover:bg-white/10 transition-all"
            aria-label="القائمة"
          >
            {showMenu ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {showMenu && (
            <div className="absolute left-16 bottom-0 w-52 glass rounded-2xl p-3 shadow-2xl">
              <p className="text-white font-bold text-sm mb-3 text-right">
                القائمة السريعة
              </p>

              <button
                onClick={() => {
                  setShowMenu(false);
                  router.push("/home");
                }}
                className="w-full text-right px-3 py-3 rounded-xl text-slate-200 hover:bg-white/10 transition-all"
              >
                🏠 الرئيسية
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  router.push("/chat");
                }}
                className="w-full text-right px-3 py-3 rounded-xl text-slate-200 hover:bg-white/10 transition-all"
              >
                💬 المحادثات
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  router.push("/live");
                }}
                className="w-full text-right px-3 py-3 rounded-xl text-slate-200 hover:bg-white/10 transition-all"
              >
                📡 البث المباشر
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  router.push("/games");
                }}
                className="w-full text-right px-3 py-3 rounded-xl text-slate-200 hover:bg-white/10 transition-all"
              >
                🎮 الألعاب
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  router.push("/cinema");
                }}
                className="w-full text-right px-3 py-3 rounded-xl text-slate-200 hover:bg-white/10 transition-all"
              >
                🎬 السينما
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center max-w-md w-full animate-fadeIn relative z-10">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-2 tracking-tight">
            Rabah<span className="text-blue-500">Dj</span>
          </h1>

          <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full mb-4" />

          <p className="text-blue-400 text-xl font-medium">
            شبكتك الاجتماعية المحلية
          </p>
        </div>

        {/* Local Network */}
        <div className="flex items-center justify-center gap-2 mb-3 text-slate-400">
          <WifiOff className="w-5 h-5" />

          <span className="text-sm">
            اتصل، شارك، وابث صوتاً وفيديو مع أصدقائك
          </span>
        </div>

        <p className="text-slate-500 text-sm mb-8">
          عبر شبكتك المحلية بدون إنترنت
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 mb-6 px-4">
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={() => router.push(feature.path)}
              className={`feature-card ${feature.bgColor} rounded-3xl p-6 flex flex-col items-center gap-3 cursor-pointer w-full hover:scale-105 transition-transform`}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}
              >
                <feature.icon className="w-8 h-8 text-white" />
              </div>

              <span className="text-white text-sm font-medium">
                {feature.label}
              </span>
            </button>
          ))}
        </div>

        {/* Games */}
        <div className="flex justify-center mb-10">
          <button
            onClick={() => router.push("/games")}
            className="feature-card bg-yellow-500/20 rounded-3xl p-6 flex flex-col items-center gap-3 cursor-pointer w-40 hover:scale-105 transition-transform"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-600 to-yellow-800 flex items-center justify-center shadow-lg">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>

            <span className="text-white text-sm font-medium">
              ألعاب
            </span>
          </button>
        </div>

        {/* Start */}
        <button
          onClick={() => router.push("/join")}
          className="btn-primary w-full max-w-xs py-4 rounded-full text-white font-bold text-lg flex items-center justify-center gap-3 mb-6 group mx-auto"
        >
          <span>ابدأ الآن</span>

          <ArrowRight className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* Admin */}
        <button
          onClick={() => router.push("/admin-pin")}
          className="flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 mx-auto"
        >
          <Shield className="w-5 h-5 text-yellow-500" />

          <span>دخول المسؤول</span>
        </button>

        {/* Version */}
        <p className="text-slate-600 text-sm">
          الإصدار 2.0.0
        </p>
      </div>
    </main>
  );
}
