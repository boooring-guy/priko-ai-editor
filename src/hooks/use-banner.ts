import { useSetAtom } from "jotai";
import {
  pushBannerAtom,
  dismissBannerAtom,
  dismissAllBannersAtom,
  removeBannerAtom,
  bannerSheetOpenAtom,
  type BannerVariant,
} from "@/components/banners/banner-atoms";

/**
 * Convenience hook to push and manage global banners.
 *
 * @example
 * const { error, warning, info, changelog } = useBanner();
 * error("Database Error", "Could not connect to the database.");
 * changelog("v1.4.0 Released", "New editor features and bug fixes.", {
 *   actionLabel: "View changelog",
 *   actionHref: "/changelog",
 * });
 */
export function useBanner() {
  const push = useSetAtom(pushBannerAtom);
  const dismiss = useSetAtom(dismissBannerAtom);
  const dismissAll = useSetAtom(dismissAllBannersAtom);
  const remove = useSetAtom(removeBannerAtom);
  const setSheetOpen = useSetAtom(bannerSheetOpenAtom);

  function banner(
    variant: BannerVariant,
    title: string,
    message: string,
    opts?: { actionLabel?: string; actionHref?: string },
  ) {
    push({ variant, title, message, ...opts });
  }

  return {
    /** Push an error banner (e.g. service down). */
    error: (
      title: string,
      message: string,
      opts?: { actionLabel?: string; actionHref?: string },
    ) => banner("error", title, message, opts),

    /** Push a warning banner. */
    warning: (
      title: string,
      message: string,
      opts?: { actionLabel?: string; actionHref?: string },
    ) => banner("warning", title, message, opts),

    /** Push an informational banner. */
    info: (
      title: string,
      message: string,
      opts?: { actionLabel?: string; actionHref?: string },
    ) => banner("info", title, message, opts),

    /** Push a changelog / release banner. */
    changelog: (
      title: string,
      message: string,
      opts?: { actionLabel?: string; actionHref?: string },
    ) => banner("changelog", title, message, opts),

    /** Dismiss a single banner from the stack (keeps it in history). */
    dismiss,

    /** Dismiss all visible banners. */
    dismissAll,

    /** Remove a banner entirely (from history too). */
    remove,

    /** Open the notification history sheet. */
    openHistory: () => setSheetOpen(true),
  };
}
