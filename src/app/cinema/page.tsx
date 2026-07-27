"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Film, Play, Star, Clock, Heart } from "lucide-react";

export default function CinemaPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "الكل" },
    { id: "movies", label: "أفلام" },
    { id: "series", label: "مسلسلات" },
    { id: "documentary", label: "وثائقي" },
  ];

  const movies = [
    { id: 1, title: "فيلم أكشن", category: "movies", rating: 4.5, duration: "2:30:00", image: "🎬" },
    { id: 2, title: "مسلسل دراما", category: "series", rating: 4.8, duration: "45:00", image: "📺" },
    { id: 3, title: "وثائقي طبيعة", category: "documentary", rating: 4.2, duration: "1:15:00", image: "🌍" },
    { id: 4, title: "فيلم كوميدي", category: "movies", rating: 4.0, duration: "1:45:00", image: "😂" },
    { id: 5, title: "مسلسل جريمة", category: "series", rating: 4.7, duration: "50:00", image: "🕵️" },
    { id: 6, title: "فيلم خيال علمي", category: "movies", rating: 4.6, duration: "2:15:00", image: "🚀" },
  ];

  const filteredMovies = selectedCategory === "all" 
    ? movies 
    : movies.filter(m => m.category === selectedCategory);

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
              <Film className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">سينما وتلفاز</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-red-500 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Featured */}
        <div className="glass rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <span className="text-red-400 text-sm font-medium">مميز</span>
            <h2 className="text-2xl font-bold text-white mt-2 mb-4">فيلم الأسبوع</h2>
            <div className="aspect-video bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-6xl">🎬</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">عنوان الفيلم</h3>
                <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>4.9</span>
                  <span>•</span>
                  <Clock className="w-4 h-4" />
                  <span>2:30:00</span>
                </div>
              </div>
              <button className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors">
                <Play className="w-6 h-6 text-white fill-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        <h2 className="text-white font-bold text-lg mb-4">المحتوى المتاح</h2>
        <div className="grid grid-cols-2 gap-4">
          {filteredMovies.map((movie) => (
            <div key={movie.id} className="glass rounded-2xl overflow-hidden group cursor-pointer">
              <div className="aspect-square bg-slate-800 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                {movie.image}
              </div>
              <div className="p-3">
                <h3 className="text-white font-medium text-sm mb-2">{movie.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span>{movie.rating}</span>
                  </div>
                  <button className="text-slate-500 hover:text-red-400">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
