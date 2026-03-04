import { NextResponse } from "next/server";
import { Pool } from "pg";
import { envs } from "@/envs";

// A separate throwaway pool just for health checks so we don't pollute
// the shared drizzle pool with connection errors on startup.
const healthPool = new Pool({
  connectionString: envs.DATABASE_URL,
  // short timeout so the health check fails fast
  connectionTimeoutMillis: 3000,
  idleTimeoutMillis: 1000,
  max: 1,
});

export async function GET() {
  try {
    const client = await healthPool.connect();
    try {
      await client.query("SELECT 1");
    } finally {
      client.release();
    }
    return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown database error";
    return NextResponse.json(
      { ok: false, error: message, timestamp: new Date().toISOString() },
      { status: 503 },
    );
  }
}
