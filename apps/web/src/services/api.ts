import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig
} from "axios";
import { env } from "@/lib/env";
import {
  clearStoredAuth,
  getStoredAuth,
  setStoredToken
} from "@/lib/auth-storage";

type RefreshResponse = {
  token?: string;
  accessToken?: string;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

const apiBaseUrl = normalizeApiBaseUrl(env.apiUrl);

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json"
  }
});

const refreshApi = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json"
  }
});

function normalizeApiBaseUrl(baseUrl: string) {
  const normalized = baseUrl.replace(/\/+$/, "");

  if (normalized.endsWith("/api")) {
    return normalized;
  }

  return `${normalized}/api`;
}

function setAuthorizationHeader(
  config: AxiosRequestConfig | InternalAxiosRequestConfig,
  token: string
) {
  const headers = AxiosHeaders.from(config.headers);
  headers.set("Authorization", `Bearer ${token}`);
  config.headers = headers;
}

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((item) => {
    if (error || !token) {
      item.reject(error);
      return;
    }

    item.resolve(token);
  });

  failedQueue = [];
}

function isRefreshRequest(url?: string) {
  return Boolean(url?.includes("/auth/refresh"));
}

function isLoginRequest(url?: string) {
  return Boolean(url?.includes("/auth/login"));
}

api.interceptors.request.use((config) => {
  const { token } = getStoredAuth();

  if (token) {
    setAuthorizationHeader(config, token);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;

    if (!originalRequest || status !== 401) {
      return Promise.reject(error);
    }

    if (
      originalRequest._retry ||
      isRefreshRequest(originalRequest.url) ||
      isLoginRequest(originalRequest.url)
    ) {
      clearStoredAuth();
      return Promise.reject(error);
    }

    const { refreshToken } = getStoredAuth();

    if (!refreshToken) {
      clearStoredAuth();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({
          resolve,
          reject
        });
      }).then((token) => {
        setAuthorizationHeader(originalRequest, token);
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await refreshApi.post<RefreshResponse>("/auth/refresh", {
        refreshToken
      });
      const newToken = response.data.accessToken ?? response.data.token;

      if (!newToken) {
        throw new Error("Access token ausente na resposta de refresh.");
      }

      setStoredToken(newToken);
      processQueue(null, newToken);
      setAuthorizationHeader(originalRequest, newToken);

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearStoredAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
