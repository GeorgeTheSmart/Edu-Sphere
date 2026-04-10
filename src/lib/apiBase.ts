/**
 * Backend base URL. Override in `.env.local`:
 * `NEXT_PUBLIC_API_BASE_URL=https://your-host.example.com`
 */
const DEFAULT_API_BASE = "https://d153-106-51-177-49.ngrok-free.app/";

export function getApiBaseUrl(): string {
  const env = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_BASE_URL?.trim() : "";
  if (env) return env.replace(/\/$/, "");
  return DEFAULT_API_BASE.replace(/\/$/, "");
}

/** Ngrok browser warning bypass (safe to send to non-ngrok origins). */
export const NGROK_SKIP_HEADERS: Record<string, string> = {
  "ngrok-skip-browser-warning": "69420",
};

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), {
    ...init,
    headers: {
      ...NGROK_SKIP_HEADERS,
      ...init?.headers,
    },
  });
}
