"use client";

import { useEffect, useSyncExternalStore } from "react";

const key = "mora-english-theme";
let memory = "light";
function read() {
  try { const saved = localStorage.getItem(key); return saved === "dark" || saved === "light" ? saved : memory; }
  catch { return memory; }
}
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("mora-theme-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("mora-theme-change", callback);
  };
}

export function ThemePicker() {
  const theme = useSyncExternalStore(subscribe, read, () => "light");
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  return <label className="theme-picker">테마<select aria-label="테마" value={theme} onChange={event => {
    memory = event.target.value;
    try { localStorage.setItem(key, memory); } catch { /* Keep the choice for this visit. */ }
    document.documentElement.dataset.theme = memory;
    window.dispatchEvent(new Event("mora-theme-change"));
  }}><option value="light">라이트</option><option value="dark">다크</option></select></label>;
}
