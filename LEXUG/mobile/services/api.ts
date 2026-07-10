import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

type AuthResponse = {
  uid: string;
  email: string;
  displayName?: string;
  token: string;
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

function getApiUrl() {
  const configuredUrl = Constants.expoConfig?.extra?.API_URL;

  if (typeof configuredUrl === 'string' && configuredUrl !== 'http://localhost:3002') {
    return configuredUrl;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];

  if (host) {
    return `http://${host}:3002`;
  }

  return 'http://localhost:3002';
}

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async signup(email: string, password: string, displayName: string) {
    const response = await api.post<AuthResponse>('/api/auth/signup', {
      email,
      password,
      displayName,
    });

    return response.data;
  },

  async login(email: string, password: string) {
    const response = await api.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });

    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userId', response.data.uid);
      await AsyncStorage.setItem('userEmail', response.data.email);
      if (response.data.displayName) {
        await AsyncStorage.setItem('userDisplayName', response.data.displayName);
      }
    }

    return response.data;
  },

  async logout() {
    await AsyncStorage.multiRemove(['authToken', 'userId', 'userEmail', 'userDisplayName']);
  },

  async getToken() {
    return await AsyncStorage.getItem('authToken');
  },

  async isAuthenticated() {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  },
};

export const chatService = {
  async chat(messages: ChatMessage[], system: string) {
    const response = await api.post('/api/chat', {
      messages,
      system,
    });
    return response.data;
  },

  async saveChat(
    conversationId: string,
    messages: ChatMessage[],
    question: string,
    answer: string
  ) {
    const response = await api.post('/api/chat/save', {
      conversationId,
      messages,
      question,
      answer,
    });
    return response.data;
  },

  async getHistory() {
    const response = await api.get<Record<string, unknown>>('/api/chat/history');
    return response.data;
  },

  async getConversation(conversationId: string) {
    const response = await api.get(`/api/chat/history/${conversationId}`);
    return response.data;
  },

  async deleteConversation(conversationId: string) {
    const response = await api.delete(`/api/chat/history/${conversationId}`);
    return response.data;
  },
};

export default api;
