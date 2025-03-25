import React, { useState, useEffect, useRef } from "react";
import ChatInput from "./ChatInput.tsx";
import Message from "./Message.tsx";
// import { api } from "../../api";
import api, { parseSSEStream } from "../utils";

interface ChatMessage {
  role: "user" | "assistant";
  event: "RunCompleted" | "RunResponse" | "RunStarted";
  content: string;
}

const Chatbot: React.FC = () => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize chat on component mount
  useEffect(() => {
    initializeChat();
  }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initializeChat = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const chatData = await api.createChat();
      setChatId(chatData.chat_id);

      if (chatData.initial_message) {
        setMessages([
          {
            content: chatData.initial_message,
            role: "assistant",
            event: "RunResponse",
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to initialize chat:", err);
      setError("Failed to initialize chat. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (role: "user" | "assistant", content: string) => {
    setMessages((prev) => [...prev, { role, event: "RunResponse", content }]);
  };

  const updateLastAssistantMessage = (content: string) => {
    setMessages((prev) => {
      // Clone the messages array
      const updatedMessages = [...prev];

      // Find the last assistant message, if it exists
      const lastAssistantIndex = updatedMessages.findIndex(
        (msg) => msg.role === "assistant"
      );

      const onlyResponses = updatedMessages.findIndex(
        (msg) => msg.event === "RunResponse"
      );

      console.log(updatedMessages);

      if (onlyResponses != 0) return updatedMessages;

      // If found, update it; otherwise add a new message
      if (lastAssistantIndex !== -1) {
        updatedMessages[lastAssistantIndex] = {
          ...updatedMessages[lastAssistantIndex],
          content,
        };
      } else {
        updatedMessages.push({
          role: "assistant",
          event: "RunResponse",
          content,
        });
      }
      return updatedMessages;
    });
  };

  const submitNewMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const trimmedMessage = newMessage.trim();

    // Clear input and add user message
    setNewMessage("");
    addMessage("user", trimmedMessage);
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
            console.log("JSON chunk:", jsonChunk);

            // Extract content from the JSON object
            const content = jsonChunk.content || jsonChunk.data?.content || "";

            if (content) {
              fullResponse += content;
              updateLastAssistantMessage(fullResponse);
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
      <div className="flex-grow overflow-y-auto px-4 py-2">
        {messages.map((message, index) => (
          <Message key={index} content={message.content} role={message.role} />
        ))}

        {isLoading &&
          !messages.some((m) => m.role === "assistant" && m.content === "") && (
            <Message content="Thinking..." role="assistant" />
          )}

        {error && (
          <div className="text-red-500 mt-2 px-3 py-2 rounded bg-red-50">
            {error}
          </div>
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
