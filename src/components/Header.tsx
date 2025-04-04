import React from "react";

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({
  title = "Mitigator AI Assistant",
}) => {
  return (
    <header className="py-4">
      <h1 className="header-title text-2xl font-bold text-center">{title}</h1>
    </header>
  );
};

export default Header;
