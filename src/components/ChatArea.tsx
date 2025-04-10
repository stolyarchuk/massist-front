import useAutoScroll from "../hooks/useAutoScroll.ts";
import Message from "./Message.tsx";

interface Message {
  role: "user" | "assistant";
  content: string;
  loading?: boolean;
  error?: boolean;
}

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatArea = ({ messages, isLoading }: ChatAreaProps) => {
  const scrollContentRef = useAutoScroll(isLoading);

  // Check if we need to show a loading message
  const showLoadingMessage =
    isLoading &&
    !messages.some((msg) => msg.role === "assistant" && msg.content === "");

  return (
    <div
      ref={scrollContentRef}
      className="grow space-y-4 bg-white dark:bg-dark-background"
    >
      {messages.map((message, idx) => (
        <Message
          key={idx}
          role={message.role}
          content={message.content}
          loading={
            message.role === "assistant" && message.content === "" && isLoading
          }
          error={message.error}
        />
      ))}

      {showLoadingMessage && (
        <Message role="assistant" content="" loading={true} />
      )}
    </div>
  );
};

export default ChatArea;
