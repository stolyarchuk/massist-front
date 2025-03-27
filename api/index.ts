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

interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

const API_BASE_URL = "http://127.0.0.1:8000"; // Replace with your actual API base URL

// -----------------------------------------------------------------------------
// API Client Implementation
// -----------------------------------------------------------------------------

const api = {
  /**
   * Create a new chat session
   */
  createChat: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/new`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating chat:", error);
      throw error;
    }
  },

  /**
   * Send a message to a chat session with optional streaming support
   */
  sendChatMessage: async (
    chatIdOrNew: string,
    message: string,
    onStreamChunk?: (chunk: StreamEvent) => void
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/${chatIdOrNew}`, {
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
  },
};

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

/**
 * Process a streaming response body
 */
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

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

// Export the API client for frontend use
export { api };

// -----------------------------------------------------------------------------
// Cloudflare Worker Implementation
// -----------------------------------------------------------------------------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);

      if (url.pathname.startsWith("/api/")) {
        // Proxy API requests to the backend
        const backendUrl = new URL(
          url.pathname.replace("/api", ""),
          API_BASE_URL
        );

        return await fetch(backendUrl.toString(), {
          method: request.method,
          headers: request.headers,
          body: request.body,
        });
      }

      // Serve static assets
      return await env.ASSETS.fetch(request);
    } catch (error) {
      console.error("Worker error:", error);

      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
} satisfies ExportedHandler<Env>;
