"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Check, Delete, ArrowRight } from "lucide-react";

export default function AdminPinPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        // Check PIN (default: 1234)
        if (newPin === "1234") {
          setSuccess(true);
          setTimeout(() => {
            localStorage.setItem("rabahdj_admin", "true");
            router.push("/admin");
          }, 500);
        } else {
          setError(true);
          setTimeout(() => {
            setPin("");
            setError(false);
          }, 1000);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin("");
    setError(false);
  };

  const numbers = [
    ["3", "2", "1"],
    ["6", "5", "4"],
    ["9", "8", "7"],
  ];

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
        {/* Shield Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-600/30 to-yellow-800/30 flex items-center justify-center shadow-2xl border border-yellow-500/30">
            <Shield className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          لوحة الإدارة
        </h1>
        <p className="text-slate-400 text-center mb-10">
          أدخل رمز الدخول المكون من 4 أرقام
        </p>

        {/* PIN Dots */}
        <div className="flex justify-center gap-4 mb-12">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-5 h-5 rounded-full transition-all duration-300 ${
                error
                  ? "bg-red-500 animate-pulse"
                  : success
                  ? "bg-green-500 scale-125"
                  : index < pin.length
                  ? "bg-blue-500"
                  : "bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-400 text-center mb-6 animate-fadeIn">
            رمز غير صحيح!
          </p>
        )}

        {/* Success Message */}
        {success && (
          <p className="text-green-400 text-center mb-6 animate-fadeIn">
            تم التحقق!
          </p>
        )}

        {/* Number Pad */}
        <div className="space-y-4">
          {numbers.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-4">
              {row.map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  className="w-20 h-20 rounded-full bg-slate-800/80 text-white text-2xl font-bold hover:bg-slate-700 active:scale-95 transition-all shadow-lg border border-slate-700"
                  disabled={success}
                >
                  {num}
                </button>
              ))}
            </div>
          ))}
          
          {/* Bottom Row */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleClear}
              className="w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 active:scale-95 transition-all shadow-lg"
              disabled={success}
            >
              <Check className="w-8 h-8" />
            </button>
            <button
              onClick={() => handleNumberClick("0")}
              className="w-20 h-20 rounded-full bg-slate-800/80 text-white text-2xl font-bold hover:bg-slate-700 active:scale-95 transition-all shadow-lg border border-slate-700"
              disabled={success}
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="w-20 h-20 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all shadow-lg border border-slate-700"
              disabled={success}
            >
              <Delete className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Hint */}
        <p className="mt-10 text-center text-slate-600 text-sm">
          الرمز الافتراضي 1234 — غيّره فور الدخول
        </p>
      </div>
    </div>
  );
}
