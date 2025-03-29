export interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };

  API_KEY: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  chat_id?: string;
  initial_message?: string;
}

export class MassistWorker {
  private apiKey: string;

  constructor(env: Env) {
    this.apiKey = env.API_KEY; // From Cloudflare bindings
  }

  async getApiKey(): Promise<string> {
    return this.apiKey;
  }
}

declare module "hono" {
  export interface Hono {
    addHealthCheck(): Promise<void>;
    createChat(): Promise<ChatResponse>;
    sendChatMessage(
      chatId: string,
      message: ChatMessage
    ): Promise<ChatResponse>;
  }
}

import { Draft } from "immer";

export type ImmerSetter<T> = (f: (draft: Draft<T>) => void | T) => void;

export type ImmerState<T> = [T, ImmerSetter<T>];
