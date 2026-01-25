export const AUTH_TOKEN_STORAGE_KEY = "token" as const;

/**
 * Centralized access token storage.
 *
 * Note: This keeps the current behavior (localStorage) but centralizes it so
 * features don't touch storage directly.
 */
export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore storage errors (e.g. privacy mode)
  }
}

export function clearAccessToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

