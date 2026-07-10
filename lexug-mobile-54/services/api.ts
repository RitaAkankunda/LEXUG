import axios from "axios";
import Constants from "expo-constants";
import { tokenStorage } from "@/services/tokenStorage";

const TOKEN_KEY = "lexug_auth_token";

export type AuthUser = {
  uid: string;
  email: string;
  displayName?: string;
};

export type AuthResponse = AuthUser & { token: string };

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatSource = {
  act: string;
  section: string;
  title: string;
  sourceUrl?: string;
};

export type ChatAnswer = {
  content: { type: string; text: string }[];
  model?: string;
  source?: string;
  sources: ChatSource[];
};

function getApiUrl() {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0];

  if (host) {
    return `http://${host}:3002`;
  }

  return "http://localhost:3002";
}

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error;
    if (typeof message === "string") return message;
    if (error.code === "ECONNABORTED" || !error.response) {
      return "Could not reach the server. Check your connection and try again.";
    }
  }
  return fallback;
}

export const authService = {
  async signup(email: string, password: string, displayName: string) {
    try {
      const response = await api.post<AuthResponse>("/api/auth/signup", {
        email,
        password,
        displayName,
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to create account"));
    }
  },

  async login(email: string, password: string) {
    try {
      const response = await api.post<AuthResponse>("/api/auth/login", {
        email,
        password,
      });
      await tokenStorage.setItem(TOKEN_KEY, response.data.token);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to log in"));
    }
  },

  async logout() {
    await tokenStorage.removeItem(TOKEN_KEY);
  },

  async getToken() {
    return tokenStorage.getItem(TOKEN_KEY);
  },
};

export const chatService = {
  async ask(messages: ChatMessage[]) {
    try {
      const response = await api.post<ChatAnswer>("/api/chat", { messages });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to get a response"));
    }
  },

  async saveConversation(
    conversationId: string,
    messages: ChatMessage[],
    question: string,
    answer: string
  ) {
    const response = await api.post("/api/chat/save", {
      conversationId,
      messages,
      question,
      answer,
    });
    return response.data;
  },

  async getHistory() {
    const response = await api.get("/api/chat/history");
    return response.data;
  },
};

export default api;
