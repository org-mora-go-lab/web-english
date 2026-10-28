import { create } from "zustand";

import { lessons } from "../constant";
import { songs } from "../song";

export { useBrowse } from "./browse";
export { useCaptionPreference } from "./captions";

type Library = { saved: string[]; completed: string[]; history: string[] };
type LibraryState = {
  ready: boolean;
  serverMode: boolean;
  syncError: boolean;
  library: Library;
  hydrate: () => Promise<void>;
  update: (library: Library) => boolean;
};

export const useLibrary = create<LibraryState>((set) => ({
  ready: false,
  serverMode: false,
  syncError: false,
  library: { saved: [], completed: [], history: [] },
  hydrate: async () => {
    try {
      const response = await fetch("/api/library", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        set({ ready: true, serverMode: true, syncError: false, library: data.library });
        return;
      }
      if (response.status !== 401) {
        set({ ready: true, serverMode: true, syncError: true, library: { saved: [], completed: [], history: [] } });
        return;
      }
    } catch {
      set({ ready: true, serverMode: true, syncError: true, library: { saved: [], completed: [], history: [] } });
      return;
    }
    try {
      const data = JSON.parse(
        localStorage.getItem("mora-english-library") || "null",
      );
      if (!data || typeof data !== "object") {
        set({
          ready: true, serverMode: false,
          library: { saved: [], completed: [], history: [] },
        });
        return;
      }
      const valid = (value: unknown) =>
        Array.isArray(value)
          ? [
              ...new Set(
                value.filter(
                  (id): id is string =>
                    typeof id === "string" &&
                    [...lessons, ...songs].some((lesson) => lesson.id === id),
                ),
              ),
            ]
          : [];
      set({
        ready: true, serverMode: false,
        library: {
          saved: valid(data.saved),
          completed: valid(data.completed),
          history: valid(data.history),
        },
      });
    } catch {
      set({ ready: true, serverMode: false, library: { saved: [], completed: [], history: [] } });
    }
  },
  update: (library) => {
    set({ library });
    if (useLibrary.getState().serverMode) {
      fetch("/api/library", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(library) })
        .then((response) => { if (!response.ok) throw new Error("sync failed"); set({ syncError: false }); })
        .catch(() => set({ syncError: true }));
      return true;
    }
    try {
      localStorage.setItem("mora-english-library", JSON.stringify(library));
      return true;
    } catch {
      return false;
    }
  },
}));
