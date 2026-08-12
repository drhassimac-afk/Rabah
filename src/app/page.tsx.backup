"use client";

import { useState, useEffect } from "react";
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
  WifiOff
} from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const [volume, setVolume] = useState(70);
  const [showMenu, setShowMenu] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    // Show welcome notification
    const timer = setTimeout(() => {
      setNotification("مرحباً بك في RabahDj! اضغط على 'ابدأ الآن' للانضمام.");
      setTimeout(() => setNotification(null), 4000);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    { icon: Film, label: "سينما وتلفاز", color: "from-red-600 to-red-800", bgColor: "bg-red-500/20" },
    { icon: Radio, label: "بث مباشر", color: "from-purple-600 to-purple-800", bgColor: "bg-purple-500/20" },
    { icon: MessageCircle, label: "محادثات فورية", color: "from-blue-600 to-blue-800", bgColor: "bg-blue-500/20" },
    { icon: Mic, label: "تخاطب لاسلكي", color: "from-green-600 to-green-800", bgColor: "bg-green-500/20" },
    { icon: Gamepad2, label: "ألعاب", color: "from-yellow-600 to-yellow-800", bgColor: "bg-yellow-500/20" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-slideIn">
          <div className="glass rounded-2xl p-4 shadow-2xl max-w-md mx-auto">
            <p className="text-white text-sm">{notification}</p>
          </div>
        </div>
      )}

      {/* Side Menu */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-white hover:bg-white/10 transition-all"
        >
          <Bell className="w-6 h-6" />
        </button>
        <div className="glass rounded-2xl p-3 flex flex-col items-center gap-3">
          <Volume2 className="w-5 h-5 text-blue-400" />
          <div className="h-32 w-1 bg-slate-700 rounded-full relative">
            <div 
              className="absolute bottom-0 w-full bg-blue-500 rounded-full transition-all"
              style={{ height: `${volume}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ transform: "rotate(-90deg)", width: "128px", height: "4px", top: "50%", left: "50%", marginLeft: "-64px", marginTop: "-2px" }}
            />
          </div>
          <span className="text-xs text-slate-400">{volume}%</span>
        </div>
        <button className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-white hover:bg-white/10 transition-all">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="text-center max-w-md w-full animate-fadeIn">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-2 tracking-tight">
            Rabah<span className="text-blue-500">Dj</span>
          </h1>
          <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full mb-4" />
          <p className="text-blue-400 text-xl font-medium">شبكتك الاجتماعية المحلية</p>
        </div>

        {/* Local Network Badge */}
        <div className="flex items-center justify-center gap-2 mb-8 text-slate-400">
          <WifiOff className="w-5 h-5" />
          <span className="text-sm">اتصل، شارك، وابث صوتاً وفيديو مع أصدقائك</span>
        </div>
        <p className="text-slate-500 text-sm mb-8">عبر شبكتك المحلية بدون إنترنت</p>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 mb-10 px-4">
          {features.slice(0, 4).map((feature, index) => (
            <div
              key={index}
              className={`feature-card ${feature.bgColor} rounded-3xl p-6 flex flex-col items-center gap-3 cursor-pointer`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <span className="text-white text-sm font-medium">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Games Feature (Centered) */}
        <div className="flex justify-center mb-10">
          <div className="feature-card bg-yellow-500/20 rounded-3xl p-6 flex flex-col items-center gap-3 cursor-pointer w-40">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-600 to-yellow-800 flex items-center justify-center shadow-lg">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
            <span className="text-white text-sm font-medium">ألعاب</span>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={() => router.push("/join")}
          className="btn-primary w-full max-w-xs py-4 rounded-full text-white font-bold text-lg flex items-center justify-center gap-3 mb-6 group"
        >
          <span>ابدأ الآن</span>
          <ArrowRight className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* Admin Login */}
        <button
          onClick={() => router.push("/admin-pin")}
          className="flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <Shield className="w-5 h-5 text-yellow-500" />
          <span>دخول المسؤول</span>
        </button>

        {/* Version */}
        <p className="text-slate-600 text-sm">الإصدار 2.0.0</p>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
