import useAutosize from "../hooks/useAutosize.ts";
import paperclipIcon from "../assets/images/paperclip.svg";

interface ChatInputProps {
  newMessage: string;
  isLoading: boolean;
  setNewMessage: (message: string) => void;
  submitNewMessage: () => void;
}

const ChatInput = ({
  newMessage,
  isLoading,
  setNewMessage,
  submitNewMessage,
}: ChatInputProps) => {
  const textareaRef = useAutosize({ value: newMessage });

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      submitNewMessage();
    }
  }

  return (
    <div className="sticky bottom-0 bg-white py-4 mt-8">
      <div className="p-1.5 bg-primary-blue/35 rounded-md z-50 font-mono origin-bottom animate-chat duration-400">
        <div className="pr-0.5 bg-white relative shrink-0 rounded-md overflow-hidden ring-primary-blue ring-1 focus-within:ring-2 transition-all">
          <textarea
            className="block w-full max-h-[140px] py-2 px-4 pr-11 bg-white rounded-md resize-none placeholder:text-primary-blue placeholder:leading-4 placeholder:-translate-y-1 sm:placeholder:leading-normal sm:placeholder:translate-y-0 focus:outline-none"
            ref={textareaRef}
            rows={1}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="absolute top-1/2 -translate-y-1/2 right-3">
            <button
              className="p-1 rounded-md hover:bg-primary-blue/20 group relative"
              onClick={() => alert("File attachment to be implemented...")}
            >
              <img src={paperclipIcon} alt="attach file" className="w-6 h-6" />
              <span className="absolute -top-10 right-0 bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                To be implemented...
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
