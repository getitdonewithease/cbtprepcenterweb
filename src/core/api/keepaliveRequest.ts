import { getAccessToken } from "@/core/auth/tokenStorage";
import api from "./httpClient";

/**
 * A PUT that the browser finishes after the page has closed.
 *
 * Breaks DRY by not sending through the Axios instance: its interceptors run asynchronously, so the request
 * might never start during unload, and sendBeacon can neither PUT nor send a bearer token.
 * It cannot refresh an expired token, so use it only for best-effort saves on page exit.
 */
export const putWithKeepalive = async (path: string, body: unknown): Promise<void> => {
  const token = getAccessToken();
  await fetch(api.getUri({ url: path }), {
    method: "PUT",
    keepalive: true,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
};
