import { create } from "zustand";

import { lessons } from "../constant";

type Library = { saved: string[]; completed: string[]; history: string[] };
type LibraryState = {
  library: Library;
  hydrate: () => void;
  update: (library: Library) => boolean;
};

export const useLibrary = create<LibraryState>((set) => ({
  library: { saved: [], completed: [], history: [] },
  hydrate: () => {
    try {
      const data = JSON.parse(
        localStorage.getItem("mora-english-library") || "null",
      );
      if (!data) return;
      const valid = (value: unknown) =>
        Array.isArray(value)
          ? value.filter(
              (id): id is string =>
                typeof id === "string" &&
                lessons.some((lesson) => lesson.id === id),
            )
          : [];
      set({
        library: {
          saved: valid(data.saved),
          completed: valid(data.completed),
          history: valid(data.history),
        },
      });
    } catch {
      /* Invalid or unavailable storage starts a fresh library. */
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
