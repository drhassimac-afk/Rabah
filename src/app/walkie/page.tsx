"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mic, MicOff, Users, Radio, Volume2 } from "lucide-react";

export default function WalkieTalkiePage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(80);
  const [activeChannel, setActiveChannel] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);

  const channels = [
    { id: 1, name: "القناة العامة", users: 12 },
    { id: 2, name: "قناة الأصدقاء", users: 5 },
    { id: 3, name: "قناة العائلة", users: 8 },
  ];

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setLogs(prev => [...prev.slice(-4), `إرسال صوتي... ${new Date().toLocaleTimeString("ar")}`]);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/home")}
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">تخاطب لاسلكي</h1>
              <p className="text-xs text-slate-400">اضغط للتحدث</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Main PTT Button */}
        <div className="glass rounded-3xl p-8 mb-6 text-center">
          <button
            onMouseDown={() => setIsRecording(true)}
            onMouseUp={() => setIsRecording(false)}
            onTouchStart={() => setIsRecording(true)}
            onTouchEnd={() => setIsRecording(false)}
            className={`w-40 h-40 rounded-full mx-auto flex items-center justify-center transition-all duration-200 ${
              isRecording
                ? "bg-red-500 scale-95 shadow-red-500/50"
                : "bg-gradient-to-br from-green-600 to-green-800 shadow-green-500/30"
            } shadow-2xl`}
          >
            {isRecording ? (
              <MicOff className="w-16 h-16 text-white" />
            ) : (
              <Mic className="w-16 h-16 text-white" />
            )}
          </button>
          <p className={`mt-6 text-lg font-bold ${isRecording ? "text-red-400" : "text-white"}`}>
            {isRecording ? "جاري الإرسال..." : "اضغط للتحدث"}
          </p>
        </div>

        {/* Channels */}
        <div className="glass rounded-2xl p-4 mb-6">
          <h2 className="text-white font-bold mb-4">القنوات</h2>
          <div className="space-y-2">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel.id)}
                className={`w-full p-4 rounded-xl flex items-center justify-between transition-colors ${
                  activeChannel === channel.id
                    ? "bg-green-500/20 border border-green-500/50"
                    : "bg-slate-800/50 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Radio className={`w-5 h-5 ${activeChannel === channel.id ? "text-green-500" : "text-slate-500"}`} />
                  <span className={`font-medium ${activeChannel === channel.id ? "text-green-400" : "text-white"}`}>
                    {channel.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{channel.users}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Volume Control */}
        <div className="glass rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <Volume2 className="w-6 h-6 text-slate-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #22c55e 0%, #22c55e ${volume}%, #334155 ${volume}%, #334155 100%)`
              }}
            />
            <span className="text-white font-bold w-12">{volume}%</span>
          </div>
        </div>

        {/* Activity Log */}
        <div className="glass rounded-2xl p-4">
          <h2 className="text-white font-bold mb-4">سجل النشاط</h2>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-slate-500 text-center py-4">لا يوجد نشاط</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-slate-400">{log}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
