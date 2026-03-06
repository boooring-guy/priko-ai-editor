import { atom } from "jotai";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BannerVariant = "error" | "warning" | "info" | "changelog";

export type Banner = {
  id: string;
  variant: BannerVariant;
  title: string;
  message: string;
  /** ISO timestamp */
  createdAt: string;
  /** Whether it has been dismissed from the stacked view (but still in sheet history) */
  dismissed: boolean;
  /** Optional CTA label */
  actionLabel?: string;
  /** Optional CTA href or callback key */
  actionHref?: string;
};

// ─── Atoms ────────────────────────────────────────────────────────────────────

/**
 * The full stack of banners.
 * New banners are prepended (index 0 = newest).
 */
export const bannersAtom = atom<Banner[]>([]);

/**
 * Whether the banner detail Sheet is open.
 */
export const bannerSheetOpenAtom = atom<boolean>(false);

// ─── Write atoms ──────────────────────────────────────────────────────────────

/**
 * Push a new banner onto the stack.
 */
export const pushBannerAtom = atom(
  null,
  (get, set, banner: Omit<Banner, "id" | "createdAt" | "dismissed">) => {
    const id = `banner-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const next: Banner = {
      ...banner,
      id,
      createdAt: new Date().toISOString(),
      dismissed: false,
    };
    set(bannersAtom, [next, ...get(bannersAtom)]);
  },
);

/**
 * Dismiss a single banner from the stacked view (keeps it in sheet history).
 */
export const dismissBannerAtom = atom(null, (get, set, id: string) => {
  set(
    bannersAtom,
    get(bannersAtom).map((b) => (b.id === id ? { ...b, dismissed: true } : b)),
  );
});

/**
 * Remove a banner entirely (from history too).
 */
export const removeBannerAtom = atom(null, (get, set, id: string) => {
  set(
    bannersAtom,
    get(bannersAtom).filter((b) => b.id !== id),
  );
});

/**
 * Dismiss all currently visible banners.
 */
export const dismissAllBannersAtom = atom(null, (get, set) => {
  set(
    bannersAtom,
    get(bannersAtom).map((b) => ({ ...b, dismissed: true })),
  );
});

// ─── Derived ──────────────────────────────────────────────────────────────────

/** Banners that are still visible at the bottom (not dismissed). */
export const visibleBannersAtom = atom((get) =>
  get(bannersAtom).filter((b) => !b.dismissed),
);

/** All banners for the sheet history (newest first). */
export const allBannersAtom = atom((get) => get(bannersAtom));
