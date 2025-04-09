import useAutosize from "../hooks/useAutosize.ts";
import { useEffect, useRef } from "react";

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
  const inputFocusRef = useRef<HTMLTextAreaElement | null>(null);

  // Set focus to the input field when component mounts
  useEffect(() => {
    if (inputFocusRef.current) {
      inputFocusRef.current.focus();
    }
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      submitNewMessage();
    }
  }

  return (
    <div className="sticky bottom-0 bg-white dark:bg-dark-background py-4 mt-8">
      <div className="p-1.5 rounded-md z-50 font-mono origin-bottom animate-chat duration-400">
        <div className="p-0 bg-white dark:bg-dark-surface relative shrink-0 rounded-md overflow-hidden ring-slate-200 dark:ring-dark-border ring-1 focus-within:ring-slate-300 dark:focus-within:ring-dark-border/80 transition-all">
          <div className="absolute top-1/2 -translate-y-1/2 left-1">
            <button
              className="p-1 rounded-md bg-white dark:bg-dark-surface text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-40 disabled:cursor-not-allowed dark:disabled:text-dark-text/40 group relative transition-all duration-200 mr-1"
              disabled={true}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
              <span className="absolute -top-10 left-0 bg-gray-700 dark:bg-gray-800 text-white dark:text-gray-200 text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Attach file
              </span>
            </button>
          </div>
          <textarea
            className="block w-full max-h-[140px] py-2 px-3 pl-10 pr-10 bg-white dark:bg-dark-surface dark:text-dark-text rounded-md resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:leading-normal placeholder:align-middle focus:outline-none"
            ref={(element) => {
              // Assign the ref to both the autosize ref and our focus ref
              textareaRef.current = element;
              inputFocusRef.current = element;
            }}
            rows={1}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Поменяйте на свой текст"
          />
          <div className="absolute top-1/2 -translate-y-1/2 right-1">
            <button
              className="p-1 rounded-md bg-white dark:bg-dark-surface text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-40 disabled:cursor-not-allowed dark:disabled:text-dark-text/40 group relative transition-all duration-200"
              onClick={submitNewMessage}
              disabled={isLoading || !newMessage.trim()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 transition-colors text-gray-600 dark:text-gray-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13"></path>
                <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
              </svg>
              <span className="absolute -top-10 right-0 bg-gray-700 dark:bg-gray-800 text-white dark:text-gray-200 text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Send message
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-500 dark:text-dark-text/70 mt-2 text-center">
        AI-Generated content. Please review before use.
      </div>
    </div>
  );
};

export default ChatInput;
