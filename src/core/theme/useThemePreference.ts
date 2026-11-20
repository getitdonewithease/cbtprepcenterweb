import { useCallback, useEffect, useState } from "react";

export type ThemePreference = "light" | "dark";

const STORAGE_KEY = "fasiti-theme";

const readStoredTheme = (): ThemePreference | null => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    // Storage can be blocked (private mode, disabled site data): fall back to the OS setting
    return null;
  }
};

const systemTheme = (): ThemePreference =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

/**
 * The visitor's light/dark choice, remembered in localStorage. Until they choose, it
 * follows the operating-system setting and keeps following it if that changes.
 *
 * Scoped use for now: the landing page applies the returned theme to its own wrapper,
 * so the app screens are unaffected until they are redesigned for both themes.
 */
export const useThemePreference = () => {
  const [hasChoice, setHasChoice] = useState(() => readStoredTheme() !== null);
  const [theme, setTheme] = useState<ThemePreference>(() => readStoredTheme() ?? systemTheme());

  useEffect(() => {
    if (hasChoice) return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => setTheme(event.matches ? "dark" : "light");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [hasChoice]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: ThemePreference = current === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Not persisted when storage is blocked; the toggle still works for this visit
      }
      return next;
    });
    setHasChoice(true);
  }, []);

  return { theme, toggleTheme };
};
