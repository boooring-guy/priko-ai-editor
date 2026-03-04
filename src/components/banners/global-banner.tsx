"use client";

import {
  AlertCircleIcon,
  AlertTriangleIcon,
  BellIcon,
  ChevronDownIcon,
  InfoIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  allBannersAtom,
  bannerSheetOpenAtom,
  dismissAllBannersAtom,
  dismissBannerAtom,
  removeBannerAtom,
  visibleBannersAtom,
  type Banner,
  type BannerVariant,
} from "./banner-atoms";

// ─── Config ──────────────────────────────────────────────────────────────────

/** At most N banners stacked before "and X more…" appears */
const MAX_VISIBLE_STACK = 3;

const VARIANT_CONFIG: Record<
  BannerVariant,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    bg: string;
    border: string;
    iconColor: string;
    badgeClass: string;
  }
> = {
  error: {
    icon: AlertCircleIcon,
    label: "Error",
    bg: "bg-red-950/90",
    border: "border-red-800/60",
    iconColor: "text-red-400",
    badgeClass: "bg-red-900 text-red-200 border-red-700",
  },
  warning: {
    icon: AlertTriangleIcon,
    label: "Warning",
    bg: "bg-amber-950/90",
    border: "border-amber-800/60",
    iconColor: "text-amber-400",
    badgeClass: "bg-amber-900 text-amber-200 border-amber-700",
  },
  info: {
    icon: InfoIcon,
    label: "Info",
    bg: "bg-blue-950/90",
    border: "border-blue-800/60",
    iconColor: "text-blue-400",
    badgeClass: "bg-blue-900 text-blue-200 border-blue-700",
  },
  changelog: {
    icon: SparklesIcon,
    label: "Update",
    bg: "bg-violet-950/90",
    border: "border-violet-800/60",
    iconColor: "text-violet-400",
    badgeClass: "bg-violet-900 text-violet-200 border-violet-700",
  },
};

// ─── Single banner card ───────────────────────────────────────────────────────

function BannerCard({
  banner,
  compact = false,
  onDismiss,
  onRemove,
}: {
  banner: Banner;
  compact?: boolean;
  onDismiss?: (id: string) => void;
  onRemove?: (id: string) => void;
}) {
  const cfg = VARIANT_CONFIG[banner.variant];
  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-md transition-all",
        cfg.bg,
        cfg.border,
        compact ? "py-2.5" : "py-3",
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", cfg.iconColor)} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white/90">
            {banner.title}
          </span>
          <Badge
            variant="outline"
            className={cn("px-1.5 py-0 text-[10px]", cfg.badgeClass)}
          >
            {cfg.label}
          </Badge>
        </div>
        {!compact && (
          <p className="mt-0.5 text-xs text-white/60 leading-relaxed">
            {banner.message}
          </p>
        )}
        {!compact && banner.actionLabel && banner.actionHref && (
          <a
            href={banner.actionHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "mt-1.5 inline-block text-xs font-medium underline underline-offset-2",
              cfg.iconColor,
            )}
          >
            {banner.actionLabel} →
          </a>
        )}
        {compact && (
          <p className="text-[11px] text-white/50 truncate">{banner.message}</p>
        )}
      </div>

      {/* Dismiss / Remove */}
      {onDismiss && (
        <button
          onClick={() => onDismiss(banner.id)}
          className="shrink-0 rounded-md p-1 opacity-60 hover:opacity-100 hover:bg-white/10 transition-all"
          aria-label="Dismiss banner"
        >
          <XIcon className="size-3.5 text-white" />
        </button>
      )}
      {onRemove && (
        <button
          onClick={() => onRemove(banner.id)}
          className="shrink-0 rounded-md p-1 opacity-60 hover:opacity-100 hover:bg-white/10 transition-all"
          aria-label="Remove banner"
        >
          <XIcon className="size-3.5 text-white" />
        </button>
      )}
    </div>
  );
}

// ─── Sheet panel (full history) ───────────────────────────────────────────────

