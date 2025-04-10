type StreamEventData =
  | string
  | {
      event: "RunStarted" | "RunResponse" | "RunCompleted";
      content: string;
      content_type: string;
      session_id?: string;
      team_id?: string;
      // message?: string;
      [key: string]: string | number | boolean | null | undefined;
    };

export interface StreamEvent {
  event: "start" | "message" | "error" | "end" | "cancelled";
  data: StreamEventData;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  chat_id?: string;
  initial_message?: string;
}

export interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };

  API_URL: string;
  API_KEY: string;
}
