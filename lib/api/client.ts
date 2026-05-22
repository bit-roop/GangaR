import { env } from "@/config/env";

type MockLatency = 300 | 600 | 1200;

type RequestOptions<T> = {
  mockData?: T;
  timeoutMs?: number;
  mockLatencyMs?: MockLatency;
  token?: string;
  headers?: Record<string, string>;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  baseUrl?: string;
  skipMock?: boolean;
};

export class ApiError extends Error {
  status?: number;
  code: string;
  url?: string;
  details?: string;

  constructor(message: string, code = "API_ERROR", status?: number, url?: string, details?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.url = url;
    this.details = details;
  }
}

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number) => {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new ApiError("The environmental data request timed out.", "TIMEOUT"));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
};

async function request<T>(path: string, options: RequestOptions<T> = {}): Promise<T> {
  const {
    mockData,
    timeoutMs = 4000,
    mockLatencyMs = 300,
    token,
    headers,
    method = "GET",
    body,
    baseUrl = env.apiBaseUrl,
    skipMock = false
  } = options;

  if (env.useMockData && !skipMock) {
    if (mockData === undefined) {
      throw new ApiError(`No mock payload configured for ${path}.`, "MOCK_DATA_MISSING");
    }

    return withTimeout(
      new Promise<T>((resolve) => {
        setTimeout(() => resolve(mockData), mockLatencyMs);
      }),
      timeoutMs
    );
  }

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers
  };
  const url = `${baseUrl}${path}`;

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await withTimeout(
      fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store"
      }),
      timeoutMs
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const details = error instanceof Error ? error.message : "Unknown network error";
    throw new ApiError(
      `Unable to reach the incident service at ${url}. Confirm the backend is running and CORS allows this origin.`,
      "NETWORK_ERROR",
      undefined,
      url,
      details
    );
  }

  if (!response.ok) {
    let responseDetails = "";

    try {
      responseDetails = await response.text();
    } catch {
      responseDetails = "";
    }

    throw new ApiError(
      `Request failed for ${method} ${url} with status ${response.status}.`,
      "HTTP_ERROR",
      response.status,
      url,
      responseDetails || response.statusText
    );
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions<T>) {
    return request<T>(path, { ...options, method: "GET" });
  },
  post<T>(path: string, options?: RequestOptions<T>) {
    return request<T>(path, { ...options, method: "POST" });
  },
  patch<T>(path: string, options?: RequestOptions<T>) {
    return request<T>(path, { ...options, method: "PATCH" });
  }
};
