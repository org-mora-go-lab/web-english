import { create } from "zustand";

type Browse = { view: string; category: string; query: string; level: string; sort: string; scroll: number };
type BrowseState = Browse & { change: (patch: Partial<Browse>) => void; restore: () => void };
const initial: Browse = { view: "홈", category: "전체", query: "", level: "전체", sort: "추천순", scroll: 0 };
export const useBrowse = create<BrowseState>((set, get) => ({
  ...initial,
  change: (patch) => {
    set(patch);
    const { view, category, query, level, sort, scroll } = get();
    try { sessionStorage.setItem("mora-english-browse", JSON.stringify({ view, category, query, level, sort, scroll })); } catch { /* In-memory navigation still works. */ }
  },
  restore: () => {
    try {
      const value = JSON.parse(sessionStorage.getItem("mora-english-browse") || "null");
      if (!value || typeof value !== "object") return;
      const clean = { ...initial };
      for (const key of ["view", "category", "query", "level", "sort"] as const)
        if (typeof value[key] === "string") clean[key] = value[key];
      if (typeof value.scroll === "number" && Number.isFinite(value.scroll)) clean.scroll = Math.max(0, value.scroll);
      set(clean);
    } catch { /* Ignore unavailable or malformed session storage. */ }
  },
}));
