/**
 * Interface defining the structure of a RunResponse event
 */
interface RunResponseData {
  event: string;
  content?: string;
  role?: string;
  data?: {
    content?: string;
  };
  last_chunk: boolean;
}

/**
 * Extracts content from a JSON chunk only if the event is "RunResponse"
 * @param jsonChunk The JSON chunk to process
 * @returns The extracted content or null if the event is not "RunResponse"
 */
export function extractContentFromRunResponse(
  jsonChunk: unknown
): RunResponseData | null {
  try {
    // Parse the JSON if it's a string
    const data: RunResponseData =
      typeof jsonChunk === "string"
        ? JSON.parse(jsonChunk).data
        : typeof jsonChunk === "object" &&
          jsonChunk !== null &&
          "data" in jsonChunk
        ? (jsonChunk.data as RunResponseData)
        : ({} as RunResponseData);

    if (data && data.event === "RunResponse") {
      return data || null;
    }

    if (data && data.event === "RunCompleted") {
      data.last_chunk = true;
      return data || null;
    }

    // Return null if it's not a "RunResponse" event
    return null;
  } catch (error) {
    console.error("Error processing JSON chunk:", error);
    return null;
  }
}
