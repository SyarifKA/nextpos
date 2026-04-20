"use client";

import { useEffect } from "react";

/**
 * Global safety net for Next.js 16 + React 19 + Turbopack dev bug where
 * History.pushState/replaceState can throw "Cannot read properties of null
 * (reading 'dispatchEvent')" during rapid navigation or hot reload.
 *
 * This wraps pushState/replaceState with a try-catch so the error doesn't
 * propagate and break the app. It does not affect production behavior.
 */
export default function HistoryPatch() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalPush = window.history.pushState.bind(window.history);
    const originalReplace = window.history.replaceState.bind(window.history);

    window.history.pushState = function (...args: Parameters<typeof originalPush>) {
      try {
        return originalPush(...args);
      } catch (err) {
        if (
          err instanceof TypeError &&
          /dispatchEvent/.test(err.message)
        ) {
          // swallow — caused by transient null target during HMR/hydration
          return;
        }
        throw err;
      }
    };

    window.history.replaceState = function (...args: Parameters<typeof originalReplace>) {
      try {
        return originalReplace(...args);
      } catch (err) {
        if (
          err instanceof TypeError &&
          /dispatchEvent/.test(err.message)
        ) {
          return;
        }
        throw err;
      }
    };

    return () => {
      window.history.pushState = originalPush;
      window.history.replaceState = originalReplace;
    };
  }, []);

  return null;
}
