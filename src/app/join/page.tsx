"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, ArrowRight, Loader2 } from "lucide-react";

export default function JoinPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("الرجاء إدخال اسم المستخدم");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/auth/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store user in localStorage for session
        localStorage.setItem("rabahdj_user", JSON.stringify(data.user));
        router.push("/home");
      } else {
        setError(data.error || "حدث خطأ أثناء الانضمام");
      }
    } catch (err) {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 relative">
      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowRight className="w-6 h-6 rotate-180" />
      </button>

      <div className="w-full max-w-sm animate-fadeIn">
        {/* User Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-2xl border border-slate-600">
            <User className="w-12 h-12 text-blue-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          انضم للشبكة
        </h1>
        <p className="text-slate-400 text-center mb-10">
          أدخل اسمك للاتصال بالسيرفر المحلي
        </p>

        {/* Form */}
        <form onSubmit={handleJoin} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="رابح"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-white text-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-right"
              dir="rtl"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <div className="w-2 h-8 bg-blue-500 rounded-full" />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center animate-fadeIn">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-4 rounded-full text-white font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-white/30" />
            )}
          </button>
        </form>

        {/* Server Info */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 text-sm">
            السيرفر: 192.168.100.2:4000
          </p>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
    </div>
  );
}
