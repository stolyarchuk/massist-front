interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

const API_BASE_URL = "http://127.0.0.1:8000"; // Replace with your actual API base URL

// API client for frontend use
const api = {
  createChat: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/stolyarchuk`, {
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

  sendChatMessage: async (chatIdOrNew: string, message: string) => {
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

      return response.body;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },
};

// Export the API client for frontend use
export { api };

// Cloudflare worker handler
export default {
  fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      // Proxy API requests to the backend
      const backendUrl = new URL(
        url.pathname.replace("/api", ""),
        API_BASE_URL
      );

      return fetch(backendUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
    }

    // Serve static assets
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
