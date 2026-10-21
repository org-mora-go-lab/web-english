import { create } from "zustand";

type CaptionLanguage = "en" | "ko" | "off";
type CaptionPreference = {
  ready: boolean;
  language: CaptionLanguage;
  hydrate: () => void;
  change: (language: CaptionLanguage) => boolean;
};
const key = "mora-english-captions";

export const useCaptionPreference = create<CaptionPreference>((set) => ({
  ready: false,
  language: "en",
  hydrate: () => {
    let language: CaptionLanguage = "en";
    try {
      const stored = localStorage.getItem(key);
      if (stored === "en" || stored === "ko" || stored === "off") language = stored;
    } catch { /* Keep the default when storage is unavailable. */ }
    set({ ready: true, language });
  },
  change: (language) => {
    set({ language });
    try { localStorage.setItem(key, language); return true; }
    catch { return false; }
  },
}));
