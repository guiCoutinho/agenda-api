import axios from "axios";

const envBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const defaultBaseUrl = `${window.location.protocol}//${window.location.hostname}:8080`;

export const api = axios.create({
  // Priority: explicit env var > same-host backend on 8080.
  baseURL: envBaseUrl ?? defaultBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const messageFromBody = (error.response?.data as { message?: string } | undefined)?.message;
    if (typeof messageFromBody === "string" && messageFromBody.trim()) {
      return messageFromBody;
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  return fallback;
}
