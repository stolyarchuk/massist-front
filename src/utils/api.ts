import { EventSourceParserStream } from "eventsource-parser/stream";
import { api } from "../../api";

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

// Export the API client from the api/index.ts file
export default api;
