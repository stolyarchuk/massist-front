import React from "react";
import Markdown from "react-markdown";
import userIcon from "../assets/images/user.svg";
import assistantIcon from "../assets/images/user.svg";

interface MessageProps {
  role: "user" | "assistant";
  content: string;
}

const Message: React.FC<MessageProps> = ({ role, content }) => {
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
          {role === "assistant" ? (
            <Markdown>{content}</Markdown>
          ) : (
            <div className="whitespace-pre-line">{content}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
