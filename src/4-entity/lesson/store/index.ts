import { create } from "zustand";

import { lessons } from "../constant";

export { useBrowse } from "./browse";
export { useCaptionPreference } from "./captions";

type Library = { saved: string[]; completed: string[]; history: string[] };
type LibraryState = {
  ready: boolean;
  library: Library;
  hydrate: () => void;
  update: (library: Library) => boolean;
};

export const useLibrary = create<LibraryState>((set) => ({
  ready: false,
  library: { saved: [], completed: [], history: [] },
  hydrate: () => {
    try {
      const data = JSON.parse(
        localStorage.getItem("mora-english-library") || "null",
      );
      if (!data || typeof data !== "object") {
        set({
          ready: true,
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
                    lessons.some((lesson) => lesson.id === id),
                ),
              ),
            ]
          : [];
      set({
        ready: true,
        library: {
          saved: valid(data.saved),
          completed: valid(data.completed),
          history: valid(data.history),
        },
      });
    } catch {
      set({ ready: true, library: { saved: [], completed: [], history: [] } });
    }
  },
  update: (library) => {
    set({ library });
    try {
      localStorage.setItem("mora-english-library", JSON.stringify(library));
      return true;
    } catch {
      return false;
    }
  },
}));
