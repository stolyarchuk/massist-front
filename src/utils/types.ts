export interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };

  // Environment variables
  VITE_API_KEY: string;
  VITE_API_URL?: string;
  VITE_GREETING?: string;
  VITE_NODE_ENV?: string;
}

// Define the role type for chat messages
export type ChatRole = "user" | "assistant" | "system";

// Define the structure for chat messages
export interface ChatMessage {
  role: ChatRole;
  content: string;
  id?: string;
  timestamp?: Date | string;
  metadata?: Record<string, unknown>;
  error?: boolean; // Added error property for tracking error states in messages
}

// Define the response structure for chat initialization
export interface ChatResponse {
  chat_id: string;
  initial_message?: string;
  messages?: ChatMessage[];
  metadata?: Record<string, unknown>;
  created_at?: Date | string;
  updated_at?: Date | string;
}

// Define the structure for streaming response data
export interface StreamResponseData {
  content: string;
  last_chunk?: boolean;
}

export class MassistWorker {
  private apiKey: string;

  constructor(env: Env) {
    this.apiKey = env.VITE_API_KEY; // From Cloudflare bindings
  }

  async getApiKey(): Promise<string> {
    return this.apiKey;
  }
}

export class ChatState {
  chatId: string | null = null;

  constructor(chatId: string | null = null) {
    this.chatId = chatId;
  }

  setChatId(chatId: string | null): void {
    this.chatId = chatId;
    if (chatId) {
      this.setChatIdCookie(chatId);
    }
  }

  getChatId(): string | null {
    return this.chatId;
  }

  setChatIdCookie(chatId: string): void {
    console.log("chatId:", chatId);
    // Only set cookie if in browser environment
    if (typeof document !== "undefined") {
      document.cookie = `chat_id=${chatId}; path=/; max-age=${
        60 * 60 * 24 * 30
      }`; // 30 days expiry
    }
  }

  getChatIdFromCookie(): string | null {
    // Check if in browser environment

    if (typeof document === "undefined") return null;

    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "chat_id") {
        return value;
      }
    }
    return null;
  }
}

import { Draft } from "immer";

export type ImmerSetter<T> = (f: (draft: Draft<T>) => void | T) => void;
export type ImmerState<T> = [T, ImmerSetter<T>];
