import { useState, useEffect, useRef, useCallback, FC } from "react";
import { useImmer } from "use-immer";
import ChatInput from "./ChatInput.tsx";
import ChatMessages from "./ChatMessages.tsx";
import ChatError from "./ChatError.tsx";
import api from "../utils/api";
import { parseSSEStream } from "../utils/api.ts";
import { ChatMessage, ChatState } from "../utils/types.ts";
import { extractContentFromRunResponse } from "../utils/helpers.ts";

const Chatbot: FC = () => {
  const [chatState] = useImmer<ChatState>(new ChatState());
  const [messages, setMessages] = useImmer<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useImmer<ChatMessage>({
    role: "user",
    content: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const initializeChat = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const chatData = await api.createChat();

      if (chatData) {
        const chatId = chatData.chat_id || "new";
        chatState.setChatId(chatId);

        setMessages(() => {
          return [
            {
              content:
                chatData.initial_message ||
                import.meta.env.VITE_GREETING ||
                "Hello! How can I help you today?",
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
  }, [chatState, setMessages]);

  // Initialize chat on component mount
  useEffect(() => {
    const savedChatId = chatState.getChatIdFromCookie();
    if (savedChatId) {
      chatState.setChatId(savedChatId);
      // If needed, you could fetch previous messages here
      // fetchPreviousMessages(savedChatId);
    } else {
      initializeChat();
    }
  }, [chatState, initializeChat]);

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
    const trimmedMessage = newMessage.content.trim();

    if (!trimmedMessage || isLoading) return;

    addMessage("user", trimmedMessage);
    setNewMessage((draft) => {
      draft.content = "";
    });
    setIsLoading(true);
    setError(null);

    try {
      // Send message to API
      const responseStream = await api.sendChatMessage(
        chatState.getChatId() || "new",
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
        setNewMessage={(content: string) =>
          setNewMessage((draft) => {
            draft.content = content;
          })
        }
        submitNewMessage={submitNewMessage}
      />
    </div>
  );
};

export default Chatbot;
