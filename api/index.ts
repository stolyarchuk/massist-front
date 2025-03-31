import { Hono } from "hono";
// import { Env } from "./types.ts";
import { ChatResponse } from "./types.ts";

// type Bindings = {
//   ASSETS: {
//     fetch(request: Request): Promise<Response>;
//   };

//   API_URL: string;
// };

const api = new Hono<{ Bindings: Env }>();

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

api.get("/api/", (c) => c.json({ name: "Cloudflare" }));

api.get("*", async (c) => {
  return await c.env.ASSETS.fetch(c.req.raw);
});

api.post("/api/chat/:chat_id", async (c) => {
  console.log("c.env.API_URL /api/chat/:chat_id", c.env.API_URL);
  console.log("c.env.ASSETS /api/chat/:chat_id", c.env.ASSETS);

  const request = c.req.raw;
  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/")) {
    const backendUrl = new URL(
      url.pathname.replace("/api", "http://127.0.0.1:8000")
    );

    console.log("backendUrl", backendUrl.toString());

    return await fetch(new Request(backendUrl.toString()), {
      headers: request.headers,
      method: "POST",
      body: request.body,
    });
  }

  return c.env.ASSETS.fetch(c.req.raw);
});

api.post("/api/chat/new", async (c) => {
  console.log("c.env.API_URL /api/chat/new", c.env.API_URL);
  console.log("c.env.ASSETS /api/chat/new", c.env.ASSETS);

  const req = c.req.raw;
  const url = new URL(req.url);

  if (url.pathname.startsWith("/api/")) {
    const backendUrl = new URL(
      url.pathname.replace("/api", "http://127.0.0.1:8000")
    );

    console.log("backendUrl", backendUrl.toString());

    return await fetch(new Request(backendUrl.toString()), {
      headers: req.headers,
      method: "POST",
    });
  }

  return c.env.ASSETS.fetch(c.req.raw);
});

api.createChat = async (): Promise<ChatResponse> => {
  console.log("createChat");

  try {
    const response = await fetch(`/api/chat/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // console.log("response", response);

    // Handle streaming response
    // if (response.body) {
    //   await processStreamingResponse(response.body, onStreamChunk);
    //   // return null;
    // }

    // For non-streaming responses, return the body as before
    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

api.sendChatMessage = async (
  chatId: string | "new",
  message: string,
  onStreamChunk?: (chunk: StreamEvent) => void
): Promise<ReadableStream | null> => {
  console.log("sendChatMessage", chatId);
  console.log("sendChatMessage env");

  try {
    const response = await fetch(`/api/chat/${chatId}`, {
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


export default api;