function BannerSheet() {
  const [open, setOpen] = useAtom(bannerSheetOpenAtom);
  const all = useAtomValue(allBannersAtom);
  const remove = useSetAtom(removeBannerAtom);
  const dismissAll = useSetAtom(dismissAllBannersAtom);

  const errorCount = all.filter((b) => b.variant === "error").length;
  const warningCount = all.filter((b) => b.variant === "warning").length;

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="max-h-[70vh] overflow-hidden rounded-t-2xl border-t border-white/10 bg-background/95 backdrop-blur-xl p-0"
      >
        <SheetHeader className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellIcon className="size-4 text-muted-foreground" />
              <SheetTitle className="text-base">
                System Notifications
              </SheetTitle>
              <div className="flex gap-1.5">
                {errorCount > 0 && (
                  <Badge className="bg-red-900/60 text-red-300 border-red-700 text-[10px] px-1.5">
                    {errorCount} error{errorCount > 1 ? "s" : ""}
                  </Badge>
                )}
                {warningCount > 0 && (
                  <Badge className="bg-amber-900/60 text-amber-300 border-amber-700 text-[10px] px-1.5">
                    {warningCount} warning{warningCount > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {all.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    all.forEach((b) => remove(b.id));
                    setOpen(false);
                  }}
                >
                  Clear all
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setOpen(false)}
              >
                <ChevronDownIcon className="size-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="overflow-y-auto px-5 py-4 space-y-3 max-h-[calc(70vh-80px)]">
          {all.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
              <BellIcon className="size-8 opacity-30" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            all.map((banner) => (
              <div key={banner.id} className="flex flex-col gap-1">
                <BannerCard banner={banner} onRemove={remove} />
                <span className="px-1 text-[10px] text-muted-foreground/60">
                  {formatTime(banner.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Stacked banner overlay (portal) ─────────────────────────────────────────

function BannerStack() {
  const visible = useAtomValue(visibleBannersAtom);
  const all = useAtomValue(allBannersAtom);
  const dismiss = useSetAtom(dismissBannerAtom);
  const dismissAll = useSetAtom(dismissAllBannersAtom);
  const setSheetOpen = useSetAtom(bannerSheetOpenAtom);

  const stack = visible.slice(0, MAX_VISIBLE_STACK);
  const overflow = visible.length - MAX_VISIBLE_STACK;
  const totalHistory = all.length;

  if (visible.length === 0 && totalHistory === 0) return null;

  return (
    <div
      className="fixed bottom-5 left-1/2 z-[9999] -translate-x-1/2 flex flex-col items-center gap-2"
      style={{ width: "min(560px, calc(100vw - 2rem))" }}
    >
      {/* Stacked banners: newest on top */}
      <div className="w-full flex flex-col gap-2">
        {stack.map((banner) => (
          <div
            key={banner.id}
            className="animate-in slide-in-from-bottom-4 fade-in duration-300"
          >
            <BannerCard banner={banner} onDismiss={dismiss} />
          </div>
        ))}
      </div>

      {/* Overflow pill OR history button */}
      {(overflow > 0 || totalHistory > 0) && (
        <div className="flex items-center gap-2">
          {overflow > 0 && (
            <button
              onClick={() => setSheetOpen(true)}
              className="rounded-full bg-background/80 border border-white/10 px-3 py-1 text-xs text-muted-foreground shadow-lg backdrop-blur-sm hover:text-foreground hover:bg-background transition-all"
            >
              +{overflow} more
            </button>
          )}
          {visible.length > 0 && (
            <button
              onClick={dismissAll}
              className="rounded-full bg-background/80 border border-white/10 px-3 py-1 text-xs text-muted-foreground shadow-lg backdrop-blur-sm hover:text-foreground hover:bg-background transition-all"
            >
              Dismiss all
            </button>
          )}
          {totalHistory > 0 && (
            <button
              onClick={() => setSheetOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-background/80 border border-white/10 px-3 py-1 text-xs text-muted-foreground shadow-lg backdrop-blur-sm hover:text-foreground hover:bg-background transition-all"
            >
              <BellIcon className="size-3" />
              View history ({totalHistory})
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Root export (portaled) ───────────────────────────────────────────────────

export function GlobalBanner() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      <BannerStack />
      <BannerSheet />
    </>,
    document.body,
  );
}
