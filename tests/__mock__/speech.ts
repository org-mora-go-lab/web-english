import type { Page } from "@playwright/test";

declare global {
  interface Window {
    __moraSpeech: {
      calls: { text: string; rate: number; lang: string }[];
      cancels: number;
      finish: () => void;
    };
  }
}

export async function mockSpeech(
  page: Page,
  mode: "normal" | "unsupported" | "error" | "stalled" = "normal",
) {
  await page.addInitScript((selectedMode) => {
    if (selectedMode === "unsupported") {
      Object.defineProperty(window, "speechSynthesis", {
        value: undefined,
        configurable: true,
      });
      Object.defineProperty(window, "SpeechSynthesisUtterance", {
        value: undefined,
        configurable: true,
      });
      return;
    }
    class Utterance {
      text: string;
      lang = "";
      rate = 1;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    }
    let active: Utterance | null = null;
    const state = {
      calls: [] as { text: string; rate: number; lang: string }[],
      cancels: 0,
      finish: () => {
        active?.onend?.();
        active = null;
      },
    };
    window.__moraSpeech = state;
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      value: Utterance,
    });
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        getVoices: () => [],
        cancel: () => {
          state.cancels++;
          const previous = active;
          active = null;
          if (previous) setTimeout(() => previous.onerror?.(), 0);
        },
        speak: (utterance: Utterance) => {
          active = utterance;
          state.calls.push({
            text: utterance.text,
            rate: utterance.rate,
            lang: utterance.lang,
          });
          if (selectedMode !== "stalled") utterance.onstart?.();
          if (selectedMode === "error") utterance.onerror?.();
        },
      },
    });
  }, mode);
}
