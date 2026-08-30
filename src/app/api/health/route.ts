import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  let supabaseStatus: { connected: boolean; latencyMs?: number; error?: string } = {
    connected: false,
  };

  let isHealthy = true;

  // 1. Ping Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const dbPingStart = Date.now();
      const { data, error } = await supabase
        .from("site_settings")
        .select("id")
        .limit(1);

      const latencyMs = Date.now() - dbPingStart;

      if (error) {
        // If site_settings table isn't created yet, try raw connection query
        const fallbackCheck = await supabase.from("products").select("id").limit(1);
        if (fallbackCheck.error) {
          supabaseStatus = {
            connected: false,
            latencyMs,
            error: error.message || fallbackCheck.error.message,
          };
          isHealthy = false;
        } else {
          supabaseStatus = { connected: true, latencyMs };
        }
      } else {
        supabaseStatus = { connected: true, latencyMs };
      }
    } catch (err: any) {
      supabaseStatus = {
        connected: false,
        error: err.message || "Failed to reach Supabase endpoint",
      };
      isHealthy = false;
    }
  }

  // 2. Verify Local DB storage accessibility
  let localDbStatus = { accessible: true };
  try {
    const settings = await db.getSettings();
    if (!settings) {
      localDbStatus.accessible = false;
    }
  } catch {
    localDbStatus.accessible = false;
  }

  const totalTimeMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      message: isHealthy
        ? "Database and application services are active and running."
        : "Database connection degraded.",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      totalLatencyMs: totalTimeMs,
      database: {
        activeDriver: isSupabaseConfigured ? "supabase_postgresql" : "local_json_persistence",
        supabase: isSupabaseConfigured
          ? supabaseStatus
          : { configured: false, note: "Running in local JSON fallback mode" },
        localDisk: localDbStatus,
      },
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "X-Health-Status": isHealthy ? "OK" : "DEGRADED",
        "X-Response-Time": `${totalTimeMs}ms`,
      },
    }
  );
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "X-Health-Status": "OK",
      "Cache-Control": "no-store",
    },
  });
}
