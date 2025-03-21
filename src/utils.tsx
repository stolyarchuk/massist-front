import { EventSourceParserStream } from "eventsource-parser/stream";

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
  createChat: async () => {
    const response = await fetch("/api/chat", { method: "POST" });
    return await response.json();
  },
  sendChatMessage: async (chatIdOrNew: string, trimmedMessage: string) => {
    const response = await fetch(`/api/chat/${chatIdOrNew}`, {
      method: "POST",
      body: JSON.stringify({ message: trimmedMessage }),
    });
    return response.body;
  },
};

export default api;
