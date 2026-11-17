"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("resize", callback);
  window.visualViewport?.addEventListener("resize", callback);
  return () => {
    window.removeEventListener("resize", callback);
    window.visualViewport?.removeEventListener("resize", callback);
  };
}

function viewportHeight() {
  return window.visualViewport?.height ?? window.innerHeight;
}

export function useViewportHeight() {
  return useSyncExternalStore(subscribe, viewportHeight, () => undefined);
}
