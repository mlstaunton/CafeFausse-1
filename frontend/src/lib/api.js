const DEFAULT_API_ORIGIN = import.meta.env.DEV ? "http://localhost:5000" : "";

const RAW_API_ORIGIN = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_ORIGIN;
const API_ORIGIN = RAW_API_ORIGIN.replace(/\/$/, "");

export function apiUrl(path) {
  if (!path.startsWith("/")) {
    throw new Error("API path must start with '/'.");
  }
  return `${API_ORIGIN}${path}`;
}

export function apiOriginLabel() {
  if (API_ORIGIN) return API_ORIGIN;
  if (typeof window !== "undefined") return window.location.origin;
  return "same-origin";
}
