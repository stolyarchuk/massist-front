import { Hono } from "hono";
import { Env } from "../src/utils/types";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/", async (c) => {
  return c.json({ name: "Cloudflare" });
});

app.get("*", async (c) => {
  return await c.env.ASSETS.fetch(c.req.raw);
});

app.post("/api/chat/new", async (c) => {
  const request = c.req.raw;
  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/")) {
    const backendUrl = new URL(url.pathname.replace("/api", c.env.API_URL));

    return await fetch(new Request(backendUrl), {
      headers: request.headers,
      method: request.method,
      body: request.body,
    });
  }

  return await c.env.ASSETS.fetch(c.req.raw);
});

app.post("/api/chat/:chat_id", async (c) => {
  const request = c.req.raw;
  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/")) {
    const backendUrl = new URL(url.pathname.replace("/api", c.env.API_URL));

    return await fetch(backendUrl, {
      headers: request.headers,
      method: request.method,
      body: request.body,
    });
  }

  return await c.env.ASSETS.fetch(c.req.raw);
});

/* app.createChat = async (): Promise<ChatResponse> => {
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

    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

app.sendChatMessage = async (
  chatId: string | "new",
  message: string,
  onStreamChunk?: (chunk: StreamEvent) => void
): Promise<ReadableStream | null> => {
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
}; */

export default app;
