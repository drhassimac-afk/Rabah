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

    const name = username.trim();

    if (!name) {
      setError("الرجاء إدخال اسم المستخدم");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "حدث خطأ أثناء الانضمام");
        return;
      }

      localStorage.setItem("rabahdj_user", JSON.stringify(data.user));
      router.push("/home");
    } catch (error) {
      console.error("Join error:", error);
      setError("تعذر الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden">
      <button
        type="button"
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 z-20 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowRight className="w-6 h-6 rotate-180" />
      </button>

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-2xl border border-slate-600">
            <User className="w-12 h-12 text-blue-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-2">
          انضم للشبكة
        </h1>

        <p className="text-slate-400 text-center mb-10">
          أدخل اسمك للاتصال بالسيرفر المحلي
        </p>

        <form onSubmit={handleJoin} className="space-y-4">
          <div className="relative z-20">
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError("");
              }}
              placeholder="رابح"
              autoComplete="name"
              autoCapitalize="words"
              inputMode="text"
              enterKeyHint="done"
              dir="rtl"
              disabled={isLoading}
              className="relative z-20 block w-full bg-slate-800/90 border border-slate-700 rounded-2xl px-6 py-4 pr-6 pl-10 text-white text-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
            />

            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 z-30">
              <div className="w-2 h-8 bg-blue-500 rounded-full" />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center animate-fadeIn">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="btn-primary relative z-20 w-full py-4 rounded-full text-white font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                جاري الدخول...
              </>
            ) : (
              "دخول"
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-slate-600 text-sm">السيرفر: 192.168.100.2:4000</p>
        </div>
      </div>

      <div className="pointer-events-none absolute top-1/4 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
    </div>
  );
}
