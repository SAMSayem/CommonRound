import { authClient } from "@/lib/auth-client";
import type { ApiResponse } from "@/lib/types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

type ApiOptions = RequestInit & { authenticated?: boolean };

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { authenticated = false, headers: inputHeaders, ...requestOptions } = options;
  const headers = new Headers(inputHeaders);
  if (requestOptions.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated) {
    const { data, error } = await authClient.token();
    if (error || !data?.token) {
      throw new Error("Your session could not be verified. Please sign in again.");
    }
    headers.set("Authorization", `Bearer ${data.token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers,
    cache: "no-store",
  });

  let payload: ApiResponse<T> | { message?: string; error?: string } | null = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload && ("message" in payload ? payload.message : "error" in payload ? payload.error : undefined);
    throw new Error(message || `Request failed (${response.status}).`);
  }

  if (payload && "data" in payload) return payload.data as T;
  return payload as T;
}
