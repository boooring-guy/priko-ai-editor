"use client";

import { useEffect, useRef } from "react";
import { useSetAtom } from "jotai";
import {
  bannersAtom,
  dismissBannerAtom,
  pushBannerAtom,
} from "@/components/banners/banner-atoms";

const POLL_INTERVAL_MS = 30_000; // check every 30 s
const RETRY_INTERVAL_MS = 10_000; // retry faster when already down
const DB_BANNER_ID_PREFIX = "db-health-";

/**
 * Polls /api/health on mount and every POLL_INTERVAL_MS.
 * Pushes an error banner when the DB is unreachable and
 * auto-dismisses it when connectivity is restored.
 *
 * Mount this once inside a client component (e.g. Providers).
 */
export function useDbHealthCheck() {
  const push = useSetAtom(pushBannerAtom);
  const setBanners = useSetAtom(bannersAtom);
  const dismissBanner = useSetAtom(dismissBannerAtom);

  // Track current error banner id so we can dismiss the right one
  const errorBannerIdRef = useRef<string | null>(null);
  const isDownRef = useRef(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    async function check() {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        const data: { ok: boolean; error?: string } = await res.json();

        if (!data.ok || !res.ok) {
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }

        // ✅ DB is back online
        if (isDownRef.current) {
          isDownRef.current = false;

          // Dismiss the existing error banner and swap to a recovery info banner
          if (errorBannerIdRef.current) {
            dismissBanner(errorBannerIdRef.current);
            errorBannerIdRef.current = null;
          }

          // Push a brief "restored" info notice
          const recoveredId = `${DB_BANNER_ID_PREFIX}recovered-${Date.now()}`;
          setBanners((prev) => [
            {
              id: recoveredId,
              variant: "info",
              title: "Database Restored",
              message: "Connection to the database has been re-established.",
              createdAt: new Date().toISOString(),
              dismissed: false,
            },
            ...prev,
          ]);

          // Auto-dismiss the "restored" banner after 6 s
          setTimeout(() => {
            dismissBanner(recoveredId);
          }, 6000);
        }
      } catch (err) {
        // ❌ DB is down
        const msg =
          err instanceof Error ? err.message : "Unknown database error";

        if (!isDownRef.current) {
          isDownRef.current = true;

          // Inject the banner directly so we control its ID
          const id = `${DB_BANNER_ID_PREFIX}${Date.now()}`;
          errorBannerIdRef.current = id;

          setBanners((prev) => [
            {
              id,
              variant: "error",
              title: "Database Unavailable",
              message: `Could not connect to the database. ${msg}. Retrying automatically…`,
              createdAt: new Date().toISOString(),
              dismissed: false,
            },
            ...prev,
          ]);
        }

        // Retry faster while down
        timeoutId = setTimeout(check, RETRY_INTERVAL_MS);
        return;
      }

      timeoutId = setTimeout(check, POLL_INTERVAL_MS);
    }

    // First check on mount (slight delay so the UI has settled)
    timeoutId = setTimeout(check, 2000);

    return () => clearTimeout(timeoutId);
  }, [push, setBanners, dismissBanner]);
}
