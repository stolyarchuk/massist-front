import React, { useState, useEffect, useRef } from "react";
import { useImmer } from "use-immer";
import ChatInput from "./ChatInput.tsx";
import ChatMessages from "./ChatMessages.tsx";
import ChatError from "./ChatError.tsx";
import api, { parseSSEStream } from "../utils/api.ts";
import { extractContentFromRunResponse } from "../utils/helpers.ts";

// Cookie utility functions
const setChatIdCookie = (chatId: string) => {
  document.cookie = `chat_id=${chatId}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days expiry
};

const getChatIdFromCookie = () => {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "chat_id") {
      return value;
    }
  }
  return null;
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  chat_id?: string;
  initial_message?: string;
}

const Chatbot: React.FC = () => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useImmer<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const initializeChat = async () => {
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
              content:
                chatData.initial_message || "Hello! How can I help you today?",
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
  };

  // Initialize chat on component mount
  useEffect(() => {
    const storedChatId = getChatIdFromCookie();
    if (storedChatId) {
      setChatId(storedChatId);
      // fetchPreviousMessages(storedChatId);
    } else {
      initializeChat();
    }
  }, []); // Empty dependency array to run only once on mount

  // const fetchPreviousMessages = async (chatId: string) => {
  //   setIsLoading(true);
  //   try {
  //     const response = await fetch(`/api/messages?chat_id=${chatId}`);
  //     if (response.ok) {
  //       const data = await response.json();
  //       setMessages(data.messages || []);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching previous messages:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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
    if (!newMessage.trim() || isLoading) return;

    const trimmedMessage = newMessage.trim();

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

            console.info("chunk: ", jsonChunk);

            // Extract content from the JSON object
            const data = extractContentFromRunResponse(jsonChunk);

            if (data && !data.last_chunk) {
              fullResponse += data.content;
              updateLastAssistantMessage(fullResponse);
            } else if (data && data.last_chunk) {
              // fullResponse = data.content;
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
    <div className="flex flex-col h-screen">
      <div className="flex-grow overflow-y-auto px-2 py-2">
        <ChatMessages
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

        <div ref={bottomRef} />
      </div>

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
