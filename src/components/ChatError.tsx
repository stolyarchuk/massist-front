import React from "react";
import errorIcon from "../assets/images/error.svg";

interface ChatErrorProps {
  message: string;
  showIcon?: boolean;
  className?: string;
}

const ChatError: React.FC<ChatErrorProps> = ({
  message,
  showIcon = true,
  className = "",
}) => {
  if (!message) return null;

  return (
    <div className={`flex items-center gap-1 text-error-red ${className}`}>
      {showIcon && <img className="h-5 w-5" src={errorIcon} alt="error" />}
      <span>{message}</span>
    </div>
  );
};

export default ChatError;
