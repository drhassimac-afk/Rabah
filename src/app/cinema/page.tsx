"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Film,
  Play,
  Star,
  Calendar,
  Info,
  Search,
  X,
} from "lucide-react";

type Movie = {
  id: number;
  title: string;
  originalTitle?: string;
  overview?: string;
  poster?: string | null;
  backdrop?: string | null;
  rating?: number;
  votes?: number;
  date?: string;
  mediaType: "movie" | "tv";
};

export default function CinemaPage() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState("movies");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [featured, setFeatured] = useState<Movie | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [search, setSearch] = useState("");

  const categories = [
    { id: "movies", label: "أفلام" },
    { id: "series", label: "مسلسلات" },
    { id: "documentary", label: "وثائقي" },
  ];

  useEffect(() => {
    loadMovies(selectedCategory);
  }, [selectedCategory]);

  async function loadMovies(category: string) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/cinema?category=${encodeURIComponent(category)}`
      );

      if (!response.ok) {
        throw new Error("فشل تحميل المحتوى");
      }

      const data = await response.json();

      if (!data.success || !Array.isArray(data.results)) {
        throw new Error("بيانات غير صالحة");
      }

      setMovies(data.results);

      if (data.results.length > 0) {
        setFeatured(data.results[0]);
      } else {
        setFeatured(null);
      }
    } catch (err) {
      console.error("Cinema error:", err);
      setError("تعذر تحميل محتوى TMDB");
      setMovies([]);
      setFeatured(null);
    } finally {
      setLoading(false);
    }
  }

  const filteredMovies = movies.filter((movie) => {
    const value = search.trim().toLowerCase();

    if (!value) return true;

    return (
      movie.title?.toLowerCase().includes(value) ||
      movie.originalTitle?.toLowerCase().includes(value)
    );
  });

  function getYear(date?: string) {
    if (!date) return "";
    return date.substring(0, 4);
  }

  return (
    <div
      className="min-h-screen bg-slate-950 text-white pb-24"
      dir="rtl"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/home")}
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition"
              >
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center">
                <Film className="w-5 h-5" />
              </div>

              <div>
                <h1 className="text-lg font-bold">سينما وتلفاز</h1>
                <p className="text-xs text-slate-400">
                  محتوى حقيقي من TMDB
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              متصل بـ TMDB
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن فيلم أو مسلسل..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pr-12 pl-4 outline-none focus:border-red-500 transition"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap font-medium transition ${
                selectedCategory === category.id
                  ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-950/40 border border-red-900 rounded-2xl p-5 text-center mb-6">
            <p className="text-red-300">{error}</p>

            <button
              onClick={() => loadMovies(selectedCategory)}
              className="mt-3 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-6">
            <div className="h-72 rounded-3xl bg-slate-900 animate-pulse" />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[2/3] rounded-2xl bg-slate-900 animate-pulse"
                />
              ))}
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Featured */}
            {featured && (
              <section className="relative overflow-hidden rounded-3xl min-h-[360px] md:min-h-[430px] mb-10 border border-slate-800">
                {featured.backdrop && (
                  <img
                    src={featured.backdrop}
                    alt={featured.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/10" />

                <div className="relative z-10 min-h-[360px] md:min-h-[430px] flex items-end p-6 md:p-10">
                  <div className="max-w-2xl">
                    <span className="inline-flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full text-xs font-bold mb-4">
                      <Play className="w-3 h-3 fill-current" />
                      مميز
                    </span>

                    <h2 className="text-3xl md:text-5xl font-black mb-3">
                      {featured.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300 mb-4">
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        {Number(featured.rating || 0).toFixed(1)}
                      </span>

                      {featured.votes ? (
                        <span>{featured.votes.toLocaleString("ar-DZ")} تقييم</span>
                      ) : null}

                      {featured.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {getYear(featured.date)}
                        </span>
                      )}
                    </div>

                    {featured.overview && (
                      <p className="text-slate-300 leading-7 line-clamp-3 mb-6">
                        {featured.overview}
                      </p>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedMovie(featured)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-500 px-5 py-3 rounded-xl font-bold transition"
                      >
                        <Info className="w-5 h-5" />
                        التفاصيل
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedCategory === "movies"
                    ? "الأفلام"
                    : selectedCategory === "series"
                      ? "المسلسلات"
                      : "الوثائقيات"}
                </h2>

                <p className="text-slate-500 text-sm mt-1">
                  {filteredMovies.length} نتيجة
                </p>
              </div>
            </div>

            {/* Movies */}
            {filteredMovies.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                لا توجد نتائج مطابقة.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredMovies.map((movie) => (
                  <article
                    key={movie.id}
                    className="group bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-red-500/50 transition cursor-pointer"
                    onClick={() => setSelectedMovie(movie)}
                  >
                    <div className="relative aspect-[2/3] bg-slate-800 overflow-hidden">
                      {movie.poster ? (
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-12 h-12 text-slate-600" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />

                      <div className="absolute bottom-3 right-3 left-3 opacity-0 group-hover:opacity-100 transition">
                        <button className="w-full bg-red-600 hover:bg-red-500 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                          <Info className="w-4 h-4" />
                          التفاصيل
                        </button>
                      </div>

                      {movie.rating !== undefined && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/75 backdrop-blur-sm rounded-lg px-2 py-1 text-xs">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          {Number(movie.rating).toFixed(1)}
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <h3 className="font-bold text-sm line-clamp-1">
                        {movie.title}
                      </h3>

                      <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                        <span>{getYear(movie.date)}</span>

                        {movie.votes ? (
                          <span>
                            {movie.votes.toLocaleString("ar-DZ")} تقييم
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Details Modal */}
      {selectedMovie && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedMovie(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-56 md:h-72">
              {selectedMovie.backdrop ? (
                <img
                  src={selectedMovie.backdrop}
                  alt={selectedMovie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-900" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />

              <button
                onClick={() => setSelectedMovie(null)}
                className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 -mt-10 relative">
              <div className="flex gap-5">
                {selectedMovie.poster && (
                  <img
                    src={selectedMovie.poster}
                    alt={selectedMovie.title}
                    className="hidden sm:block w-28 h-42 object-cover rounded-xl border border-slate-700 shadow-xl"
                  />
                )}

                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-black mb-3">
                    {selectedMovie.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      {Number(selectedMovie.rating || 0).toFixed(1)}
                    </span>

                    {selectedMovie.date && (
                      <span>{getYear(selectedMovie.date)}</span>
                    )}

                    {selectedMovie.votes ? (
                      <span>
                        {selectedMovie.votes.toLocaleString("ar-DZ")} تقييم
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {selectedMovie.overview && (
                <div className="mt-6">
                  <h3 className="font-bold mb-2">القصة</h3>
                  <p className="text-slate-400 leading-7">
                    {selectedMovie.overview}
                  </p>
                </div>
              )}

              <div className="mt-6 text-xs text-slate-600">
                بيانات الأفلام والصور مقدمة بواسطة TMDB.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
