import { Hono } from "hono";
import { EventSourceParserStream } from "eventsource-parser/stream";
import { Env, ChatResponse } from "../src/utils/types.ts";

interface StreamEvent {
  event: "start" | "message" | "error" | "end" | "cancelled";
  data: StreamEventData;
}

type StreamEventData =
  | string
  | {
      content?: string;
      error?: string;
      type?: string;
      message?: string;
      [key: string]: string | number | boolean | null | undefined;
    };

declare module "hono" {
  interface Hono {
    createChat(): Promise<ChatResponse>;

    sendChatMessage(
      chatId: string,
      message: string,
      onStreamChunk?: (chunk: StreamEvent) => void
    ): Promise<ReadableStream | null>;
  }
}

const API_URL = import.meta.env.VITE_API_URL || "";
// const API_KEY = import.meta.env.VITE_API_KEY || "";

const api = new Hono<{ Bindings: Env }>();

api.createChat = async () => {
  console.log("creeeaaa");

  return { chat_id: "" };
};

api.sendChatMessage = async (
  chatId: string | "new",
  message: string,
  onStreamChunk?: (chunk: StreamEvent) => void
): Promise<ReadableStream | null> => {
  console.log("sendChatMessage", chatId);

  try {
    const response = await fetch(`${API_URL}/chat/${chatId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(response);

    // Handle streaming response
    if (onStreamChunk && response.body) {
      await processStreamingResponse(response.body, onStreamChunk);
      return null;
    }

    // For non-streaming responses, return the body as before
    return response.body;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

api.get("/api/", (c) => c.json({ name: "Cloudflare" }));

api.get("*", (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

// api.createChat
api.post("/chat/new", (c) => {
  console.log(c);

  c.req.path.concat(c.env.VITE_API_KEY, "/chat/new");

  console.log("context", c);

  return c.env.ASSETS.fetch(c.req.raw);
});

// api.post("/chats/undefined", (c) => {
//   console.log(c);

//   c.req.path.concat(c.env.VITE_API_KEY, "/chat/new");

//   console.log("context", c);

//   return { chat_id: "nnewww_adasdasd_ccchahhart" };
// });

async function processStreamingResponse(
  body: ReadableStream,
  onStreamChunk: (chunk: StreamEvent) => void
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const processStream = async (): Promise<void> => {
    const { value, done } = await reader.read();

    if (done) {
      // Process any remaining data in buffer
      if (buffer) {
        try {
          const event = JSON.parse(buffer) as StreamEvent;
          onStreamChunk(event);
        } catch (e) {
          console.error("Error parsing final stream chunk:", e);
        }
      }
      return;
    }

    // Decode the chunk and add it to our buffer
    const decodedValue = decoder.decode(value, { stream: true }); // Decoded value
    buffer += decodedValue;

    // Process complete JSON objects in buffer
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);

      if (line) {
        try {
          const event = JSON.parse(line) as StreamEvent;
          onStreamChunk(event);
        } catch (e) {
          console.error("Error parsing stream chunk:", e, line);
        }
      }
    }

    return processStream();
  };

  await processStream();
}

export async function* parseSSEStream(stream: ReadableStream) {
  const sseStream = stream
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new EventSourceParserStream());

  const reader = sseStream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value.type === "event") {
        yield value.data;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export default api;
