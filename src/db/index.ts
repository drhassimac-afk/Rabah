import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,

    // Neon يمكن أن يغلق الاتصالات الخاملة.
    // لا نحتفظ بعدد كبير من الاتصالات المفتوحة.
    max: 3,
    min: 0,

    // لا ننتظر إلى ما لا نهاية إذا انقطع الاتصال.
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,

    // مهلة الاستعلام.
    query_timeout: 15000,

    // مهلة اتصال SSL/TCP.
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });

pool.on("error", (error) => {
  console.error("[DB Pool Error]", error);
});

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
