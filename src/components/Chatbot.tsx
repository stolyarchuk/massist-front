import { FC, useState, useEffect, useCallback } from "react";
import { useImmer } from "use-immer";
import ChatInput from "./ChatInput.tsx";
import ChatArea from "./ChatArea.tsx";
import ChatError from "./ChatError.tsx";
import { api } from "../utils/api.ts";
import { ChatMessage, ChatResponse } from "../utils/types.ts";

import {
  extractContentFromRunResponse,
  parseSSEStream,
} from "../utils/helpers.ts";

// Cookie utility functions
const setChatIdCookie = (chatId: string) => {
  document.cookie = `ma_chat_id=${chatId}; path=/; max-age=${
    60 * 60 * 24 * 30
  }`; // 30 days expiry
};

const getChatIdFromCookie = () => {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "ma_chat_id") {
      return value;
    }
  }
  return null;
};

const Chatbot: FC = () => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useImmer<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeChat = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const chatData = (await api.createChat()) as ChatResponse;

      if (chatData) {
        setChatId(chatData.chat_id || "undefined");
        setChatIdCookie(chatData.chat_id || "undefined");

        setMessages(() => {
          return [
            {
              content: chatData.initial_message || "Привет! Как я могу помочь?",
              role: "assistant",
            },
          ];
        });
      }
    } catch (err) {
      console.error("Failed to initialize chat:", err);
      setError("Failed to initialize chat. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [setMessages]);

  // const fetchPreviousMessages = useCallback(
  //   async (chatId: string) => {
  //     setIsLoading(true);
  //     try {
  //       const response = await fetch(`/api/messages/${chatId}`);
  //       if (response.ok) {
  //         const data = await response.json();

  //         console.log(data);
  //         console.log("parsed", JSON.parse(data));

  //         setMessages(data || []);

  //         // JSON.parse;
  //         // setMessages((prev) => [...prev, { role, content }]);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching previous messages:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   },
  //   [setMessages]
  // );

  // Initialize chat on component mount
  useEffect(() => {
    const storedChatId = getChatIdFromCookie();
    if (storedChatId) {
      setChatId(storedChatId);
      // fetchPreviousMessages(storedChatId);
    } else {
      initializeChat();
    }
  }, [initializeChat]); // Empty dependency array to run only once on mount

  const addMessage = (role: "user" | "assistant", content: string) => {
    setMessages((prev) => [...prev, { role, content }]);
  };

  const updateLastAssistantMessage = (content: string | undefined) => {
    if (content === undefined) return;

    setMessages((draft) => {
      // Find the last assistant message by searching in reverse order
      for (let i = draft.length - 1; i >= 0; i--) {
        if (draft[i].role === "assistant") {
          // Update the content of the last assistant message
          draft[i].content = content;
          return; // Early return since we're using Immer
        }
      }

      // If no assistant message found, add a new one
      draft.push({
        role: "assistant",
        content,
      });
    });
  };

  const submitNewMessage = async () => {
    const trimmedMessage = newMessage.trim();

    if (!trimmedMessage || isLoading) return;

    // Clear input and add user message
    addMessage("user", trimmedMessage);
    setNewMessage("");
    setIsLoading(true);
    setError(null);

    try {
      // Send message to API
      const responseStream = await api.sendChatMessage(
        chatId || "new",
        trimmedMessage
      );

      if (!responseStream) {
        throw new Error("No response stream received");
      }

      // Handle streaming response
      if (responseStream instanceof ReadableStream) {
        // Add initial empty assistant message that will be updated
        addMessage("assistant", "");

        let fullResponse = "";

        // Process each chunk from the stream
        for await (const chunk of parseSSEStream(responseStream)) {
          try {
            // Parse the chunk as JSON
            const jsonChunk =
              typeof chunk === "string" ? JSON.parse(chunk) : chunk;

            // Extract content from the JSON object
            const data = extractContentFromRunResponse(jsonChunk);

            if (data && !data.last_chunk) {
              fullResponse += data.content;
              updateLastAssistantMessage(fullResponse);
            } else if (data && data.last_chunk) {
              fullResponse = data.content || "";
              updateLastAssistantMessage(data.content);
            }
          } catch (error) {
            console.error("Error parsing chunk as JSON:", error, chunk);
            // Fallback to treating it as a plain string if JSON parsing fails
            fullResponse += String(chunk);
            updateLastAssistantMessage(fullResponse);
          }
        }
      } else {
        throw new Error("Expected a ReadableStream response");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please try again.");
      addMessage("assistant", "Error generating response.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative grow flex flex-col gap-6 pt-6">
      <ChatArea
        messages={messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))}
        isLoading={isLoading}
      />

      {error && (
        <ChatError
          message={error}
          className="mt-2 px-3 py-2 rounded bg-red-50"
        />
      )}

      <ChatInput
        newMessage={newMessage}
        isLoading={isLoading}
        setNewMessage={setNewMessage}
        submitNewMessage={submitNewMessage}
      />
    </div>
  );
};

export default Chatbot;
