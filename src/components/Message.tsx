import React from "react";
import Markdown from "react-markdown";
import Spinner from "./Spinner.tsx";
import ChatError from "./ChatError.tsx";
import userIcon from "../assets/images/user.svg";
import assistantIcon from "../assets/images/assistant.png";
import { ChatRole } from "../utils/types.ts";

interface MessageProps {
  role: ChatRole;
  content: string;
  loading?: boolean;
  error?: boolean;
}

const Message: React.FC<MessageProps> = ({ role, content, loading, error }) => {
  return (
    <div
      className={`flex items-start gap-4 py-4 px-3 rounded-xl ${
        role === "user" ? "bg-primary-blue/10" : ""
      }`}
    >
      {role === "user" ? (
        <img className="h-[26px] w-[26px] shrink-0" src={userIcon} alt="user" />
      ) : (
        <img
          className="h-[26px] w-[26px] shrink-0"
          src={assistantIcon}
          alt="assistant"
        />
      )}
      <div>
        <div className="markdown-container">
          {loading && !content ? (
            <Spinner />
          ) : role === "assistant" ? (
            <Markdown>{content}</Markdown>
          ) : (
            <div className="whitespace-pre-line">{content}</div>
          )}
        </div>
        {error && (
          <ChatError
            message="Error generating the response"
            className={content ? "mt-2" : ""}
          />
        )}
      </div>
    </div>
  );
};

export default Message;
