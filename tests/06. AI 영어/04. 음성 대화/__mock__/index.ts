import type { Page } from "@playwright/test";

export async function mockVoice(page: Page) {
  await page.addInitScript({ content: `
    window.__voice = { starts: 0, cancels: 0, spoken: [], mic: null, speech: null };
    window.SpeechRecognition = class {
      start() { window.__voice.starts++; window.__voice.mic = this; }
      abort() {}
    };
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      getVoices: () => [], cancel: () => { window.__voice.cancels++; },
      speak: speech => { window.__voice.spoken.push(speech.text); window.__voice.speech = speech; }
    } });
  ` });
}

export async function say(page: Page, text: string) {
  await page.evaluate(text => {
    const controls = window as unknown as { __voice: { mic: { onresult: (event: unknown) => void } } };
    controls.__voice.mic.onresult({ results: [{ isFinal: true, 0: { transcript: text } }] });
  }, text);
}

export async function finishSpeaking(page: Page) {
  await page.evaluate(() => {
    (window as unknown as { __voice: { speech: { onend: () => void } } }).__voice.speech.onend();
  });
}

export const voiceStarts = (page: Page) => page.evaluate(() => (window as unknown as { __voice: { starts: number } }).__voice.starts);
