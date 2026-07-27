"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Radio, Video, Users, Mic, MicOff, VideoOff } from "lucide-react";

export default function LivePage() {
  const router = useRouter();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const activeStreams = [
    { id: 1, title: "بث تجريبي 1", user: "أحمد", viewers: 24, isLive: true },
    { id: 2, title: "بث مباشر", user: "سارة", viewers: 156, isLive: true },
    { id: 3, title: "لعبة جماعية", user: "محمد", viewers: 89, isLive: true },
  ];

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">بث مباشر</h1>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-slate-400">3 بثوث نشطة</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Start Stream Button */}
        <button
          onClick={() => setIsStreaming(!isStreaming)}
          className="w-full glass rounded-2xl p-6 mb-6 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
              <Video className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">ابدأ بثك الخاص</h2>
              <p className="text-slate-400 text-sm">شارك لحظاتك مع الأصدقاء</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-white -rotate-45" />
          </div>
        </button>

        {/* Stream Preview (if streaming) */}
        {isStreaming && (
          <div className="glass rounded-2xl p-4 mb-6">
            <div className="aspect-video bg-slate-800 rounded-xl flex items-center justify-center mb-4 relative">
              <span className="text-6xl">📹</span>
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-xs font-bold">مباشر</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isMuted ? "bg-red-500 text-white" : "bg-slate-700 text-white"
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isVideoOff ? "bg-red-500 text-white" : "bg-slate-700 text-white"
                }`}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsStreaming(false)}
                className="px-6 py-3 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-colors"
              >
                إيقاف البث
              </button>
            </div>
          </div>
        )}

        {/* Active Streams */}
        <h2 className="text-white font-bold text-lg mb-4">البثوث النشطة</h2>
        <div className="space-y-4">
          {activeStreams.map((stream) => (
            <div key={stream.id} className="glass rounded-2xl p-4">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl bg-slate-800 flex items-center justify-center text-3xl flex-shrink-0">
                  📺
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-bold">{stream.title}</h3>
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">
                      مباشر
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{stream.user}</p>
                  <div className="flex items-center gap-1 text-slate-500 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{stream.viewers} مشاهد</span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-purple-500 text-white rounded-full text-sm font-medium hover:bg-purple-600 transition-colors">
                  مشاهدة
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
