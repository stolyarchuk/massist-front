import useAutoScroll from "../hooks/useAutoScroll.tsx";
import Message from "./Message.tsx";
import { ChatMessage } from "../utils/types.ts";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
  const scrollContentRef = useAutoScroll(isLoading);

  // Check if we need to show a loading message
  const showLoadingMessage =
    isLoading &&
    !messages.some((msg) => msg.role === "assistant" && msg.content === "");

  return (
    <div ref={scrollContentRef} className="grow flex flex-col justify-end">
      <div className="space-y-4">
        {messages.map((message, idx) => (
          <Message
            key={message.id || idx}
            role={message.role}
            content={message.content}
            loading={
              message.role === "assistant" &&
              message.content === "" &&
              isLoading
            }
            error={false}
          />
        ))}

        {showLoadingMessage && (
          <Message role="assistant" content="" loading={true} />
        )}
      </div>
    </div>
  );
};

export default ChatMessages;
