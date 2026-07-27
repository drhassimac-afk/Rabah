"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Newspaper, Send, Shield } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      router.push("/home");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  const quickActions = [
    { icon: Newspaper, label: "الحائط", color: "bg-blue-500", path: "/wall" },
    { icon: Send, label: "مشاركة الملفات", color: "bg-purple-500", path: "/files" },
    { icon: Shield, label: "لوحة الإدارة", color: "bg-yellow-500", path: "/admin" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8">
      <div className="w-full max-w-sm animate-fadeIn text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-2xl animate-bounce-slow">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
        </div>

        {/* Welcome Message */}
        <h1 className="text-4xl font-bold text-white mb-2">
          تم الدخول
        </h1>
        <p className="text-slate-400 text-lg mb-2">
          👋 مرحباً <span className="text-blue-400">rabah</span>
        </p>

        {/* Quick Actions */}
        <div className="space-y-4 mt-10">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => router.push(action.path)}
              className={`w-full ${action.color} rounded-full py-4 px-6 flex items-center justify-center gap-3 text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-lg`}
            >
              <action.icon className="w-6 h-6" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        {/* Auto redirect hint */}
        <p className="mt-10 text-slate-500 text-sm">
          سيتم تحويلك تلقائياً خلال ثوانٍ...
        </p>
      </div>
    </div>
  );
}
