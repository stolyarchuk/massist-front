import { EventSourceParserStream } from "eventsource-parser/stream";
import { ChatResponse } from "./types";

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

const api = {
  /**
   * Creates a new chat session
   */
  createChat: async (): Promise<ChatResponse> => {
    const response = await fetch("/api/chats", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to create chat: ${response.statusText}`);
    }

    return (await response.json()) as Promise<ChatResponse>;
  },

  /**
   * Sends a message to the chat API and returns a stream of responses
   * @param chatId The ID of the chat session
   * @param message The message content to send
   */
  sendChatMessage: async (
    chatId: string | "new",
    message: string
  ): Promise<ReadableStream> => {
    console.log("asdasdad", chatId);

    const response = await fetch(`/api/chats/${chatId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: message }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return response.body as ReadableStream;
  },
};

export default api;
