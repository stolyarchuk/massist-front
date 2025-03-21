import { EventSourceParserStream } from "eventsource-parser/stream";

export async function* parseSSEStream(stream) {
  const sseStream = stream
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new EventSourceParserStream());

  for await (const chunk of sseStream) {
    if (chunk.type === "event") {
      yield chunk.data;
    }
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
