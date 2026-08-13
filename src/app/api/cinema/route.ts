import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category") || "all";
    const query = searchParams.get("query")?.trim();

    const token = process.env.TMDB_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "TMDB_ACCESS_TOKEN غير موجود في البيئة" },
        { status: 500 }
      );
    }

    let endpoint = "";

    if (query) {
      endpoint = `/search/multi?query=${encodeURIComponent(
        query
      )}&language=ar-DZ&page=1&include_adult=false`;
    } else if (category === "series") {
      endpoint =
        "/trending/tv/week?language=ar-DZ";
    } else if (category === "documentary") {
      endpoint =
        "/discover/movie?with_genres=99&language=ar-DZ&sort_by=popularity.desc&page=1";
    } else if (category === "movies") {
      endpoint =
        "/trending/movie/week?language=ar-DZ";
    } else {
      endpoint =
        "/trending/movie/week?language=ar-DZ";
    }

    const response = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("TMDB API Error:", response.status, errorText);

      return NextResponse.json(
        {
          error: "فشل الاتصال بـ TMDB",
          status: response.status,
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    const results = Array.isArray(data.results)
      ? data.results.map((item: any) => ({
          id: item.id,
          title:
            item.title ||
            item.name ||
            item.original_title ||
            item.original_name ||
            "بدون عنوان",
          originalTitle:
            item.original_title ||
            item.original_name ||
            "",
          overview: item.overview || "",
          poster: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : null,
          backdrop: item.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
            : null,
          rating: Number(item.vote_average || 0),
          votes: Number(item.vote_count || 0),
          date:
            item.release_date ||
            item.first_air_date ||
            null,
          mediaType: item.media_type || (
            category === "series" ? "tv" : "movie"
          ),
        }))
      : [];

    return NextResponse.json({
      success: true,
      page: data.page || 1,
      totalPages: data.total_pages || 1,
      results,
    });
  } catch (error) {
    console.error("Cinema API error:", error);

    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب بيانات السينما" },
      { status: 500 }
    );
  }
}
