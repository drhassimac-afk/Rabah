"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle, XCircle, RotateCcw } from "lucide-react";

type Question = {
  question: string;
  options: string[];
  answer: number;
};

const questions: Question[] = [
  {
    question: "ما هي عاصمة الجزائر؟",
    options: ["وهران", "الجزائر", "عنابة", "قسنطينة"],
    answer: 1,
  },
  {
    question: "كم عدد أيام الأسبوع؟",
    options: ["5", "6", "7", "8"],
    answer: 2,
  },
  {
    question: "ما هو الكوكب المعروف بالكوكب الأحمر؟",
    options: ["الأرض", "المريخ", "المشتري", "الزهرة"],
    answer: 1,
  },
  {
    question: "كم يساوي 5 × 6؟",
    options: ["25", "30", "35", "40"],
    answer: 1,
  },
  {
    question: "ما هو أكبر محيط على الأرض؟",
    options: [
      "المحيط الأطلسي",
      "المحيط الهندي",
      "المحيط الهادئ",
      "المحيط المتجمد",
    ],
    answer: 2,
  },
];

export default function QuizPage() {
  const router = useRouter();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const question = questions[currentQuestion];

  const chooseAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);

    if (index === question.answer) {
      setScore((previous) => previous + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion === questions.length - 1) {
      setFinished(true);
      return;
    }

    setCurrentQuestion((previous) => previous + 1);
    setSelectedAnswer(null);
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setFinished(false);
  };

  if (finished) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-4" dir="rtl">
        <div className="max-w-md mx-auto pt-8">
          <button
            onClick={() => router.push("/games")}
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-8"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="glass rounded-3xl p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>

            <h1 className="text-3xl font-bold mb-3">انتهت المسابقة!</h1>

            <p className="text-slate-400 mb-6">نتيجتك</p>

            <div className="text-5xl font-bold text-green-400 mb-8">
              {score} / {questions.length}
            </div>

            <button
              onClick={restartGame}
              className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-500 font-bold flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              إعادة المسابقة
            </button>

            <button
              onClick={() => router.push("/games")}
              className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 font-bold mt-3"
            >
              العودة للألعاب
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4" dir="rtl">
      <div className="max-w-md mx-auto pt-8">
        <button
          onClick={() => router.push("/games")}
          className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-6"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">❓ المسابقة</h1>

          <div className="text-sm text-slate-400">
            النقاط: <span className="text-green-400 font-bold">{score}</span>
          </div>
        </div>

        <div className="h-2 bg-slate-800 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <div className="text-sm text-slate-500 mb-3">
          السؤال {currentQuestion + 1} من {questions.length}
        </div>

        <div className="glass rounded-3xl p-6">
          <h2 className="text-xl font-bold mb-6 leading-relaxed">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.answer;

              let className =
                "w-full p-4 rounded-2xl border text-right transition-all ";

              if (selectedAnswer === null) {
                className += "bg-slate-900 border-slate-700 hover:bg-slate-800";
              } else if (isCorrect) {
                className += "bg-green-500/20 border-green-500 text-green-300";
              } else if (isSelected) {
                className += "bg-red-500/20 border-red-500 text-red-300";
              } else {
                className += "bg-slate-900 border-slate-800 opacity-60";
              }

              return (
                <button
                  key={option}
                  onClick={() => chooseAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={className}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>

                    {selectedAnswer !== null && isCorrect && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}

                    {selectedAnswer !== null && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedAnswer !== null && (
            <button
              onClick={nextQuestion}
              className="w-full mt-6 py-4 rounded-2xl bg-green-600 hover:bg-green-500 font-bold"
            >
              {currentQuestion === questions.length - 1
                ? "عرض النتيجة"
                : "السؤال التالي"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
