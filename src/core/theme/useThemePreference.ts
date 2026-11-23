import { useCallback, useSyncExternalStore } from "react";

export type ThemePreference = "light" | "dark";

const STORAGE_KEY = "fasiti-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

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
  window.matchMedia(DARK_QUERY).matches ? "dark" : "light";

/**
 * One shared store so every consumer (landing, auth) sees the same
 * choice at the same time. Until the visitor chooses, it follows the operating-system setting.
 */
let chosen: ThemePreference | null = typeof window === "undefined" ? null : readStoredTheme();
let current: ThemePreference = typeof window === "undefined" ? "light" : chosen ?? systemTheme();
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  const query = window.matchMedia(DARK_QUERY);
  const onSystemChange = (event: MediaQueryListEvent) => {
    if (chosen !== null) return;
    current = event.matches ? "dark" : "light";
    emit();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    chosen = readStoredTheme();
    current = chosen ?? systemTheme();
    emit();
  };
  query.addEventListener("change", onSystemChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    query.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorage);
  };
};

const setPreference = (next: ThemePreference) => {
  chosen = next;
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Not persisted when storage is blocked; the choice still applies for this visit
  }
  emit();
};

/**
 * The visitor's light/dark choice, remembered in localStorage (`fasiti-theme`).
 * Apply it by adding `dark` to a `.fasiti-theme` wrapper.
 */
export const useThemePreference = () => {
  const theme = useSyncExternalStore(subscribe, () => current, () => "light" as ThemePreference);
  const toggleTheme = useCallback(() => setPreference(current === "dark" ? "light" : "dark"), []);
  return { theme, toggleTheme };
};
